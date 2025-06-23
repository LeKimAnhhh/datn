from fastapi import APIRouter, Depends, HTTPException, Security, Query
from sqlalchemy.orm import Session
from invoice.models import Invoice, InvoiceItem, InvoiceServiceItem, Base
from users.main import role_required 
from users.models import User
from fastapi.security import HTTPBearer
from sqlalchemy import func
from database.main import engine  
from users.dependencies import get_db 
from sqlalchemy import or_, func, Integer, desc
from typing import Optional, List
from users.models import Account
from users.main import update_user_stats
from invoice.schema import ( 
    InvoiceCreate, InvoiceResponse, InvoiceListResponse, InvoiceUpdate
)
from products.models import Product
from invoice.models import Invoice, InvoiceItem, InvoiceServiceItem
from users.utils import calculate_invoice_total_and_status
from customers.models_cus import Customer, Transaction
from datetime import datetime, timedelta, timezone
import logging

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)
security_scheme = HTTPBearer()

router = APIRouter()


@router.post("/invoices", response_model=InvoiceResponse, dependencies=[Security(security_scheme)])
def create_invoice(
    data: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff", "collaborator"])
):
    try:
        if data.customer_id:
            customer = db.query(Customer).filter(Customer.id == data.customer_id, Customer.active == True).first()
            if not customer:
                raise HTTPException(status_code=404, detail="NOT_FOUND_CUSTOMER")
        else:
            customer = db.query(Customer).filter(Customer.full_name == "Khách Trắng").first()
            if not customer:
                raise HTTPException(status_code=404, detail="DEFAULT_CUSTOMER_'Khách Trắng'_NOT_FOUND")

        if data.user_id:
            user = db.query(User).filter(User.id == data.user_id, User.active == True).first()
            if not user:
                raise HTTPException(status_code=404, detail="NOT_FOUND_USER")
        else:
            pass

        invoice_items = []
        for item in data.items:
            product = db.query(Product).filter(Product.id == item.product_id, Product.active == True).first()
            
            if not product:
                raise HTTPException(status_code=404, detail=f"NOT_FOUND_PRODUCT_BY_ID_{item.product_id}.")

            print(f"Checking product {product.name}: dry_stock={product.dry_stock}, quantity={item.quantity}")

            if not product.dry_stock:
                raise HTTPException(status_code=400, detail=f"'{product.name}'_STOP_SELLING.")

            if data.branch == "Terra":
                if product.terra_stock < item.quantity:
                    db.rollback()
                    raise HTTPException(status_code=400, detail=f"PRODUCT_'{product.name}'_NOT_ENOUGH_IN_{data.branch}.")

            elif data.branch == "Thợ Nhuộm":
                if product.thonhuom_stock < item.quantity:
                    db.rollback()
                    raise HTTPException(status_code=400, detail=f"PRODUCT_'{product.name}'_NOT_ENOUGH_IN_{data.branch}.")

            else:
                db.rollback()
                raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")
            
            # price = product.price_retail
            if customer.group_id == 1 or customer.group_id == 4:
                price = product.price_wholesale
            else:
                price = product.price_retail

            invoice_item = InvoiceItem(
                product_id=item.product_id,
                quantity=item.quantity,
                price=price,
                discount_type=item.discount_type,
                discount=item.discount
            )
            invoice_items.append(invoice_item)

        service_items = []
        for sitem in data.service_items:
            new_sitem = InvoiceServiceItem(
                product_id=sitem.product_id,
                name=sitem.name,
                quantity=sitem.quantity,
                price=sitem.price,
                discount=sitem.discount
            )
            service_items.append(new_sitem)
        # invoice_status = "delivered" if not data.is_delivery else "ready_to_pick"
        # payment_status = "paid" if not data.is_delivery else "unpaid"
        invoice = Invoice(
            customer_id=customer.id,
            user_id=user.id,
            discount=data.discount,
            discount_type=data.discount_type,
            deposit=data.deposit,
            note=data.note,
            deposit_method=data.deposit_method,
            branch=data.branch,
            is_delivery=(data.is_delivery ),
            order_source =data.order_source ,
            items=invoice_items,
            service_items=service_items,
            extraCost=data.extraCost
        )

        calculate_invoice_total_and_status(invoice)
        

        last_id = db.query(func.max(func.cast(func.substr(Invoice.id, 3), Integer))).scalar()
        if last_id: 
            new_id = f"DH{last_id + 1}"
        else:
            new_id = "DH1"


        invoice.id = new_id

        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        if invoice.status == "delivered" and invoice.payment_status == "paid":
            for item in invoice_items:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product:
                    if data.branch == "Terra":
                        if product.terra_stock < item.quantity:
                            db.rollback()
                            raise HTTPException(status_code=400, detail=f"PRODUCT_'{product.name}'_NOT_ENOUGH_IN_{data.branch}.")
                        product.terra_stock -= item.quantity
                        # product.terra_can_sell -= item.quantity

                    elif data.branch == "Thợ Nhuộm":
                        if product.thonhuom_stock < item.quantity:
                            db.rollback()
                            raise HTTPException(status_code=400, detail=f"PRODUCT_'{product.name}'_NOT_ENOUGH_IN_{data.branch}.")
                        product.thonhuom_stock -= item.quantity
                        # product.thonhuom_can_sell -= item.quantity
                    else:
                        db.rollback()
                        raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")

        for item in invoice_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                if data.branch == "Terra":
                    if product.terra_can_sell < item.quantity:
                        db.rollback()
                        raise HTTPException(status_code=400, detail=f"PRODUCT_'{product.name}'_NOT_ENOUGH_IN_{data.branch}.")
                    product.terra_can_sell -= item.quantity

                elif data.branch == "Thợ Nhuộm":
                    if product.thonhuom_can_sell < item.quantity:
                        db.rollback()
                        raise HTTPException(status_code=400, detail=f"PRODUCT_'{product.name}'_NOT_ENOUGH_IN_{data.branch}.")
                    product.thonhuom_can_sell -= item.quantity
                else:
                    db.rollback()
                    raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")

        transaction_amount = 0  
        if invoice.payment_status == "partial_payment":
            transaction_amount = invoice.deposit  
        elif invoice.payment_status == "paid" and invoice.is_delivery and invoice.deposit > invoice.total_value:
            transaction_amount = invoice.deposit
        elif invoice.payment_status == "paid" and invoice.is_delivery:
            transaction_amount = invoice.total_value  

        if transaction_amount > 0:
            # Define the note based on payment_status
            transaction_note = None
            if invoice.payment_status == "partial_payment":
                transaction_note = f"Partial payment for invoice {invoice.id}"
            elif invoice.payment_status == "paid":
                transaction_note = f"Full payment for invoice {invoice.id}"

            new_transaction = Transaction(
                customer_id=customer.id,
                invoice_id=invoice.id,
                amount=transaction_amount,
                transaction_type="debt_increase",  
                note=transaction_note  # Add the note here
            )
            db.add(new_transaction)

        if invoice.payment_status == "partial_payment":
            customer.debt += invoice.deposit
            logger.info(f"Partial payment for invoice {invoice.id}: {invoice.deposit} added to customer {customer.id}'s debt.")
        elif invoice.payment_status == "paid" and invoice.is_delivery and invoice.deposit > invoice.total_value:
            customer.debt += invoice.deposit
            logger.info(f"Full payment for invoice {invoice.id}: {invoice.deposit} added to customer {customer.id}'s debt.")
        elif invoice.payment_status == "paid" and invoice.status == "ready_to_pick":
            customer.debt += invoice.total_value  
            logger.info(f"Customer {customer.id} debt updated for invoice {invoice.id}: {invoice.total_value} added to customer {customer.id}'s debt.")


