from fastapi import APIRouter, Depends, HTTPException, Query, Security
from customers.models_cus import Customer, Transaction
from sqlalchemy.orm import Session
from delivery.models import Base
from invoice.models import Invoice, InvoiceItem
from invoice.schema import InvoiceResponse
from delivery.models import Delivery, InformationShop, DeliveryItem
from database.main import engine
from delivery.schema import (DeliveriesResponse, DeliveryCreate, DeliveryListResponse, DeliveryResponse,
                             Shopcreate, ShopResponse, PickupTimeResponse)
import json
from users.models import Account, User
from users.main import role_required
from users.dependencies import get_db
from typing import List, Optional
import os
import logging
from fastapi.security import HTTPBearer
from products.models import Product
from sqlalchemy import func, or_, desc

Base.metadata.create_all(bind=engine)
security_scheme = HTTPBearer()

router = APIRouter()

from users.ghn import get_provinces, get_districts, get_wards,get_pick_shifts

@router.get("/ghn/provinces")
def get_province_list():
    return {"success": True, "data": get_provinces()}

@router.get("/ghn/districts/{province_id}")
def get_district_list(province_id: str):
    return {"success": True, "data": get_districts(province_id)}

@router.get("/ghn/wards/{district_id}")
def get_ward_list(district_id: str):
    return {"success": True, "data": get_wards(district_id)}

@router.get("/ghn/pickshifts")
def get_pick_shift_list():
    return {"success": True, "data": get_pick_shifts()}

import requests
from dotenv import load_dotenv

if "GHN_API_ORDER_INFO" in os.environ:
    del os.environ["GHN_API_ORDER_INFO"]

load_dotenv()
GHN_URL = os.getenv("GHN_API_URL_CREATE")
GHN_TOKEN = os.getenv("GHN_TOKEN")
GHN_API_DETAIL = os.getenv("GHN_API_DETAIL")
GHN_API_CREATE_SHOP = os.getenv("GHN_API_CREATE_SHOP")
GHN_API_LIST_SHOP = os.getenv("GHN_API_LIST_SHOP")
GHN_API_DETAIL = os.getenv("GHN_API_DETAIL")
GHN_API_ORDER_INFO = os.getenv("GHN_API_ORDER_INFO")
GHN_API_CANCEL = os.getenv("GHN_API_CANCEL")
print("GHN_API_ORDER_INFO .env:", GHN_API_ORDER_INFO)

HEADERS = {
    "Content-Type": "application/json",
    "Token": GHN_TOKEN
}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/create_order/{invoice_id}", response_model=DeliveryResponse)
def create_order(invoice_id: str,shop_id: int ,delivery_data: DeliveryCreate, 
                 db: Session = Depends(get_db),
                #  current_user: Account = role_required(["admin", "staff"])
                 ):
    # invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.status == "ready_to_pick").first()
    if not invoice:
        logger.error("Invoice không tồn tại, invoice_id: %s", invoice_id)
        raise HTTPException(status_code=404, detail="NOT_FOUND_INVOICE")
    if invoice.total_value >= 500000:
        # invoice.total_value = 499000
        insurance_value = 499000
    else:
        insurance_value = invoice.total_value

    shop =db.query(InformationShop).filter(InformationShop.shop_id == shop_id).first()
    if not shop:
        logger.error("Shop không tồn tại, shop_id: %s", shop_id)
        raise HTTPException(status_code=404, detail="NOT_FOUND_SHOP")
    customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
    if not customer:
        logger.error("Customer không tồn tại cho invoice_id: %s", invoice_id)
        raise HTTPException(status_code=404, detail="NOT_FOUND_CUSTOMER")
    invoice_items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice_id).all()

    if not customer.phone:
        logger.error("Thiếu số điện thoại cho invoice_id: %s", invoice_id)
        raise HTTPException(status_code=400, detail="PHONE_NUMBER_IS_REQUIRED")

    if not customer.address:
        logger.error("Thiếu địa chỉ cho invoice_id: %s", invoice_id)
        raise HTTPException(status_code=400, detail="ADDRESS_IS_REQUIRED")

    if not customer.province:
        logger.error("Thiếu tỉnh/thành phố cho invoice_id: %s", invoice_id)
        raise HTTPException(status_code=400, detail="PROVINCE_IS_REQUIRED")

    if not customer.district_name:
        logger.error("Thiếu quận/huyện cho invoice_id: %s", invoice_id)
        raise HTTPException(status_code=400, detail="DISTRICT_IS_REQUIRED")

    if not customer.ward_name:
        logger.error("Thiếu phường/xã cho invoice_id: %s", invoice_id)
        raise HTTPException(status_code=400, detail= "WARD_IS_REQUIRED")

    invoice_details = []
    for invoice_item in invoice_items:
        product = db.query(Product).filter(Product.id == invoice_item.product_id).first()
        if product:
            invoice_details.append(f"{product.name} [SL: {invoice_item.quantity}]")
            # product.out_for_delivery += invoice_item.quantity
    if invoice.branch == "Terra":
        product.out_for_delivery_terra += invoice_item.quantity
    elif invoice.branch == "Thợ Nhuộm":
        product.out_for_delivery_thonhuom += invoice_item.quantity
    else:
        db.rollback()
        raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")

    content = ", ".join(invoice_details)
    pick_shift = [delivery_data.pick_shift]
    
    items = []
    for item in delivery_data.items:
        product = db.query(Product).filter(Product.name == item.name).first()
        if product:
            item_order_code = f"{product.name}_{product.id}"
        else:
            item_order_code = f"{item.name}_{item.code}"  

        items.append({
            "name": item.name,
            "quantity": item.quantity,
            "price": item.price,
            "length": item.length,
            "width": item.width,
            "height": item.height,
            "weight": item.weight,
            "category": item.category.dict() if hasattr(item, "category") else {},
            "item_order_code": item_order_code
        })


    
    print(items)    
    order_data = {
        "payment_type_id": delivery_data.payment_type_id,
        "note": delivery_data.note or invoice.note or "Giao hàng nhanh",
        "required_note": delivery_data.required_note,
        "to_name": customer.full_name,
        "to_phone": customer.phone,
        "to_address": customer.address,
        "to_ward_name": customer.ward_name,
        "to_district_name": customer.district_name,
        "to_province_name": customer.province,
        # "cod_amount": round(invoice.total_value),
        "cod_amount": int(delivery_data.cod_amount),
        "weight": int(delivery_data.weight),
        "length": int(delivery_data.length),
        "width": int(delivery_data.width),
        "height": int(delivery_data.height),
        "service_type_id": delivery_data.service_type_id,
        "pick_station_id": delivery_data.pick_station_id,
        "pick_shift": pick_shift,
        # "insurance_value": int(delivery_data.insurance_value),
        "insurance_value": round(insurance_value),
        "cod_failed_amount": delivery_data.cod_failed_amount,
        
        "content": content,
        # "from_name": shop.name,
        # "from_phone": shop.phone,
        # "from_address": shop.address,
        # "from_ward_name": shop.ward_name,
        # "from_district_name": shop.district_name,
        "shop_id": shop_id,
        "cupon": delivery_data.cupon,
        "return_phone": delivery_data.return_phone,
        "return_address": delivery_data.return_address,
        "return_ward_name": delivery_data.return_ward_name,
        "return_district_name": delivery_data.return_district_name,

        "items": items
    }

    try:
        response = requests.post(GHN_URL, headers=HEADERS, data=json.dumps(order_data))
    except Exception as e:
        logger.error("Lỗi khi gọi GHN API: %s", e)
        print(f"err {response.text}")
        raise HTTPException(status_code=500, detail=e)

    if response.status_code == 200:
        response_data = response.json()

        order_code = response_data.get("data", {}).get("order_code")
        if not order_code:
            logger.error("Không nhận được order_code cho invoice_id: %s, response: %s", invoice_id, response.text)
            raise HTTPException(status_code=500, detail="NO_ORDER_CODE_RETURNED")
        else:
            logger.info("Nhận được order_code: %s", order_code)

        message = response_data.get("message")
        if isinstance(message, dict):
            message = message.get("message")
        if not message:
            logger.error("Không nhận được message cho invoice_id: %s, response: %s", invoice_id, response.text)
            raise HTTPException(status_code=500, detail="NO_MESSAGE_RETURNED")
        else:
            logger.info("Thông báo từ GHN: %s", message)
    else:
        try:
             response_data = response.json()
             error_message = response_data.get("message", "Lỗi không xác định từ GHN")
        except json.JSONDecodeError:
             error_message = "Lỗi từ GHN, nhưng không thể phân tích phản hồi"
        logger.error("Lỗi từ GHN API, status_code: %s, message: %s", response.status_code, error_message)
        raise HTTPException(status_code=response.status_code, detail=error_message)
    
    new_delivery = Delivery(
        invoice_id=invoice_id,
        payment_type_id=delivery_data.payment_type_id,
        shop_id=shop_id,
        note=delivery_data.note,
        required_note=delivery_data.required_note,
        to_name=customer.full_name,
        to_phone=customer.phone,
        to_address=customer.address,
        to_ward_name=customer.ward_name,
        to_district_name =customer.district_name,
        to_province_name=customer.province,
        # cod_amount=invoice.total_value,
        cod_amount=delivery_data.cod_amount,
        weight=int(delivery_data.weight),
        length=delivery_data.length,
        width=delivery_data.width,
        height=delivery_data.height,
        service_type_id=delivery_data.service_type_id,
        pick_station_id=delivery_data.pick_station_id,
        # insurance_value=delivery_data.insurance_value,
        insurance_value=invoice.total_value,
        pick_shift=delivery_data.pick_shift,
        cod_failed_amount=delivery_data.cod_failed_amount,
        
        content=content,
        # from_name=shop.name,
        # from_phone=shop.phone,
        # from_address=shop.address,
        # from_ward_code=shop.ward_name,
        # from_district_name=shop.district_name,
        payment_status = invoice.payment_status,
        return_phone=delivery_data.return_phone,
        return_address=delivery_data.return_address,
        return_ward_name=delivery_data.return_ward_name,
        return_district_name=delivery_data.return_district_name,
        order_code=order_code,
        message=message  
    )

    db.add(new_delivery)
    db.commit()
    if delivery_data.service_type_id == 5:

        for item in delivery_data.items:
            # product = db.query(Product).filter(Product.id == item.product_id).first() if hasattr(item, 'product_id') else None
            # item_name = product.name if product else item.name
            new_item = DeliveryItem(
                delivery_id=new_delivery.id,
                name=item.name,
                code=item.code,
                quantity=item.quantity,
                price=item.price,
                length=item.length,
                width=item.width,
                height=item.height,
                weight=item.weight,
                category=item.category.dict() if item.category else {}
            )
            db.add(new_item)

    db.commit()
    logger.info("Đơn hàng giao nhận được tạo thành công, invoice_id: %s, order_code: %s", invoice_id, order_code)
    invoice.status = "picking"
    invoice.is_delivery == 1
    new_invoice_status = invoice.status
    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    return DeliveryResponse(
        id=new_delivery.id,
        order_code=new_delivery.order_code,
        status=new_invoice_status,
        message="Đơn hàng đã được tạo thành công",
        data=new_delivery.__dict__
    )