#confirm -> add total
        user = db.query(User).filter(User.id == invoice.user_id).first()  
        # if invoice.is_delivery == 0:
        #     customer.total_spending += invoice.total_value
        #     user.total_revenue += invoice.total_value
        #     customer.total_order += 1
        #     user.total_orders += 1
        #     logger.info(f"customer {customer.id} total spending increased by {invoice.total_value} for invoice {invoice.id}.. User {user.id} total revenue increased ")

        # elif invoice.status == "ready_to_pick":
        #     # customer.total_order += 1
        #     # user.total_orders += 1
        #     logger.info(f"customer {customer.id} . User {user.id} total revenue increased ")
        ## invoice.status = "picking"
        db.commit()
        db.refresh(user)
        db.refresh(customer)
        logger.info(f"customer {customer.id} refreshed. User {user.id} refreshed. Invoice {invoice.id} refreshed.")
        # db.refresh(invoice)/

        # if user:
        #     update_user_stats(invoice.user_id, db)

        return invoice
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc

    except Exception as e:
        db.rollback()  
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/invoices/confirm/{invoice_id}", response_model=InvoiceResponse, dependencies=[Security(security_scheme)])
def confirm_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff", "developer"])
):
    try:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.active == True).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="INVOICE_NOT_FOUND")

        if invoice.status != "ready_to_pick":
            raise HTTPException(status_code=400, detail="ONLY_READY_TO_PICK_INVOICE_CAN_BE_CONFIRMED")

        invoice.status = "delivered"
        invoice.payment_status = "paid"

        for item in invoice.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                if invoice.branch == "Terra":
                    if product.terra_stock < item.quantity:
                        db.rollback()
                        raise HTTPException(
                            status_code=400,
                            detail=f"PRODUCT_{product.name}_NOT_ENOUGH_IN_{invoice.branch}"
                        )
                    product.terra_stock -= item.quantity
                elif invoice.branch == "Thợ Nhuộm":
                    if product.thonhuom_stock < item.quantity:
                        db.rollback()
                        raise HTTPException(
                            status_code=400,
                            detail=f"PRODUCT_{product.name}_NOT_ENOUGH_IN_{invoice.branch}"
                        )
                    product.thonhuom_stock -= item.quantity
                else:
                    raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")

        if not invoice.is_delivery:
            customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
            user = db.query(User).filter(User.id == invoice.user_id).first()

            if customer:
                customer.total_spending += invoice.total_value
                customer.total_order += 1
            if user:
                user.total_revenue += invoice.total_value
                user.total_orders += 1

        try:
            db.commit()
            db.refresh(invoice)
            if invoice.is_delivery:
                if customer:
                    db.refresh(customer)
                if user:
                    db.refresh(user)
            return invoice

        except Exception as commit_error:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error saving changes: {str(commit_error)}"
            )

    except HTTPException as http_exc:
        db.rollback()
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse, dependencies=[Security(security_scheme)])
def get_invoice(invoice_id: str, db: Session = Depends(get_db),
                current_user: Account = role_required(["admin", "staff"])):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(404, "NOT_FOUND")
    
    # calculate_invoice_total_and_status(invoice)
    return invoice

from suppliers.main_sup import normalize
# @router.get("/invoices", response_model=InvoiceListResponse, dependencies=[Security(security_scheme)])
# def list_invoices(
#     skip: int = 0,
#     limit: int = 10,
#     search: Optional[str] = Query(None, description="Tìm kiếm theo chi nhánh, ghi chú, tên khách hàng, hoặc số điện thoại khách hàng."),
#     statuses: Optional[List[str]] = Query(None, description="Danh sách các trạng thái cần tìm kiếm."),
#     db: Session = Depends(get_db),
#     current_user: Account = role_required(["admin", "staff", "collaborator", "warehouse_staff"])
# ):
#     query = db.query(Invoice).join(Customer, Invoice.customer_id == Customer.id, isouter=True).join(User, Invoice.user_id == User.id, isouter=True)

#     PAY_MAPPING = {
#         "unpaid": 'unpaid',
#         "partial_payment": 'partial_payment',
#         "paid": 'paid'
#     }