# @router.get("/deliveries", response_model=DeliveriesResponse, dependencies=[Depends(security_scheme)])
# def list_deliveries(
#     skip: int = 0,
#     limit: int = 10,
#     db: Session = Depends(get_db),
#     search: Optional[str] = Query(None, description="Tìm kiếm đơn vận chuyển"),
#     current_user: Account = role_required(["admin", "staff"])
# ):
#     try:
#         # query = db.query(Delivery)
#         query = db.query(Delivery).join(Invoice, Delivery.invoice_id == Invoice.id)
#         if search:
#             s = f"%{search.lower()}%"
#             query = query.filter(
#                 or_(
#                     func.lower(Delivery.invoice_id).like(s),
#                     func.lower(Delivery.to_phone).like(s),
#                     func.lower(Delivery.to_name).like(s),
#                     func.lower(Delivery.to_address).like(s),
#                     func.lower(Delivery.order_code).like(s),
#                     func.lower(Delivery.payment_status).like(s),
#                     # func.lower(Delivery.status).like(s),
#                     func.lower(Invoice.status).like(s),
#                     func.lower(Delivery.content).like(s)
#                 )
#             )
#         total_deliveries = query.count()
#         deliveries = query.order_by(desc(Delivery.created_at)).offset(skip).limit(limit).all()
        
#         response_data = {"total_deliveries": total_deliveries, "deliveries": deliveries}
#         return response_data

#     except Exception as e:
#         logger.error("Error in list_deliveries endpoint: %s", e, exc_info=True)
#         raise HTTPException(status_code=500, detail="INTERNAL_SERVER_ERROR")

from suppliers.main_sup import normalize
@router.get("/deliveries", response_model=DeliveriesResponse, dependencies=[Security(security_scheme)])
def list_deliveries(
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff"]),
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = Query(None, description="Tìm kiếm đơn vận chuyển")
):
    query = db.query(Delivery).join(Invoice, isouter=True)
    
    if search:
        deliveries = query.all()
        search_normalized = normalize(search)
        filtered_deliveries = [
            delivery for delivery in deliveries
            if search_normalized in normalize(delivery.invoice_id)
            or search_normalized in normalize(delivery.to_phone)
            or search_normalized in normalize(delivery.to_name)
            or search_normalized in normalize(delivery.to_address)
            or search_normalized in normalize(delivery.order_code)
            or search_normalized in normalize(delivery.payment_status)
            or search_normalized in normalize(Invoice.status)
            or search_normalized in normalize(delivery.content)
            or (delivery.invoice and any(search_normalized in normalize(item.product.id) for item in delivery.invoice.items))
        ]
    else:
        filtered_deliveries = query.all()
    
    sorted_deliveries = sorted(filtered_deliveries, key=lambda delivery: delivery.created_at, reverse=True)
    total_deliveries = len(filtered_deliveries)
    deliveries = sorted_deliveries[skip: skip + limit]
    
    return {
        "total_deliveries": total_deliveries,
        "deliveries": deliveries
    }

@router.get("/deliveries/{order_code}", response_model=DeliveryResponse)
def get_delivery(order_code: str, db: Session = Depends(get_db),
                #  current_user: Account = role_required(["admin", "staff"])
                 ):
    delivery = db.query(Delivery).filter(Delivery.order_code == order_code).first()
    if not delivery:
        logger.error("Không tìm thấy delivery với order_code: %s", order_code)
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    
    payload = {"order_code": order_code}
    headers = {"ShopID": str(delivery.shop_id), "Token": GHN_TOKEN}

    try:
        response = requests.post(GHN_API_ORDER_INFO, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        service_fee = data.get("data", {}).get("detail", {}).get("main_service")
    except requests.RequestException as e:
        logger.error("Lỗi khi gọi GHN API cho order_code %s: %s", order_code, e, exc_info=True)
        print(f"err {response.text}")
        raise HTTPException(status_code=500, detail="Lỗi khi gọi GHN API")

    if service_fee is not None and service_fee != delivery.service_fee:
        delivery.service_fee = service_fee
        db.commit()
        db.refresh(delivery)
        logger.info("Cập nhật service_fee cho order_code %s: %s", order_code, service_fee)

    pickup_time = None
    try:
        pickup_response = requests.get(GHN_API_DETAIL, headers=headers, json=payload)
        pickup_response.raise_for_status()
        pickup_data = pickup_response.json()
        pickup_time = pickup_data.get("data", {}).get("pickup_time")
        if pickup_time:
            delivery.pickup_time = pickup_time
            db.commit()
            db.refresh(delivery)
            logger.info("Nhận được pickup_time: %s", pickup_time)
    except requests.RequestException as e:
        logger.error("Lỗi khi gọi GHN API để lấy pickup_time cho order_code %s: %s", order_code, e, exc_info=True)

    shop = db.query(InformationShop).filter(InformationShop.shop_id == delivery.shop_id).first()
    invoice = db.query(Invoice).filter(Invoice.id == delivery.invoice_id).first()
    invoice_data = InvoiceResponse.from_orm(invoice).dict()
    
    return DeliveryResponse(
        id=delivery.id,
        order_code=delivery.order_code,
        status=delivery.status,
        service_fee=delivery.service_fee,
        pickup_time=pickup_time, 
        message="Đơn hàng đã được tìm thấy",
        shop_address=shop,
        # data=delivery.__dict__
        data={
            **delivery.__dict__,
            "invoice": invoice_data
        }
    )



def restore_stock(db: Session, invoice: Invoice, invoice_items):
    for item in invoice_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        # if product:
        #     if product.out_for_delivery >= item.quantity:
        #         product.out_for_delivery -= item.quantity
        #         db.commit()  
        #         db.refresh(product)  
        #         logger.info("Giảm  sl hàng đang giao cho sản phẩm %s, giảm %d", product.name, item.quantity)
        #     else:
        #         logger.warning("Không đủ số lượng hàng để giảm cho sản phẩm %s. Hàng đang giao: %d, yêu cầu: %d", product.name, product.out_for_delivery, item.quantity)
        if not product:
            continue
        if invoice.branch == "Terra":
            # product.terra_stock += item.quantity
            product.terra_can_sell += item.quantity
            product.out_for_delivery_terra -= item.quantity

        elif invoice.branch == "Thợ Nhuộm":
            # product.thonhuom_stock += item.quantity
            product.thonhuom_can_sell += item.quantity
            product.out_for_delivery_thonhuom -= item.quantity

        else:
            db.rollback()
            raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")

    db.commit()


def deduct_stock(db: Session, invoice: Invoice, invoice_items):
    for item in invoice_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        # if product:
        #     if product.out_for_delivery >= item.quantity:
        #         product.out_for_delivery -= item.quantity
        #         db.commit()  
        #         db.refresh(product)  
        #         logger.info("Giảm  sl hàng đang giao cho sản phẩm %s, giảm %d", product.name, item.quantity)
        #     else:
        #         logger.warning("Không đủ số lượng hàng để giảm cho sản phẩm %s. Hàng đang giao: %d, yêu cầu: %d", product.name, product.out_for_delivery, item.quantity)
        #         db.rollback()
        if not product:
            continue
        if invoice.branch == "Terra":
            if product.terra_stock < item.quantity:
                db.rollback()
                raise HTTPException(
                    status_code=400,
                    detail=f"PRODUCT_'{product.name}'_NOT_ENOUGH_IN_{invoice.branch}."
                )
            product.terra_stock -= item.quantity
            product.out_for_delivery_terra -= item.quantity

        elif invoice.branch == "Thợ Nhuộm":
            if product.thonhuom_stock < item.quantity:
                db.rollback()
                raise HTTPException(
                    status_code=400,
                    detail=f"PRODUCT_'{product.name}'_NOT_ENOUGH_IN_{invoice.branch}."
                )
            product.thonhuom_stock -= item.quantity
            product.out_for_delivery_thonhuom -= item.quantity
            
        else:
            db.rollback()
            raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")

    db.commit()


def update_all_statuses(db: Session):
    logger.info("Bắt đầu job update_all_statuses")
    deliveries = db.query(Delivery).filter(Delivery.status.notin_(["returned", "cancel"])).all()

    for delivery in deliveries:
        payload = {"order_code": delivery.order_code}
        try:
            response = requests.post(GHN_API_DETAIL, json=payload, headers=HEADERS)
            response.raise_for_status()
        except Exception as e:
            logger.error("Lỗi khi gọi GHN API cho order_code %s: %s", delivery.order_code, e)
            continue

        data = response.json()
        status = data.get("data", {}).get("status") or data.get("data", {}).get("internal_process", {}).get("status")
        if not status:
            logger.error("Không tìm thấy status trong response cho order_code %s", delivery.order_code)
            continue

        try:
            previous_status = delivery.status
            delivery.status = status
            db.commit() 
            db.refresh(delivery)  
            logger.info("Cập nhật status cho order_code %s thành %s", delivery.order_code, status)

            invoice = db.query(Invoice).filter(Invoice.id == delivery.invoice_id, Invoice.active == True).first()
            if invoice:

                new_invoice_status = STATUS_MAPPING.get(status, "unknown")
                if new_invoice_status == "unknown":
                    logger.warning("Unknown status %s for order_code %s", status, delivery.order_code)

                if invoice.status != new_invoice_status:
                    previous_invoice_status = invoice.status
                    invoice.status = new_invoice_status

                    if invoice.status == "delivered" and previous_invoice_status != "delivered":
                        customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
                        user = db.query(User).filter(User.id == invoice.user_id).first()
                        invoice.payment_status = "paid"
                        delivery.payment_status = "paid"
                        # invoice.customer.total_spending += invoice.total_value
                        # invoice.user.total_revenue += invoice.total_value

                        customer.total_spending += invoice.total_value
                        user.total_revenue += invoice.total_value
                        user.total_orders += 1
                        customer.total_order += 1

                        # auto refund for deposit
                        transaction = db.query(Transaction).filter(Transaction.invoice_id == invoice.id, Transaction.active ==True).first()
                        if transaction:
                            transaction.transaction_type = "payment"
                            transaction.note = f"Thanh toán tự động cho invoice {invoice.id}"
                            transaction.active = False
                            customer.debt -= invoice.deposit
                        else:
                            transaction = Transaction(
                                customer_id=invoice.customer_id,
                                invoice_id=invoice.id,
                                amount=invoice.total_value,
                                transaction_type="payment",
                                note=f"Thanh toán cho invoice {invoice.id}",
                                active = False
                            )
                            customer.debt -= invoice.deposit
                            db.add(customer)

                            db.add(transaction)
                            db.commit()


                        #---------------------------------------------
                        try:
                            deduct_stock(db, invoice, invoice.items)
                            invoice.stock_deducted = True
                        except HTTPException as e:
                            logger.error("Lỗi trừ stock: %s", e.detail) 
                            db.rollback()
                            continue
                        invoice.active = False

                    elif invoice.status == "cancel" and previous_invoice_status != "cancel":
                        customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
                        if customer:
                            customer.debt -= invoice.deposit
                            customer.total_order += 1
                        invoice.deposit = 0
                        invoice.payment_status = "unpaid"
                        delivery.payment_status = "unpaid"
                        invoice.active = False
                        try:
                            restore_stock(db, invoice, invoice.items)
                            invoice.stock_restored = True
                        except HTTPException as e:
                            logger.error("Lỗi cộng lại stock khi hủy đơn: %s", e.detail)
                            db.rollback()
                            continue

                    elif invoice.status == "returned" and previous_invoice_status != "returned":
                        customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
                        transaction = db.query(Transaction).filter(Transaction.invoice_id == invoice.id, Transaction.active == True).first()
                        if customer:
                            customer.total_return_spending += invoice.total_value
                            customer.total_return_orders += 1
                            
                            refund_amount = (
                                invoice.total_value if invoice.payment_status == "paid" else
                                invoice.deposit if invoice.payment_status == "partial_payment" else
                                0
                            )
                            # if refund_amount > 0:
                            #     customer.total_spending -= invoice.total_value
                        # # auto refund for deposit
                        #     if transaction:
                        #         transaction.transaction_type = "refund"
                        #         transaction.note = f"Refund for returned invoice {invoice.id}"
                        #         transaction.active = False
                        #         customer.debt -= transaction.amount
                        #     else:
                        #         transaction = Transaction(
                        #             customer_id=customer.id,
                        #             invoice_id=invoice.id,
                        #             amount=refund_amount,
                        #             transaction_type="refund",
                        #             note=f"Refund for returned invoice {invoice.id}",
                        #             active = False
                        #         )
                        #         customer.debt -= refund_amount
                        #         db.add(transaction)
                        #         db.add(customer)
                        #         db.commit()
                        #---------------------------------------------
                                # transaction = Transaction(
                                #     customer_id=customer.id,
                                #     invoice_id=invoice.id,
                                #     amount=refund_amount,
                                #     transaction_type="refund",
                                #     note=f"Refund for returned invoice {invoice.id}"
                                # )
                                # db.add(transaction)

                        invoice.payment_status = "unpaid"
                        invoice.active = False
                        try:
                            restore_stock(db, invoice, invoice.items)
                            invoice.stock_restored = True
                        except HTTPException as e:
                            logger.error("Lỗi cộng lại stock: %s", e.detail)
                            db.rollback()
                            continue

                db.commit()
                db.refresh(invoice)  
                logger.info("Cập nhật invoice status cho order_code %s thành %s", delivery.order_code, invoice.status)
            else:
                logger.info("Không có invoice liên quan tới delivery có order_code %s", delivery.order_code)

        except Exception as e:
            db.rollback()
            logger.error("Lỗi xử lý delivery %s: %s", delivery.order_code, e)
            continue

    logger.info("Hoàn thành job update_all_statuses")



STATUS_MAPPING = {
    "ready_to_pick": "picking",  # nếu update status thì invoice chuyển thành ready_to_pick -> đặt lặp lại cùng 1 đơn -> chuyển thành picking
    "picking": "picking",  # Nhân viên đang lấy hàng
    "cancel": "cancel",  # Hủy đơn hàng
    "money_collect_picking": "delivering",  # Đang thu tiền người gửi
    "picked": "delivering",  # Nhân viên đã lấy hàng
    "storing": "delivering",  # Hàng đang nằm ở kho
    "transporting": "delivering",  # Đang luân chuyển hàng
    "sorting": "delivering",  # Đang phân loại hàng hóa
    "delivering": "delivering",  # Nhân viên đang giao hàng
    "money_collect_delivering": "delivering",  # Đang thu tiền người nhận
    "delivered": "delivered",  # Đã giao hàng thành công
    "delivery_fail": "returning",  # Giao hàng thất bại
    "waiting_to_return": "returning",  # Đợi trả hàng
    "return": "returning",  # Trả hàng 
    "return_transporting": "returning",  # Luân chuyển hàng trả
    "return_sorting": "returning",  # Phân loại hàng trả
    "returning": "returning",  # Đang trả hàng
    "return_fail": "returning",  # Trả hàng thất bại
    "returned": "returned",  # Đã trả hàng thành công
    "exception": "returning",  # Ngoại lệ
    "damage": "returning",  # Hư hỏng
    "lost": "returning",  # Bị mất
}

GHN_PRINT_ORDER = os.getenv("GHN_API_PRINT_ORDER")
GHN_PRINT_INFO = os.getenv("GHN_API_PRINT_INFO")
@router.post("/print_order/{order_code}", dependencies=[Security(security_scheme)])
def get_print_token(order_code: str, db: Session = Depends(get_db),
                    current_user: Account = role_required(["admin", "staff"])):
    delivery = db.query(Delivery).filter(Delivery.order_code == order_code).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="DELIVERY_NOT_FOUND")

    payload = {"order_codes": [order_code]}
    headers = {"ShopID": str(delivery.shop_id), "Token": GHN_TOKEN}
    try:
        response = requests.post(GHN_PRINT_INFO, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        if data.get("code") != 200 or "data" not in data or "token" not in data["data"]:
            logger.error(f"GHN API ERROR: {data}")
            raise HTTPException(status_code=500, detail=f"GHN API ERROR: {data}")

        ghn_token = data["data"]["token"]
        logger.info(f"Received GHN token: {ghn_token}")
        # return ghn_token
        return print_order(ghn_token)

    except requests.exceptions.RequestException as err:
        logger.error(f"Request error: {str(err)}")
        raise HTTPException(status_code=500, detail=f"REQUEST ERROR: {str(err)}")

from fastapi.responses import HTMLResponse
@router.get("/print_order/{token}", response_class=HTMLResponse, dependencies=[Security(security_scheme)])
def print_order(token: str, current_user: Account = role_required(["admin", "staff"])):
    ghn_print_order_url = GHN_PRINT_ORDER.replace("ABC", token)
    logger.info(f"Generated GHN Print Order URL: {ghn_print_order_url}")

    try:
        print_response = requests.get(ghn_print_order_url)
        print_response.raise_for_status()

        content_type = print_response.headers.get("Content-Type", "")
        if "text/html" in content_type:  
            return HTMLResponse(content=print_response.text, status_code=200)
        logger.error(f"Unexpected response format: {print_response.text[:500]}")
        raise HTTPException(status_code=500, detail="GHN API ERROR: Unexpected response format")

    except requests.exceptions.RequestException as err:
        logger.error(f"Request error: {str(err)}")
        raise HTTPException(status_code=500, detail=f"REQUEST ERROR: {str(err)}")

from invoice.main_invoice import cancel_invoice
@router.put("/deliveries/{delivery_id}/cancel", response_model=DeliveryResponse, dependencies=[Security(security_scheme)])
def cancel_delivery(
    delivery_id: int,
    shop_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff"])
):
    try:
        delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
        if not delivery:
            raise HTTPException(status_code=404, detail="DELIVERY_NOT_FOUND")

        if delivery.status == "cancel":
            raise HTTPException(status_code=400, detail="DELIVERY_ALREADY_CANCELED")

        if delivery.status not in ["ready_to_pick", "picking", "money_collect_picking"]:
            raise HTTPException(status_code=400, detail="CAN_NOT_CANCEL_WHEN_DELIVERY_STATUS_IS_NOT_ready_to_pick_OR_picking_OR_money_collect_picking")

        ghn_payload = {"order_codes": [delivery.order_code]}  
        ghn_headers = {
            "Content-Type": "application/json",
            "ShopId": shop_id,
            "Token": GHN_TOKEN
        }
        ghn_response = requests.post(GHN_API_CANCEL, json=ghn_payload, headers=ghn_headers)

        if ghn_response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"GHN_CANCEL_FAILED: {ghn_response.json()}")

        ghn_data = ghn_response.json()

        if ghn_data.get("code") == 200:
            cancel_invoice(invoice_id=delivery.invoice_id, db=db)

            delivery.status = "cancel"
            db.commit()
            db.refresh(delivery)

            data = ghn_data.get("data", {}) if isinstance(ghn_data.get("data"), dict) else {}

            return DeliveryResponse(
                id=delivery.id,
                order_code=delivery.order_code,
                status=delivery.status,
                message="Success",
                data=data, 
                service_fee=delivery.cod_amount  
            )
        else:
            raise HTTPException(status_code=400, detail=f"GHN_CANCEL_FAILED: {ghn_data}")

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"INTERNAL_SERVER_ERROR: {str(e)}")