#     if statuses:
#         query = query.filter(Invoice.status.in_(statuses))
#     if search:
#         search_normalized = normalize(search)

#         invoices = query.all()  
#         filtered_invoices = [
#             invoice for invoice in invoices
#             if search_normalized in normalize(invoice.branch)
#             or search_normalized in normalize(invoice.id)
#             or search_normalized in normalize(invoice.note)
#             or search_normalized in normalize(invoice.status)
#             or normalize(PAY_MAPPING.get(invoice.payment_status)) == search_normalized
#             or (invoice.customer and search_normalized in normalize(invoice.customer.full_name))
#             or (invoice.customer and search_normalized in normalize(invoice.customer.phone))
#         ]
#     else:
#         filtered_invoices = query.all()

#     sorted_invoices = sorted(filtered_invoices, key=lambda bill: bill.created_at, reverse=True)
#     total_invoices = len(filtered_invoices)
#     invoices = sorted_invoices[skip: skip + limit]

#     return {
#         "total_invoices": total_invoices,
#         "invoices": invoices
#     }

@router.get("/invoices", response_model=InvoiceListResponse, dependencies=[Security(security_scheme)])
def list_invoices(
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = Query(None, description="Tìm kiếm theo chi nhánh, ghi chú, tên khách hàng, số điện thoại khách hàng hoặc trạng thái (phân cách bởi dấu phẩy)."),
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff", "collaborator", "warehouse_staff"])
):
    query = db.query(Invoice).join(Customer, Invoice.customer_id == Customer.id, isouter=True).join(User, Invoice.user_id == User.id, isouter=True)

    PAY_MAPPING = {
        "unpaid": 'unpaid',
        "partial_payment": 'partial_payment', 
        "paid": 'paid'
    }

    if search:
        search_normalized = normalize(search)
        search_terms = [normalize(term.strip()) for term in search.split(',')]

        invoices = query.all()
        filtered_invoices = [
            invoice for invoice in invoices
            if any([
                any(term in normalize(invoice.branch) for term in search_terms),
                any(term in normalize(invoice.id) for term in search_terms),
                any(term in normalize(invoice.note) for term in search_terms),
                any(term in normalize(invoice.status) for term in search_terms), 
                any(term == normalize(PAY_MAPPING.get(invoice.payment_status)) and 
                    not (term == normalize('unpaid') and invoice.status == 'cancel') 
                    for term in search_terms),             
                any(term in normalize(invoice.customer.full_name) for term in search_terms) if invoice.customer else False,
                any(term in normalize(invoice.customer.phone) for term in search_terms) if invoice.customer else False
            ])
        ]
    else:
        filtered_invoices = query.all()

    sorted_invoices = sorted(filtered_invoices, key=lambda bill: bill.created_at, reverse=True)
    total_invoices = len(filtered_invoices)
    invoices = sorted_invoices[skip: skip + limit]

    return {
        "total_invoices": total_invoices,
        "invoices": invoices
    }

@router.get("/active-transactions", response_model=InvoiceListResponse, dependencies=[Security(security_scheme)])
def get_invoices_with_active_transactions(
    limit: int = 10,
    skip: int = 0,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff"])
):
    try:
        active_transactions = db.query(Transaction).filter(
            Transaction.active == True,
            Transaction.invoice_id.isnot(None)
        ).all()
        
        invoice_ids = [t.invoice_id for t in active_transactions]
        invoices_query = db.query(Invoice).filter(
            Invoice.id.in_(invoice_ids)
        ).order_by(Invoice.created_at.desc())
                
        all_invoices = invoices_query.all()
        total_invoices = len(all_invoices)
        
        invoices = invoices_query.offset(skip).limit(limit).all()
        return {
            "total_invoices": total_invoices,
            "invoices": invoices
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/invoices/{invoice_id}", response_model=InvoiceResponse, dependencies=[Security(security_scheme)])
def update_invoice(
    invoice_id: str,
    data: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff"])
):
    try:
        invoice = db.query(Invoice).filter(
            Invoice.id == invoice_id,
            Invoice.active == True
        ).first()
        if not invoice:
            raise HTTPException(status_code=404, detail='NOT_FOUND')
        
        print(f"Invoice status : {invoice.status}")
        print(f"Received items: {data.items}") 

        if data.payment_status is not None:
            invoice.payment_status = data.payment_status
        if data.discount is not None:
            invoice.discount = data.discount
        if data.branch is not None:
            invoice.branch = data.branch
        if data.deposit is not None:
            invoice.deposit = data.deposit
        if data.note is not None:
            invoice.note = data.note
        if data.deposit_method is not None:
            invoice.deposit_method = data.deposit_method
        if data.expected_delivery is not None:
            invoice.expected_delivery = data.expected_delivery
        if data.extraCost is not None:
            invoice.extraCost = data.extraCost

        if invoice.status in ["ready_to_pick", "picking"]:
            if data.items is None:
                raise HTTPException(status_code=400, detail="ITEMS_REQUIRED")
            
            if len(data.items) == 0:
                raise HTTPException(status_code=400, detail="INVOICE_NO_PRODUCT")

            for old_item in invoice.items:
                product = db.query(Product).filter(Product.id == old_item.product_id).first()
                if product:
                    if invoice.branch == "Terra":
                        product.terra_can_sell += old_item.quantity
                    elif invoice.branch == "Thợ Nhuộm":
                        product.thonhuom_can_sell += old_item.quantity
                    else:
                        raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")

            new_ids = [it.id for it in data.items if it.id is not None and it.id > 0]
            old_items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).all()
            
            for old_item in old_items:
                if old_item.id not in new_ids:
                    db.delete(old_item)
            
            for item_update in data.items:
                if item_update.quantity < 1:
                    raise HTTPException(
                        status_code=400,
                        detail=f"{item_update.product_id}_QUANTITY_MUST_BE_GT_0"
                    )

                product = db.query(Product).filter(Product.id == item_update.product_id).first()
                if not product:
                    raise HTTPException(status_code=404, detail=f"PRODUCT_{item_update.product_id}_NOT_FOUND")

                if not item_update.id or item_update.id <= 0:
                    if invoice.branch == "Terra":
                        if product.terra_can_sell < item_update.quantity:
                            raise HTTPException(
                                status_code=400,
                                detail=f"PRODUCT_{product.name}_NOT_ENOUGH_IN_{invoice.branch}"
                            )
                        product.terra_can_sell -= item_update.quantity
                    elif invoice.branch == "Thợ Nhuộm":
                        if product.thonhuom_can_sell < item_update.quantity:
                            raise HTTPException(
                                status_code=400,
                                detail=f"PRODUCT_{product.name}_NOT_ENOUGH_IN_{invoice.branch}"
                            )
                        product.thonhuom_can_sell -= item_update.quantity
                    else:
                        raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")

                    new_item = InvoiceItem(
                        invoice_id=invoice.id,
                        product_id=item_update.product_id,
                        quantity=item_update.quantity,
                        price=item_update.price,
                        discount_type=item_update.discount_type,
                        discount=item_update.discount
                    )
                    db.add(new_item)

                else:
                    existing_item = db.query(InvoiceItem).filter(
                        InvoiceItem.id == item_update.id,
                        InvoiceItem.invoice_id == invoice.id
                    ).first()
                    if not existing_item:
                        raise HTTPException(
                            status_code=404,
                            detail=f"InvoiceItem_ID={item_update.id}_NOT_FOUND"
                        )

                    if invoice.branch == "Terra":
                        if product.terra_can_sell < item_update.quantity:
                            raise HTTPException(
                                status_code=400,
                                detail=f"PRODUCT_{product.name}_NOT_ENOUGH_IN_{invoice.branch}"
                            )
                        product.terra_can_sell += existing_item.quantity
                        product.terra_can_sell -= item_update.quantity
                    elif invoice.branch == "Thợ Nhuộm":
                        if product.thonhuom_can_sell < item_update.quantity:
                            raise HTTPException(
                                status_code=400,
                                detail=f"PRODUCT_{product.name}_NOT_ENOUGH_IN_{invoice.branch}"
                            )
                        product.thonhuom_can_sell += existing_item.quantity
                        product.thonhuom_can_sell -= item_update.quantity
                    else:
                        raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")

                    existing_item.quantity = item_update.quantity
                    existing_item.price = item_update.price
                    existing_item.discount = item_update.discount
                    existing_item.discount_type = item_update.discount_type

            if data.service_items is not None:
                invoice.service_items.clear()
                for sitem in data.service_items:
                    new_sitem = InvoiceServiceItem(
                        invoice_id=invoice.id,
                        product_id=sitem.product_id,
                        name=sitem.name,
                        quantity=sitem.quantity,
                        price=sitem.price,
                        discount=sitem.discount
                    )
                    db.add(new_sitem)

        else:
            if data.items is not None or data.service_items is not None:
                raise HTTPException(
                    status_code=400,
                    detail="CAN_NOT_UPDATE_WHEN_INVOICE_STATUS_IS_NOT_ready_to_pick"
                )

        transaction = db.query(Transaction).filter(Transaction.invoice_id == invoice.id).first()
        transaction_amount = 0
        if invoice.payment_status == "partial_payment":
            transaction_amount = invoice.deposit 
        elif invoice.payment_status == "paid" and invoice.is_delivery and invoice.deposit > invoice.total_value:
            transaction_amount = invoice.deposit  
        elif invoice.payment_status == "paid" and invoice.is_delivery and invoice.deposit < invoice.total_value:
            transaction_amount = invoice.deposit  
        elif invoice.payment_status == "unpaid" and invoice.is_delivery:
            transaction_amount = invoice.deposit
        elif invoice.payment_status == "paid" and invoice.is_delivery:
            transaction_amount = invoice.total_value 

        if transaction:
            previous_transaction_amount = transaction.amount  
            transaction.amount = transaction_amount
            transaction.note = f"Updated transaction for invoice {invoice.id}"  
        else:
            previous_transaction_amount = 0  
            new_transaction = Transaction(
                customer_id=invoice.customer_id,  
                invoice_id=invoice.id,
                amount=transaction_amount,
                transaction_type="debt_increase",  
                note=f"Transaction created for invoice {invoice.id}"
            )
            db.add(new_transaction)

        invoice.customer.debt -= previous_transaction_amount 
        invoice.customer.debt += transaction_amount
        db.commit()
        db.refresh(invoice) 
        calculate_invoice_total_and_status(invoice)

        try:
            db.commit()
            db.refresh(invoice)

            
            # if invoice.user_id:
            #     update_user_stats(invoice.user_id, db)
            
            return invoice
        except Exception as commit_error:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Error saving changes: {str(commit_error)}")

    except HTTPException as http_exc:
        db.rollback()
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
# @router.put("/invoices/{invoice_id}", response_model=InvoiceResponse, dependencies=[Security(security_scheme)])
# def update_invoice(
#     invoice_id: str,
#     data: InvoiceUpdate,
#     db: Session = Depends(get_db),
#     current_user: Account = role_required(["admin", "staff"])
# ):
#     try:
#         invoice = db.query(Invoice).filter(
#             Invoice.id == invoice_id,
#             Invoice.active == True
#         ).first()
#         if not invoice:
#             raise HTTPException(status_code=404, detail='NOT_FOUND')
        
#         print(f"Invoice status : {invoice.status}")
#         print(f"Received items: {data.items}") 
#         for old_item in invoice.items:
#             product = db.query(Product).filter(Product.id == old_item.product_id).first()
#             if product:
#                 if invoice.branch == "Terra":
#                     product.terra_can_sell += old_item.quantity
#                 elif invoice.branch == "Thợ Nhuộm":
#                     product.thonhuom_can_sell += old_item.quantity
#                 else:
#                     raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")