@router.post("/create_shop", response_model=ShopResponse,dependencies=[Security(security_scheme)])
def create_shop(shop_data: Shopcreate, db: Session = Depends(get_db), current_user: Account = role_required(["admin"])):
    payload = {
        "name": shop_data.name,
        "address": shop_data.address,
        "district_id": shop_data.district_id,
        "ward_code": shop_data.ward_code,
        "phone": shop_data.phone
    }
    
    try:
        response = requests.post(GHN_API_CREATE_SHOP, json=payload, headers=HEADERS)
        logger.info("Response từ GHN API: %s", response.text)
    except Exception as e:
        logger.error("Lỗi khi gọi GHN create shop API: %s", e)
        raise HTTPException(status_code=500, detail="ERROR_CALLING_GHN_API")
    
    if response.status_code == 200:
        data = response.json()
        logger.info("Response JSON từ GHN create shop API: %s", data)
        
        shop_id = data.get("data", {}).get("shop_id")
        if not shop_id:
            logger.error("Không nhận được shop_id từ response: %s", data)
            raise HTTPException(status_code=500, detail="NO_SHOP_ID_RETURNED")

    else:
        try:
            error_message = response.json().get("message", "Không thể tạo shop.")
        except Exception:
            error_message = response.text or "Không thể tạo shop."
        logger.error("Lỗi từ GHN create shop API: %s", error_message)
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Lỗi từ GHN: {error_message}"
        )
    
    new_shop = InformationShop(
        shop_id=shop_id,
        name=shop_data.name,
        address=shop_data.address,
        district_id=shop_data.district_id,
        ward_code=shop_data.ward_code,
        phone=shop_data.phone,

    )
    db.add(new_shop)
    db.commit()
    db.refresh(new_shop)
    
    return ShopResponse(
        shop_id=new_shop.shop_id,
        name=new_shop.name,
        address=new_shop.address,
        phone=new_shop.phone,
        district_id=new_shop.district_id,
        ward_code=new_shop.ward_code
    )