#         if data.payment_status is not None:
#             invoice.payment_status = data.payment_status
#         if data.discount is not None:
#             invoice.discount = data.discount
#         if data.branch is not None:
#             invoice.branch = data.branch
#         if data.deposit is not None:
#             invoice.deposit = data.deposit
#         if data.note is not None:
#             invoice.note = data.note
#         if data.deposit_method is not None:
#             invoice.deposit_method = data.deposit_method
#         if data.expected_delivery is not None:
#             invoice.expected_delivery = data.expected_delivery
#         if data.extraCost is not None:
#             invoice.extraCost = data.extraCost

#         if invoice.status in ["ready_to_pick", "picking"]:
#             if not data.items or len(data.items) == 0:
#                 raise HTTPException(status_code=400, detail="INVOICE_NO_PRODUCT.")

#             new_ids = [it.id for it in data.items if it.id]
#             old_items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).all()
#             for old_item in old_items:
#                 if old_item.id not in new_ids:
#                     db.delete(old_item)
#                     db.commit()

#             for item_update in data.items:
#                 if item_update.quantity < 1:
#                     raise HTTPException(
#                         status_code=400,
#                         detail=f"{item_update.product_id}_QUANTITY_MUST_BE_GT_0"
#                     )
#                 if not item_update.id or item_update.id <= 0:
#                     product = db.query(Product).filter(Product.id == item_update.product_id).first()
#                     if not product:
#                         raise HTTPException(status_code=404, detail=f"PRODUCT_{item_update.product_id}_NOT_FOUND")

#                     if invoice.branch == "Terra":
#                         if product.terra_can_sell < item_update.quantity:
#                             db.rollback()
#                             raise HTTPException(
#                                 status_code=400,
#                                 detail=f"PRODUCT_{product.name}_NOT_ENOUGH_IN_{invoice.branch}."
#                             )
#                         product.terra_can_sell -= item_update.quantity
#                     elif data.branch == "Thợ Nhuộm":
#                         if product.thonhuom_can_sell < item_update.quantity:
#                             db.rollback()
#                             raise HTTPException(
#                                 status_code=400,
#                                 detail=f"PRODUCT_{product.name}_NOT_ENOUGH_IN_{invoice.branch}."
#                             )
#                         product.thonhuom_can_sell -= item_update.quantity

#                     new_item = InvoiceItem(
#                         invoice_id=invoice.id,
#                         product_id=item_update.product_id,
#                         quantity=item_update.quantity,
#                         price=item_update.price,
#                         discount=item_update.discount
#                     )
#                     db.add(new_item)
#                     db.commit()
#                     if product:
#                         if data.branch == "Terra":
#                             product.terra_can_sell -= item_update.quantity
#                         elif data.branch == "Thợ Nhuộm":
#                             product.thonhuom_can_sell -= item_update.quantity
#                         else:
#                             raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")
#                              # product.can_sell -= item_update.quantity
#                         db.commit()

#                 else:
#                     existing_item = db.query(InvoiceItem).filter(
#                         InvoiceItem.id == item_update.id,
#                         InvoiceItem.invoice_id == invoice.id
#                     ).first()
#                     if not existing_item:
#                         raise HTTPException(
#                             status_code=404,
#                             detail=f"InvoiceItem_ID={item_update.id}_NOT_FOUND"
#                         )

#                     product = db.query(Product).filter(Product.id == item_update.product_id).first()
#                     if not product:
#                         raise HTTPException(
#                             status_code=404,
#                             detail=f"PRODUCT_{item_update.product_id}_NOT_FOUND"
#                         )

#                     if invoice.branch == "Terra":
#                         if product.terra_can_sell < item_update.quantity:
#                             raise HTTPException(
#                                 status_code=400,
#                                 detail=f"PRODUCT_{product.name}_NOT_ENOUGH_IN_{invoice.branch}."
#                             )
#                         product.terra_can_sell -= item_update.quantity
#                     elif data.branch == "Thợ Nhuộm":
#                         if product.thonhuom_can_sell < item_update.quantity:
#                             raise HTTPException(
#                                 status_code=400,
#                                 detail=f"PRODUCT_{product.name}_NOT_ENOUGH_IN_{invoice.branch}."
#                             )
#                         product.thonhuom_can_sell -= item_update.quantity

#         if invoice.status == "ready_to_pick" or invoice.status == "picking":
#             if data.items is None or len(data.items) == 0:
#                 raise HTTPException(status_code=400, detail="INVOICE_NO_PRODUCT.")
            
#             if data.items is not None:
#                 new_ids = [it.id for it in data.items if it.id is not None and it.id > 0]
#                 old_items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).all()
#                 for old_item in old_items:
#                     if old_item.id not in new_ids:
#                         db.delete(old_item)
#                         db.commit()

#             if data.service_items is not None:
#                 invoice.service_items.clear()  # xóa hết
#                 db.flush()
#                 for sitem in data.service_items:
#                     new_sitem = InvoiceServiceItem(
#                         invoice_id=invoice.id,
#                         product_id=sitem.product_id,
#                         name=sitem.name,
#                         quantity=sitem.quantity,
#                         price=sitem.price,
#                         discount=sitem.discount
#                     )
#                     db.add(new_sitem)

#         else:
#             if data.items is not None or data.service_items is not None:
#                 raise HTTPException(
#                     status_code=400,
#                     detail="CAN_NOT_UPDATE_WHEN_INVOICE_STATUS_IS_NOT_ready_to_pick"
#                 )
        
#         transaction = db.query(Transaction).filter(Transaction.invoice_id == invoice.id).first()

#         transaction_amount = 0  
#         if invoice.payment_status == "partial_payment":
#             transaction_amount = invoice.deposit 
#         elif invoice.payment_status == "paid" and invoice.is_delivery and invoice.deposit > invoice.total_value:
#             transaction_amount = invoice.deposit  
#         elif invoice.payment_status == "paid" and invoice.is_delivery and invoice.deposit < invoice.total_value:
#             transaction_amount = invoice.deposit  
#         elif invoice.payment_status == "unpaid" and invoice.is_delivery:
#             transaction_amount = invoice.deposit
#         elif invoice.payment_status == "paid" and invoice.is_delivery:
#             transaction_amount = invoice.total_value 


#         if transaction:
#             previous_transaction_amount = transaction.amount  
#             transaction.amount = transaction_amount
#             transaction.note = f"Updated transaction for invoice {invoice.id}"  
#         else:
#             previous_transaction_amount = 0  
#             new_transaction = Transaction(
#                 customer_id=invoice.customer_id,  
#                 invoice_id=invoice.id,
#                 amount=transaction_amount,
#                 transaction_type="debt_increase",  
#                 note=f"Transaction created for invoice {invoice.id}"
#             )
#             db.add(new_transaction)

#         # db.commit()
#         # db.refresh(invoice)

#         invoice.customer.debt -= previous_transaction_amount 
#         invoice.customer.debt += transaction_amount

#         calculate_invoice_total_and_status(invoice)
#         db.commit()
#         db.refresh(invoice)

#         if invoice.user_id:
#             update_user_stats(invoice.user_id, db)
#         return invoice


#     except HTTPException as http_exc:
#         db.rollback()
#         raise http_exc
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))

from delivery.models import Delivery
@router.put("/invoices/cancel/{invoice_id}", response_model=InvoiceResponse, dependencies=[Security(security_scheme)])
def cancel_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    try:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.active == True).first()
        delivery = db.query(Delivery).filter(Delivery.invoice_id == invoice_id, Delivery.status == "ready_to_pick").first()
        if not invoice:
            raise HTTPException(status_code=404, detail="NOT_FOUND")

        if invoice.status not in ["ready_to_pick", "picking"]:
            raise HTTPException(status_code=400, detail="IN_SHIPPING_NO_CANCELLATION")

        for item in invoice.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                if invoice.branch == "Terra":
                    product.terra_can_sell += item.quantity  
                elif invoice.branch == "Thợ Nhuộm":
                    product.thonhuom_can_sell += item.quantity
                else:
                    raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")
                

        invoice.status = "cancel"
        invoice.payment_status = "unpaid"
        invoice.active = False
        if invoice.is_delivery == False:
            customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
            if customer:
                customer.debt -= invoice.deposit
                customer.total_spending -= invoice.total_value
                # customer.total_order -= 1

            user = db.query(User).filter(User.id == invoice.user_id).first()
            if user:
                # user.total_orders -= 1
                user.total_revenue -= invoice.total_value
        # elif invoice.is_delivery == True:
        #     customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
        #     if customer:
        #         customer.debt -= invoice.deposit
        #         customer.total_order += 1
        #     user = db.query(User).filter(User.id == invoice.user_id).first()
        #     if user:
        #         user.total_orders += 1
        invoice.deposit = 0
        db.commit()
        db.refresh(invoice)

        return invoice
    except Exception as e:
        db.rollback()  


@router.put("/invoices/return/{invoice_id}", response_model=InvoiceResponse, dependencies=[Security(security_scheme)])
def return_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff"])
):
    try:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.active == True,Invoice.is_delivery == 0).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="NOT_FOUND")
        for item in invoice.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                if invoice.branch == "Terra":
                    product.terra_can_sell += item.quantity  
                    product.terra_stock += item.quantity
                elif invoice.branch == "Thợ Nhuộm":
                    product.thonhuom_can_sell += item.quantity
                    product.thonhuom_stock += item.quantity
                else:
                    raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")
                invoice.stock_restored = True
        invoice.status = "return_at_counter"
        invoice.active = False
        customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
        customer.total_spending -= invoice.total_value
        customer.total_order -= 1
        user = db.query(User).filter(User.id == invoice.user_id).first()
        if user:
            user.total_orders -= 1
            user.total_revenue -= invoice.total_value

        db.commit()
        db.refresh(customer)
        db.refresh(invoice)
        return invoice
    except Exception as e:
        db.rollback()    
    