# @router.get("/shops", response_model=List[ShopResponse])
# def list_shops(db: Session = Depends(get_db)):
#     try:
#         response = requests.get(GHN_API_LIST_SHOP, headers=HEADERS)
#     except Exception as e:
#         logger.error("Lỗi khi gọi GHN list shop API: %s", e)
#         raise HTTPException(status_code=500, detail="Error calling GHN API")

#     if response.status_code == 200:
#         data = response.json()
#         logger.info("Response từ GHN list shop API: %s", data)

#         if not isinstance(data, dict) or "data" not in data:
#             logger.error("Dữ liệu GHN API không hợp lệ: %s", data)
#             raise HTTPException(status_code=500, detail="Invalid response format from GHN")

#         shops_data = data["data"].get("shops", [])  
#         if not isinstance(shops_data, list):
#             logger.error("Danh sách shops không hợp lệ: %s", shops_data)
#             raise HTTPException(status_code=500, detail="Invalid shops data format")

#         result = []
#         for shop in shops_data:
#             # Chỉ lấy shop có status = 1
#             if shop.get("status") != 1:
#                 continue

#             shop_id = shop.get("_id")
#             existing_shop = db.query(InformationShop).filter(InformationShop.shop_id == shop_id).first()

#             if not existing_shop:
#                 new_shop = InformationShop(
#                     shop_id=shop_id,
#                     name=shop.get("name"),
#                     address=shop.get("address"),
#                     district_id=shop.get("district_id"),
#                     ward_code=shop.get("ward_code"),
#                     phone=shop.get("phone"),
#                 )
#                 db.add(new_shop)
#                 db.commit()

#             result.append(ShopResponse(
#                 shop_id=shop_id,
#                 name=shop.get("name"),
#                 address=shop.get("address"),
#                 district_id=shop.get("district_id"),
#                 ward_code=shop.get("ward_code"),
#                 phone=shop.get("phone"),
#             ))

#         return result
#     else:
#         try:
#             error_message = response.json().get("message", "Không thể lấy danh sách shop.")
#         except Exception:
#             error_message = response.text or "Không thể lấy danh sách shop."
#         logger.error("Lỗi từ GHN list shop API: %s", error_message)
#         raise HTTPException(
#             status_code=response.status_code,
#             detail=f"Lỗi từ GHN: {error_message}"
#         )



@router.get("/list_shop", response_model=List[ShopResponse])
def list_shop(skip: int = 0,
              limit: int = 10,
              search: Optional[str] = Query(None, description="Tìm kiếm theo tên hoặc mô tả,..."),
              db: Session = Depends(get_db),
             ):
    query = db.query(InformationShop)

    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(InformationShop.name).like(s),
                func.lower(InformationShop.address).like(s),
                func.lower(InformationShop.phone).like(s)
            )
        )

    shops = query.order_by(desc(InformationShop.created_at)).offset(skip).limit(limit).all()

    response_list = []
    for shop in shops:
        response_list.append(ShopResponse(
            shop_id=shop.shop_id,
            name=shop.name,
            address=shop.address,
            phone=shop.phone,
            district_id=shop.district_id,
            ward_code=shop.ward_code,
            created_at=str(shop.created_at),
            updated_at=str(shop.updated_at)
        ))

    return response_list