@router.get("/revenue", dependencies=[Security(security_scheme)])
def revenue_summary(
    days: int = Query(0, description="1: Hôm nay theo giờ, 7/30/365: Theo ngày/tháng/năm, 0: Toàn thời gian"),
    db: Session = Depends(get_db),
):
    today = datetime.now(timezone.utc)

    if days == 1:
        start_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = today.replace(hour=23, minute=59, second=59, microsecond=999999)
        date_range_str = f"Doanh thu theo giờ - {start_date.strftime('%Y-%m-%d')}"

        total_payment = (
            db.query(func.sum(Invoice.total_value))
            .filter(
                Invoice.payment_status == "paid",
                Invoice.created_at.between(start_date, end_date)
            )
            .scalar() or 0)
        wait_for_payment = (
            db.query(func.sum(Invoice.total_value))
            .filter(
                Invoice.payment_status == "unpaid",
                Invoice.status != "cancel",
                Invoice.created_at.between(start_date, end_date)
            )
            .scalar() or 0)
        waiting_percentage = (
            (wait_for_payment / (total_payment + wait_for_payment)) * 100
            if (total_payment + wait_for_payment) > 0 else 0)
        revenue_query = (
            db.query(
                func.strftime('%H', Invoice.created_at).label("hour"),
                func.sum(Invoice.total_value).label("total_revenue")
            )
            .filter(
                Invoice.payment_status == "paid",
                Invoice.created_at.between(start_date, end_date)
            )
            .group_by("hour")
            .order_by("hour")
            .all()
        )

        revenue_dict = {record.hour: record.total_revenue for record in revenue_query}
        revenue_breakdown = {f"{hour:02d}:00": revenue_dict.get(f"{hour:02d}", 0) for hour in range(24)}
        total_invoices = (
            db.query(func.count(Invoice.id))
            .filter(Invoice.created_at.between(start_date, end_date))
            .scalar() or 0
        )
        total_customers = (
            db.query(func.count(func.distinct(Invoice.customer_id)))
            .filter(Invoice.created_at.between(start_date, end_date))
            .scalar() or 0
        )
        branch_revenue = db.query(
            Invoice.branch,
            func.sum(Invoice.total_value)
        ).filter(
            Invoice.payment_status == "paid",
            Invoice.created_at.between(start_date, end_date)
        ).group_by(Invoice.branch).all()

        total_revenue_for_branches = sum(value for branch, value in branch_revenue) or 1
        branch_percentage = {
            branch: round((value / total_revenue_for_branches) * 100, 2)
            for branch, value in branch_revenue
        }

        return {
            "date_range": date_range_str,
            "total_payment": total_payment,
            "branch_percentage": branch_percentage,
            "revenue_breakdown": revenue_breakdown,
            "wait_for_payment": wait_for_payment,
            "waiting_percentage": round(waiting_percentage, 2),
            "total_customers": total_customers,
            "total_invoices": total_invoices
        }

    if days in [7, 30]:
        start_date = today - timedelta(days=days - 1)
        date_range_str = f"Last {days} days"
        grouping_func = func.strftime('%Y-%m-%d', Invoice.created_at)
        date_labels = [
            (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
            for i in range(days)
        ]
    elif days == 365:
        start_date = today.replace(month=1, day=1)
        date_range_str = "This year (monthly)"
        grouping_func = func.strftime('%Y-%m', Invoice.created_at)
        date_labels = [today.replace(month=m, day=1).strftime('%Y-%m') for m in range(1, 13)]
    else:
        date_range_str = "All time (by year)"
        grouping_func = func.strftime('%Y', Invoice.created_at)
        min_year = db.query(func.min(func.strftime('%Y', Invoice.created_at))).scalar()
        max_year = db.query(func.max(func.strftime('%Y', Invoice.created_at))).scalar()
        if min_year and max_year:
            date_labels = [str(year) for year in range(int(min_year), int(max_year) + 1)]
        else:
            date_labels = []
        start_date = None

    if start_date:
        start_date_filter = Invoice.created_at >= start_date
    else:
        start_date_filter = True

    total_payment = db.query(func.sum(Invoice.total_value)).filter(
        Invoice.payment_status == "paid",
        start_date_filter
    ).scalar() or 0

    revenue_query = (
        db.query(
            grouping_func.label("period"),
            func.sum(Invoice.total_value).label("total_revenue")
        )
        .filter(
            Invoice.payment_status == "paid",
            start_date_filter
        )
        .group_by("period")
        .order_by("period")
        .all()
    )
    revenue_dict = {record.period: record.total_revenue for record in revenue_query}
    revenue_breakdown = {label: revenue_dict.get(label, 0) for label in date_labels}

    branch_revenue = db.query(
        Invoice.branch,
        func.sum(Invoice.total_value)
    ).filter(
        Invoice.payment_status == "paid",
        start_date_filter
    ).group_by(Invoice.branch).all()
    total_revenue_for_branches = sum(value for branch, value in branch_revenue) or 1
    branch_percentage = {
        branch: round((value / total_revenue_for_branches) * 100, 2)
        for branch, value in branch_revenue
    }

    wait_for_payment = db.query(func.sum(Invoice.total_value)).filter(
        Invoice.payment_status == "unpaid",
        Invoice.status != "cancel",
        start_date_filter
    ).scalar() or 0

    waiting_percentage = (
        (wait_for_payment / (total_payment + wait_for_payment)) * 100
        if (total_payment + wait_for_payment) > 0 else 0
    )

    total_customers = db.query(func.count(func.distinct(Invoice.customer_id))).filter(
        start_date_filter
    ).scalar() or 0
    total_invoices = db.query(func.count(Invoice.id)).filter(
        start_date_filter
    ).scalar() or 0

    return {
        "date_range": date_range_str,
        "total_payment": total_payment,
        "branch_percentage": branch_percentage,
        "revenue_breakdown": revenue_breakdown,
        "wait_for_payment": wait_for_payment,
        "waiting_percentage": round(waiting_percentage, 2),
        "total_customers": total_customers,
        "total_invoices": total_invoices
    }


# @router.get("/top_revenue")
# def top_revenue(
#     date: int = Query(0, description="Số ngày cần tính top SP (0: tất cả, 7, 30, 365)"),
#     db: Session = Depends(get_db)
# ):
#     today = datetime.now(timezone.utc)

#     if date in [7, 30]:
#         start_date = today - timedelta(days=date - 1)
#         date_format = "%Y-%m-%d"
#         grouping_func = func.strftime('%Y-%m-%d', Invoice.created_at)
#         date_labels = [(start_date + timedelta(days=i)).strftime(date_format) for i in range(date)]
#     elif date == 365:
#         start_date = today.replace(month=1, day=1)
#         date_format = "%Y-%m"
#         grouping_func = func.strftime('%Y-%m', Invoice.created_at)
#         date_labels = [today.replace(month=m, day=1).strftime(date_format) for m in range(1, 13)]
#     else:
#         date_format = "%Y"
#         grouping_func = func.strftime('%Y', Invoice.created_at)
#         min_year = db.query(func.min(func.strftime('%Y', Invoice.created_at))).scalar()
#         max_year = db.query(func.max(func.strftime('%Y', Invoice.created_at))).scalar()
#         date_labels = [str(year) for year in range(int(min_year), int(max_year) + 1)] if min_year and max_year else []
#         start_date = None

#     start_date_filter = Invoice.created_at >= start_date if start_date is not None else True

#     revenue_data = db.query(
#         grouping_func.label("period"),
#         func.sum(Invoice.total_value).label("total_revenue")
#     ).filter(start_date_filter).group_by("period").order_by("period").all()

#     delivery_data = db.query(
#         grouping_func.label("period"),
#         func.count(Invoice.id).label("total_deliveries")
#     ).filter(Invoice.is_delivery == True, start_date_filter).group_by("period").order_by("period").all()

#     profit_data = db.query(
#         grouping_func.label("period"),
#         (func.sum(Invoice.total_value) - func.sum(InvoiceItem.quantity * Product.price_import)).label("total_profit")
#     ).join(InvoiceItem, InvoiceItem.invoice_id == Invoice.id).join(Product, Product.id == InvoiceItem.product_id)\
#     .filter(start_date_filter).group_by("period").order_by("period").all()

#     top_products = (
#         db.query(Product.name.label("product"), func.sum(InvoiceItem.quantity).label("quantity"))
#         .distinct(InvoiceItem.product_id)
#         .join(InvoiceItem, InvoiceItem.product_id == Product.id)
#         .join(Invoice, InvoiceItem.invoice_id == Invoice.id)
#         .filter(start_date_filter).group_by(Product.name)
#         .order_by(desc("quantity"))
#         .limit(5)
#         .all()
#     )

#     revenue_dict = {label: 0 for label in date_labels}
#     delivery_dict = {label: 0 for label in date_labels}
#     profit_dict = {label: 0 for label in date_labels}

#     for period, total_revenue in revenue_data:
#         revenue_dict[period] = total_revenue or 0

#     for period, total_deliveries in delivery_data:
#         delivery_dict[period] = total_deliveries or 0

#     for period, total_profit in profit_data:
#         profit_dict[period] = total_profit or 0

#     return {
#         "revenue_per_period": revenue_dict,
#         "total_deliveries_per_period": delivery_dict,
#         "profit_per_period": profit_dict,
#         "top_product_per_period": [{"product": p.product, "quantity": p.quantity} for p in top_products]
#     }

@router.get("/top_revenue", dependencies=[Security(security_scheme)])
def top_revenue(
    date: int = Query(0, description="Số ngày cần tính top SP (0: tất cả, 1: theo giờ, 7, 30, 365)"),
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    today = datetime.now(timezone.utc)

    if date == 1:
        start_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
        date_format = "%H:00"
        grouping_func = func.strftime('%H:00', Invoice.created_at)
        date_labels = [f"{hour:02d}:00" for hour in range(24)]
    elif date in [7, 30]:
        start_date = today - timedelta(days=date - 1)
        date_format = "%Y-%m-%d"
        grouping_func = func.strftime('%Y-%m-%d', Invoice.created_at)
        date_labels = [(start_date + timedelta(days=i)).strftime(date_format) for i in range(date)]
    elif date == 365:
        start_date = today.replace(month=1, day=1)
        date_format = "%Y-%m"
        grouping_func = func.strftime('%Y-%m', Invoice.created_at)
        date_labels = [today.replace(month=m, day=1).strftime(date_format) for m in range(1, 13)]
    else:
        date_format = "%Y"
        grouping_func = func.strftime('%Y', Invoice.created_at)
        min_year = db.query(func.min(func.strftime('%Y', Invoice.created_at))).scalar()
        max_year = db.query(func.max(func.strftime('%Y', Invoice.created_at))).scalar()
        date_labels = [str(year) for year in range(int(min_year), int(max_year) + 1)] if min_year and max_year else []
        start_date = None

    from sqlalchemy.sql import true
    start_date_filter = Invoice.created_at >= start_date if start_date is not None else true()

    revenue_data = db.query(
        grouping_func.label("period"),
        func.sum(Invoice.total_value).label("total_revenue")
    ).filter(start_date_filter).group_by("period").order_by("period").all()

    delivery_data = db.query(
        grouping_func.label("period"),
        func.count(Invoice.id).label("total_deliveries")
    ).filter(Invoice.is_delivery == True, start_date_filter).group_by("period").order_by("period").all()

    revenue_subq = db.query(
        grouping_func.label("period"),
        func.sum(Invoice.total_value).label("total_revenue")
    ).filter(start_date_filter).group_by("period").subquery()

    cost_subq = db.query(
        grouping_func.label("period"),
        func.sum(InvoiceItem.quantity * Product.price_import).label("total_cost")
    ).join(InvoiceItem, InvoiceItem.invoice_id == Invoice.id)\
     .join(Product, Product.id == InvoiceItem.product_id)\
     .filter(start_date_filter)\
     .group_by("period").subquery()

    profit_query = db.query(
        revenue_subq.c.period,
        (revenue_subq.c.total_revenue - func.coalesce(cost_subq.c.total_cost, 0)).label("total_profit")
    ).outerjoin(cost_subq, revenue_subq.c.period == cost_subq.c.period)\
     .order_by(revenue_subq.c.period)

    profit_data = profit_query.all()

    top_products = (
        db.query(Product.name.label("product"), func.sum(InvoiceItem.quantity).label("quantity"))
        .distinct(InvoiceItem.product_id)
        .join(InvoiceItem, InvoiceItem.product_id == Product.id)
        .join(Invoice, InvoiceItem.invoice_id == Invoice.id)
        .filter(start_date_filter)
        .group_by(Product.name)
        .order_by(desc("quantity"))
        .limit(5)
        .all()
    )

    revenue_dict = {label: 0 for label in date_labels}
    delivery_dict = {label: 0 for label in date_labels}
    profit_dict = {label: 0 for label in date_labels}

    for period, total_revenue in revenue_data:
        revenue_dict[period] = total_revenue or 0

    for period, total_deliveries in delivery_data:
        delivery_dict[period] = total_deliveries or 0

    for period, total_profit in profit_data:
        profit_dict[period] = total_profit or 0

    return {
        "revenue_per_period": revenue_dict,
        "total_deliveries_per_period": delivery_dict,
        "profit_per_period": profit_dict,
        "top_product_per_period": [{"product": p.product, "quantity": p.quantity} for p in top_products]
    }