from datetime import datetime, timedelta, timezone
import pytz

@router.get("/total_revenue_delivery", dependencies=[Security(security_scheme)])
def revenue_summary(
    date: int = Query(0, description="Số ngày cần tính doanh thu (0: theo năm, 7, 30, 90: theo ngày, 365: theo tháng)."), 
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff"])
):
    # today = datetime.now(timezone.utc)
    vietnam_tz = pytz.timezone("Asia/Ho_Chi_Minh")
    today = datetime.now(vietnam_tz)

    if date in [1, 7, 30, 90]:
        start_date = today - timedelta(days=date)
    elif date == 365:
        start_date = today.replace(month=1, day=1)  
    else:  
        start_date = None

    time_filter = Delivery.created_at >= start_date if start_date else True

    revenue_by_status = (
        db.query(
            Delivery.status.label("status"),func.sum(Delivery.insurance_value).label("total_revenue"),
            func.count(Delivery.id).label("total_orders"))
        .filter(time_filter).group_by(Delivery.status).all())
    

    # revenue_by_status = (
    #     db.query(
    #         Invoice.status.label("status"),func.sum(Invoice.total_value).label("total_revenue"),
    #         func.count(Invoice.id).label("total_orders"))
    #     .filter(time_filter).group_by(Invoice.status).all()) 

    grouped_revenue ={
        "ready_to_pick": 0, # chờ lấy hàng
        "picking": 0, # đang giao
        "delivering":0, # đang giao
        "returning": 0, # trả hàng
        "returned": 0, #trả hàng thành công
        "cancel":0, # hủy
        "delivered": 0 # giao thành công

    }
    grouped_orders = {
        "ready_to_pick": 0,
        "picking": 0,
        "delivered": 0,
        "delivering":0,
        "cancel": 0,
        "returning": 0,
        "returned": 0,
    }



    for status, total_revenue, total_orders in revenue_by_status:
        group = STATUS_MAPPING.get(status, "OTHER")  
        if group in grouped_revenue:
            grouped_revenue[group] += total_revenue
            grouped_orders[group] += total_orders

    return {
        "date_range": "All time (by year)" if date == 0 else f"Last {date} days",
        "total_revenue_by_group": grouped_revenue,
        "total_od_by_group": grouped_orders
    }



# @router.post("/update-order-fee/")
# def update_delivery_service_fee(
#     shop_id: int,
#     order_code: str,
#     db: Session = Depends(get_db)
# ):
#     payload = {"order_code": order_code}
#     headers = {
#         "ShopID": str(shop_id),
#         "Token": GHN_TOKEN  # Đảm bảo token hợp lệ
#     }
    
#     try:
#         response = requests.post(GHN_API_ORDER_INFO, headers=headers, json=payload)
#     except Exception as e:
#         logger.error("Lỗi khi gọi GHN API cho order_code %s: %s", order_code, e, exc_info=True)
#         raise HTTPException(status_code=500, detail="Lỗi khi gọi GHN API")
    
#     if response.status_code != 200:
#         error_message = response.json().get("message", "Không thể lấy phí dịch vụ.")
#         logger.error("GHN API trả về HTTP status %s cho order_code %s: %s", response.status_code, order_code, error_message)
#         raise HTTPException(status_code=response.status_code, detail=f"Lỗi từ GHN API: {error_message}")
    
#     data = response.json()
#     logger.info("Response từ GHN cho order_code %s: %s", order_code, data)
    
#     if data.get("code") != 200:
#         logger.error("GHN API trả về lỗi cho order_code %s: %s", order_code, data)
#         raise HTTPException(status_code=response.status_code, detail="Lỗi từ GHN API")
    
#     service_fee = data.get("data", {}).get("detail", {}).get("main_service")
#     if service_fee is None:
#         logger.error("Không nhận được phí dịch vụ từ GHN cho order_code %s: %s", order_code, data)
#         raise HTTPException(status_code=500, detail="NO_ORDER_FEE_RETURNED")
    
#     delivery = db.query(Delivery).filter(Delivery.order_code == order_code).first()
#     if not delivery:
#         logger.error("Không tìm thấy delivery với order_code: %s", order_code)
#         raise HTTPException(status_code=404, detail="DELIVERY_NOT_FOUND")
    
#     update_required = False
#     if delivery.service_fee != service_fee:
#         delivery.service_fee = service_fee
#         update_required = True
    
#     if update_required:
#         db.commit()
#         db.refresh(delivery)
#         logger.info("Cập nhật phí dịch vụ thành công cho order_code %s: service_fee %s", order_code, service_fee)
#         message = "Cập nhật phí dịch vụ thành công."
#     else:
#         logger.info("Phí dịch vụ không thay đổi cho order_code %s", order_code)
#         message = "Phí dịch vụ không thay đổi."
    
#     return {
#         "message": message,
#         "order_code": order_code,
#         "service_fee": delivery.service_fee
#     }
