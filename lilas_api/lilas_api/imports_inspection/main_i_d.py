from fastapi import APIRouter, Depends, HTTPException, Security, Query, Body
from sqlalchemy.orm import Session
from suppliers.models_sup import Supplier, SupplierTransaction
from imports_inspection.models import Base
from products.models import Product
from users.main import role_required 
from users.models import User, Account
from fastapi.security import HTTPBearer
from sqlalchemy import func, desc
from database.main import engine  
from users.dependencies import get_db 
from sqlalchemy import or_, func, Integer
from typing import Optional, List
from imports_inspection.models import (ImportBill, ImportBillItem, InspectionReport, InspectionReportItem, InspectionReportHistory, ReturnBill, ReturnBillItem)     
from users.utils import calculate_import_total, calculate_return_total, update_price_import_for_product, reduce_price_import_for_product
from imports_inspection.schema import (
    ImportBillCreate, ImportBillUpdate, ImportBillResponse, ImportBillListResponse, 
    InspectionReportCreate, InspectionReportResponse,InspectionReportUpdate, InspectionReportListResponse, InspectionReportHistoryResponse, ReturnBillCreate, ReturnBillUpdate, ReturnBillResponse, 
    ReturnBillListResponse, ReturnBillItemCreate
)
from datetime import timedelta, datetime
Base.metadata.create_all(bind=engine)
security_scheme = HTTPBearer()

router = APIRouter()


from decimal import Decimal

@router.post("/import_bills", response_model=ImportBillResponse, dependencies=[Security(security_scheme)])
def create_import_bill(
    data: ImportBillCreate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):  
    try:
        if data.items is None or len(data.items) == 0:
            raise HTTPException(status_code=400, detail="IMPORT_BILL_MUST_HAVE_AT_LEAST_ONE_ITEM")
        for item_data in data.items:
            if item_data.quantity < 1:
                raise HTTPException(status_code=400, detail="QUANTITY_MUST_BE_AT_LEAST_1")

        if data.supplier_id:
            supplier = db.query(Supplier).filter(Supplier.id == data.supplier_id, Supplier.active == True).first()
            if not supplier:
                raise HTTPException(status_code=404, detail="NOT_FOUND_SUPPLIER")
        else:
            raise HTTPException(status_code=400)

        if data.user_id:
            user = db.query(User).filter(User.id == data.user_id, User.active == True).first()
            if not user:
                raise HTTPException(status_code=404, detail="NOT_FOUND_USER")
        else:
            raise HTTPException(status_code=400, detail="IMPORT_BILL_MUST_HAVE_USER.")

        valid_products = []
        for item_data in data.items:
            product = db.query(Product).filter(
                Product.id == item_data.product_id,
                Product.dry_stock == True,
                Product.active == True
            ).first()

            if not product:
                raise HTTPException(status_code=404, detail=f"PRODUCT_{item_data.product_id}_IS_NOT_AVAILABLE.")

            valid_products.append(product)
            if data.branch == "Terra":
                product.pending_arrival_terra += item_data.quantity
            elif data.branch == "Thợ Nhuộm":
                product.pending_arrival_thonhuom += item_data.quantity
            else:
                raise HTTPException(status_code=400, detail="BRANCH_NOT_SUPPORTED")
                
            db.commit()
            db.refresh(product)
        
        total_value = sum((item_data.price * item_data.quantity) - item_data.discount for item_data in data.items)
        total_value += (data.extra_fee) - (data.discount)

        if data.paid_amount and data.paid_amount > total_value:
            raise HTTPException(status_code=400, detail="PAID_AMOUNT_CANNOT_EXCEED_TOTAL_VALUE.")

        last_id = db.query(func.max(func.cast(func.substr(ImportBill.id, 3), Integer))).scalar()
        if last_id:
            new_id = f"PN{last_id + 1}"
        else:
            new_id = "PN1"

        new_bill = ImportBill(
            id=new_id,
            supplier_id=supplier.id if supplier else None,
            user_id=user.id if user else None,
            branch=data.branch or "",
            note=data.note or "",
            discount=data.discount,
            extra_fee=data.extra_fee,
            paid_amount=data.paid_amount,
            delivery_date=data.delivery_date
        )
        db.add(new_bill)
        db.commit()
        db.refresh(new_bill)
        for item_data, product in zip(data.items, valid_products):
            new_item = ImportBillItem(
                import_bill_id=new_bill.id,
                product_id=product.id,
                quantity=item_data.quantity,
                price=item_data.price,
                discount=item_data.discount,
            )
            db.add(new_item)        
        db.commit()
        db.refresh(new_bill)

        if data.paid_amount and data.paid_amount > 0:
            transaction = SupplierTransaction(
                supplier_id=supplier.id,
                import_bill_id=new_bill.id,
                amount=data.paid_amount,
                note=f"Thanh toán tạo phiếu nhập {new_bill.id}"
            )
            db.add(transaction)

            supplier.debt -= Decimal(data.paid_amount)
            new_bill.paid_amount = data.paid_amount

            db.commit()
            db.refresh(transaction)

        # Tính tổng
        calculate_import_total(new_bill)
        db.commit()
        db.refresh(new_bill)
        return new_bill
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

from suppliers.main_sup import normalize
@router.get("/import_bills", response_model=ImportBillListResponse, dependencies=[Security(security_scheme)])
def list_import_bills(
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"]),
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = Query(None, description="Tìm kiếm theo nhà cung cấp, chi nhánh, ghi chú...")
):
    query = db.query(ImportBill).join(Supplier, isouter=True).filter(ImportBill.active == True)
    if search:
        bills = query.all()  
        search_normalized = normalize(search)
        filtered_bills = [
                bill for bill in bills
                if search_normalized in normalize(bill.note)
                or search_normalized in normalize(bill.id)
                or search_normalized in normalize(bill.branch)
                or search_normalized in normalize(bill.status)
                or (bill.supplier and search_normalized in normalize(bill.supplier.contact_name))
                or any(search_normalized in normalize(item.product.id) for item in bill.items)
            ]
    else:
         filtered_bills = query.all()

    sorted_imports = sorted(filtered_bills, key=lambda bill: bill.created_at, reverse=True)
    total_import_bills = len(filtered_bills)
    bills = sorted_imports[skip: skip + limit]  
    return {
         "total_import_bills": total_import_bills,
         "import_bills": bills
     }
@router.get("/import_bills/{bill_id}", response_model=ImportBillResponse, dependencies=[Security(security_scheme)])
def get_import_bill(
    bill_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"])
):
    bill = db.query(ImportBill).filter(ImportBill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="NOT_FOUND")

    calculate_import_total(bill)
    return bill

@router.put("/import_bills/{bill_id}", response_model=ImportBillResponse, dependencies=[Security(security_scheme)])
def update_import_bill(
    bill_id: str,
    data: ImportBillUpdate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    bill = db.query(ImportBill).filter(ImportBill.id == bill_id, ImportBill.active == True).first()
    if not bill:
        raise HTTPException(status_code=404, detail="NOT_FOUND")

    if bill.status != "pending":
        raise HTTPException(status_code=400, detail="CAN_NOT_UPDATE_ITEMS_WHEN_IMPORT_BILL_COMPLETED")

    if not data.items or len(data.items) == 0:
        raise HTTPException(status_code=400, detail="IMPORT_BILL_MUST_HAVE_AT_LEAST_ONE_ITEM")

    for item_data in data.items:
        if item_data.quantity < 1:
            raise HTTPException(status_code=400, detail="QUANTITY_MUST_BE_AT_LEAST_1")

    old_branch = bill.branch
    update_data = data.dict(exclude_unset=True)

    for key, value in update_data.items():
        if key != "items":
            setattr(bill, key, value)
    old_items = db.query(ImportBillItem).filter(ImportBillItem.import_bill_id == bill_id).all()

    for old_item in old_items:
        product = db.query(Product).filter(Product.id == old_item.product_id).first()
        if product:
            if old_branch == "Terra":  
                product.pending_arrival_terra -= old_item.quantity
            elif old_branch == "Thợ Nhuộm":
                product.pending_arrival_thonhuom -= old_item.quantity

    db.query(ImportBillItem).filter(ImportBillItem.import_bill_id == bill_id).delete()
    db.commit()

    new_items = []
    for item_data in data.items:
        product = db.query(Product).filter(Product.id == item_data.product_id, Product.dry_stock == True).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"PRODUCT_{item_data.product_id}_IS_NOT_AVAILABLE.")

        new_item = ImportBillItem(
            import_bill_id=bill.id,
            product_id=product.id,
            quantity=item_data.quantity,
            price=item_data.price,
            discount=item_data.discount,
        )
        new_items.append(new_item)

        if data.branch == "Terra":
            product.pending_arrival_terra += item_data.quantity
        elif data.branch == "Thợ Nhuộm":
            product.pending_arrival_thonhuom += item_data.quantity

    db.add_all(new_items)
    db.commit()

    calculate_import_total(bill)
    db.commit()
    db.refresh(bill)
    return bill




@router.post("/import_bills/{bill_id}/pay", dependencies=[Security(security_scheme)])
def pay_import_bill(
    bill_id: str,
    amount: float,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    import_bill = db.query(ImportBill).filter(ImportBill.id == bill_id, ImportBill.active == True).first()
    if not import_bill:
        raise HTTPException(status_code=404, detail="IMPORT_BILL_NOT_FOUND")
    
    if import_bill.status in ["canceled"]:
        raise HTTPException(status_code=400, detail="IMPORT_BILL_NOT_YET_RECEIVED")

    supplier = db.query(Supplier).filter(Supplier.id == import_bill.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="SUPPLIER_NOT_FOUND")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="AMOUNT_MUST_BE_POSITIVE")
    
    total_paid = db.query(func.coalesce(func.sum(SupplierTransaction.amount), 0))\
                  .filter(SupplierTransaction.import_bill_id == bill_id).scalar()
    
    if total_paid + amount > import_bill.total_value:
        raise HTTPException(status_code=400, detail="AMOUNT_EXCEEDS_TOTAL_VALUE")
    
    if import_bill.status not in ["canceled"]:
        supplier.debt -= Decimal(amount)

    transaction = SupplierTransaction(
        supplier_id=supplier.id,
        import_bill_id=bill_id,
        amount=amount,
        note=f"Thanh toán qua phiếu nhập {bill_id}: {amount}"
    )
    db.add(transaction)
    db.commit()

    total_paid = db.query(func.coalesce(func.sum(SupplierTransaction.amount), 0))\
                  .filter(SupplierTransaction.import_bill_id == bill_id).scalar()
    import_bill.paid_amount = float(total_paid)  
    if import_bill.status == "received_unpaid" and import_bill.paid_amount >= import_bill.total_value:
        import_bill.status = "received_paid"

    db.commit()
    db.refresh(supplier)
    db.refresh(import_bill)

    return {
        "msg": "Successful payment.",
        "bill_status": import_bill.status,
        "paid_amount": float(total_paid)
    }

@router.put("/import_bills/{bill_id}/confirm_import", response_model=ImportBillResponse, dependencies=[Security(security_scheme)])
def confirm_import_bill(
    bill_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"])
):
    bill = db.query(ImportBill).filter(ImportBill.id == bill_id, ImportBill.active == True).first()
    if not bill:
        raise HTTPException(status_code=404, detail="NOT_FOUND")

    if bill.status != "pending":
        raise HTTPException(status_code=400, detail="ONLY_PENDING_BILLS_CAN_BE_IMPORTED")

    if len(bill.items) < 1:
        raise HTTPException(status_code=400, detail="IMPORT_BILL_MUST_HAVE_AT_LEAST_ONE_ITEM")

    bill.status = "received_paid" if bill.paid_amount >= bill.total_value else "received_unpaid"
    supplier = db.query(Supplier).filter(Supplier.id == bill.supplier_id).first()
    if supplier:
        supplier.debt += Decimal(bill.total_value)
        supplier.total_import_value += float(bill.total_value)
        supplier.total_import_orders += 1

    db.commit()
    db.refresh(bill)
    db.refresh(supplier)

    # new_price
    total_line_value = 0
    for it in bill.items:
        line_val = (it.price * it.quantity) * (1- (it.discount / 100))
        print(f"ProductID: {it.product_id} | Price: {it.price} | Quantity: {it.quantity} | Discount: {it.discount} => Line Value: {line_val}")
        total_line_value += line_val

    print(f"==> Tổng giá trị chưa tính discount tổng: {total_line_value}")
    print(f"CK tổng (%): {bill.discount} | Chi phí: {bill.extra_fee}")

    for it in bill.items:
        product = it.product
        if not product:
            continue
        
        # ratio
        line_val = (it.price * it.quantity) * (1- (it.discount / 100))
        ratio = line_val / total_line_value if total_line_value != 0 else 0

        discount_alloc = (total_line_value * (bill.discount / 100.0)) * ratio
        extra_fee_alloc = bill.extra_fee * ratio
        cost_in_total = line_val - discount_alloc + extra_fee_alloc
        if it.quantity > 0:
            cost_in_unit = cost_in_total / it.quantity
        else:
            cost_in_unit = it.price

        print(f"\n→ ProductID: {product.id}")
        print(f"  - line_val: {line_val}")
        print(f"  - ratio: {ratio}")
        print(f"  - ratio discount_alloc: {discount_alloc} = {total_line_value} * {bill.discount / 100.0} * {ratio}")
        print(f"  - ratio extra_fee_alloc: {extra_fee_alloc}")
        print(f"  - Tổng giá vốn: {cost_in_total}")
        print(f"  - Giá vốn/SLnhập: {cost_in_unit} = {cost_in_total}/ {it.quantity}")
        
        update_price_import_for_product(db, product, it.quantity, cost_in_unit)
    db.refresh(bill)
    return bill

@router.put("/import_bills/{bill_id}/reactive", response_model=ImportBillResponse, dependencies=[Security(security_scheme)])
def reactive_import_bill(
    bill_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    bill = db.query(ImportBill).filter(ImportBill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    bill.active = True
    db.commit()
    db.refresh(bill)
    return bill


@router.put("/import_bills/{bill_id}/cancel", response_model=ImportBillResponse, dependencies=[Security(security_scheme)])
def cancel_import_bill(
    bill_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    bill = db.query(ImportBill).filter(ImportBill.id == bill_id, ImportBill.status =="pending").first()
    if not bill:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    bill.status = "canceled"
    db.commit()
    db.refresh(bill)
    return bill

@router.post("/inspection_reports", response_model=InspectionReportResponse, dependencies=[Security(security_scheme)])
def create_inspection_report(
    inspection_report_data: InspectionReportCreate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"])
):
    try:
        import_bill = db.query(ImportBill).filter(ImportBill.id == inspection_report_data.import_bill_id).first()
        if not import_bill:
            raise HTTPException(status_code=404, detail="NOT_FOUND_IMPORT_BILL")
        # if import_bill.status not in ["received_paid", "received_unpaid"]:
        if import_bill.status == "pending":
            raise HTTPException(status_code=400, detail="ONLY_RECEIVED_BILLS_CAN_BE_INSPECTED")
        if import_bill.status == "canceled":
            raise HTTPException(status_code=400, detail="IMPORT_BILL_CANCELED")

        user = db.query(User).filter(User.id == inspection_report_data.user_id, User.active == True).first()
        if not user:
            raise HTTPException(status_code=404, detail="NOT_FOUND_USER")

        existing_report = db.query(InspectionReport).filter(InspectionReport.import_bill_id == inspection_report_data.import_bill_id).first()
        if existing_report:
            raise HTTPException(status_code=400, detail="INSPECTION_REPORT_ALREADY_EXISTS")

        last_id = db.query(func.max(func.cast(func.substr(InspectionReport.id, 3), Integer))).scalar()    
        if last_id: 
            new_id = f"PK{last_id + 1}"
        else:
            new_id = "PK1"

        new_inspection_report = InspectionReport(
            id=new_id,
            user_id=user.id,
            import_bill_id=inspection_report_data.import_bill_id,
            branch=inspection_report_data.branch,
            note=inspection_report_data.note,
            status="checking"
        )
        db.add(new_inspection_report)

        for item_data in inspection_report_data.items:
            import_item = db.query(ImportBillItem).filter(
                ImportBillItem.import_bill_id == inspection_report_data.import_bill_id,
                ImportBillItem.product_id == item_data.product_id
            ).first()
            if not import_item:
                raise HTTPException(status_code=404, detail=f"NOT_FOUND_PRODUCT_IN_IMPORT_BILL")

            new_item = InspectionReportItem(
                inspection_report_id=new_inspection_report.id,
                product_id=item_data.product_id,
                quantity=import_item.quantity,
                actual_quantity=item_data.actual_quantity,
                reason=item_data.reason,
                note=item_data.note
            )
            db.add(new_item)

        db.commit()
        db.refresh(new_inspection_report)

        return InspectionReportResponse.from_orm(new_inspection_report)

    except HTTPException as http_exc:
        db.rollback()
        raise http_exc

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal Server Error") from e

@router.put("/inspection_reports/{report_id}", response_model=InspectionReportResponse, dependencies=[Security(security_scheme)])
def update_inspection_report(
    report_id: str,
    data: InspectionReportUpdate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff", "warehouse_staff"])
):
    report = db.query(InspectionReport).filter(
        InspectionReport.id == report_id,
        InspectionReport.active == True
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="NOT_FOUND")

    if report.status != "checking":
        raise HTTPException(status_code=400, detail="CAN_NOT_UPDATE_INSPECTION_REPORT_WHEN_STATUS_IS_NOT_CHECKING.")

    if data.note is not None:
        report.note = data.note
    
    change_details = []  
    
    for item_data in data.items:
        existing_item = db.query(InspectionReportItem).filter(
            InspectionReportItem.inspection_report_id == report_id,
            InspectionReportItem.product_id == item_data.product_id
        ).first()

        if existing_item:
            old_qty = existing_item.actual_quantity
            old_reason = existing_item.reason or ""
            old_note = existing_item.note or ""

            new_qty = item_data.actual_quantity if (item_data.actual_quantity is not None) else old_qty
            new_reason = item_data.reason if item_data.reason else old_reason
            new_note = item_data.note if item_data.note else old_note

            existing_item.actual_quantity = new_qty
            existing_item.reason = new_reason
            existing_item.note = new_note

            if (old_qty != new_qty) or (old_reason != new_reason) or (old_note != new_note):
                change_details.append(
                    f"SP {existing_item.product_id}: SL {old_qty} -> {new_qty}, note='{new_note}'"
                )

        else:
            import_item = db.query(ImportBillItem).filter(
                ImportBillItem.import_bill_id == report.import_bill_id,
                ImportBillItem.product_id == item_data.product_id
            ).first()
            if not import_item:
                raise HTTPException(status_code=404, detail=f"NOT_FOUND_{item_data.product_id}_IN_IMPORT_BILL")

            new_item = InspectionReportItem(
                inspection_report_id=report.id,
                reason=item_data.reason,
                note=item_data.note
            )
            db.add(new_item)

            change_details.append(
                f"Thêm SP {new_item.product_id}: SL {new_item.actual_quantity}, note='{new_item.note}'"
            )

    db.commit()
    db.refresh(report)


    if change_details:
        summary_text = "\n".join(change_details)
    else:
        summary_text = "Không có thay đổi."

    history = InspectionReportHistory(
        inspection_report_id=report.id,
        user_id=current_user.id,
        created_at=datetime.utcnow(),
        reason=new_reason,
        note=summary_text 
    )
    db.add(history)
    db.commit()
    db.refresh(report)

    return report



@router.get("/inspection_reports", response_model=InspectionReportListResponse, dependencies=[Security(security_scheme)])
def list_inspection_reports(
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"]),
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = Query(None)
):
    query = db.query(InspectionReport).filter(InspectionReport.active == True)

    if search:
        s = f"%{search.lower()}%"
        query = query.join(ImportBill, isouter=True).join(Supplier, isouter=True).filter(
            or_(
                func.lower(InspectionReport.note).like(s),
                func.lower(InspectionReport.id).like(s),
                func.lower(InspectionReport.branch).like(s),
                func.lower(InspectionReport.status).like(s),
                func.lower(ImportBill.id).like(s)
            )
        )

    total_reports = query.count()
    reports = query.order_by(desc(InspectionReport.created_at)).offset(skip).limit(limit).all()

    for report in reports:
        report.items = db.query(InspectionReportItem).filter(InspectionReportItem.inspection_report_id == report.id).all()

    return {
        "total_reports": total_reports,
        "reports": reports
    }



@router.put("/inspection_reports/{report_id}/complete", response_model=InspectionReportResponse, dependencies=[Security(security_scheme)])
def complete_inspection_reports(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"])
):
    report = db.query(InspectionReport).filter(InspectionReport.id == report_id, InspectionReport.status == "checking").first()
    if not report:
        raise HTTPException(status_code=404, detail="NOT_FOUND")

    # Cập nhật can_sell cho từng sản phẩm trong phiếu kiểm
    for item in report.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            if report.branch == "Terra":
                product.terra_stock += item.actual_quantity
                product.terra_can_sell+= item.actual_quantity
                # product.pending_arrival_terra -= item.actual_quantity
                product.pending_arrival_terra -= item.actual_quantity
            elif report.branch == "Thợ Nhuộm":
                product.thonhuom_stock += item.actual_quantity
                product.thonhuom_can_sell+= item.actual_quantity
                # product.pending_arrival_thonhuom -= item.actual_quantity
                product.pending_arrival_thonhuom -= item.actual_quantity
            else:
                raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND")
            
            # product.can_sell += item.actual_quantity
            # product.pending_arrival -= item.actual_quantity
 

            db.commit()
            db.refresh(product)

    report.status = "checked"
    report.complete_at = datetime.utcnow()
    db.commit()
    db.refresh(report)

    import_bill = db.query(ImportBill).filter(ImportBill.id == report.import_bill_id).first()
    if import_bill:
        if import_bill.paid_amount >= import_bill.total_value:
            import_bill.status = "received_paid"
        else:
            import_bill.status = "received_unpaid"
            db.commit()
        db.refresh(import_bill)

    report.items = db.query(InspectionReportItem).filter(InspectionReportItem.inspection_report_id == report.id).all()

    return InspectionReportResponse.from_orm(report)



@router.get("/inspection_reports/{report_id}/history", response_model=List[InspectionReportHistoryResponse], dependencies=[Security(security_scheme)])
def get_inspection_report_history(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"])
):
    history = db.query(InspectionReportHistory).filter(InspectionReportHistory.inspection_report_id == report_id).all()
    # if not history:
    #     raise HTTPException(status_code=404, detail="Không tìm thấy lịch sử cho phiếu kiểm này.")
    return [InspectionReportHistoryResponse.from_orm(item) for item in history]

@router.get("/inspection_reports/{report_id}", response_model=InspectionReportResponse, dependencies=[Security(security_scheme)])
def get_inspection_report_detail(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff", "warehouse_staff"])
):
    report = db.query(InspectionReport).filter(InspectionReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    
    report.items = db.query(InspectionReportItem).filter(InspectionReportItem.inspection_report_id == report.id).all()
    return InspectionReportResponse.from_orm(report)


@router.post("/return_bills", response_model=ReturnBillResponse, dependencies=[Security(security_scheme)])
def create_return_bill(
    data: ReturnBillCreate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"])
):
    if not data.items or len(data.items) == 0:
        raise HTTPException(status_code=400, detail="RETURN_BILL_MUST_HAVE_ITEMS")

    supplier = db.query(Supplier).filter(Supplier.id == data.supplier_id, Supplier.active == True).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="NOT_FOUND_SUPPLIER")

    user = db.query(User).filter(User.id == data.user_id, User.active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="NOT_FOUND_USER")

    if not data.branch:
        raise HTTPException(status_code=400, detail="BRANCH_REQUIRED")

    last_id = db.query(
        func.max(func.cast(func.substr(ReturnBill.id, 3), Integer))
    ).scalar()
    new_id = f"TH{last_id + 1}" if last_id else "TH1"

    new_return_bill = ReturnBill(
        id=new_id,
        supplier_id=supplier.id,
        user_id=user.id,
        branch=data.branch,
        note=data.note or "",
        discount=data.discount,
        extra_fee=data.extra_fee,
        paid_amount=data.paid_amount,
        status="returning"
    )
    db.add(new_return_bill)
    db.flush()

    for item_data in data.items:
        product = db.query(Product).filter(
            Product.id == item_data.product_id,
            Product.active == True,
            Product.dry_stock == True
        ).first()

        if not product:
            raise HTTPException(
                status_code=404, detail=f"PRODUCT_{item_data.product_id}_NOT_FOUND_OR_INACTIVE_OR_NOT_DRY"
            )

        if item_data.quantity <= 0:
            raise HTTPException(status_code=400, detail="ITEM_QUANTITY_MUST_BE_POSITIVE")

        if data.branch == "Terra":
            if product.terra_stock < item_data.quantity:
                raise HTTPException(
                    status_code=400, detail=f"PRODUCT_{product.name}_NOT_ENOUGH_IN_{data.branch}"
                )
        elif data.branch == "Thợ Nhuộm":
            if product.thonhuom_stock < item_data.quantity: 
                raise HTTPException(
                    status_code=400, detail=f"PRODUCT_{product.name}_NOT_ENOUGH_IN_{data.branch}"
                )
        else:
            raise HTTPException(status_code=400, detail="BRANCH_NOT_SUPPORTED")

        new_item = ReturnBillItem(
            return_bill_id=new_return_bill.id,
            product_id=product.id,
            quantity=item_data.quantity,
            price=item_data.price,
            discount=item_data.discount
        )
        db.add(new_item)

    db.commit()
    db.refresh(new_return_bill)
    calculate_return_total(db, new_return_bill)

    # get return_bill back after calculating total
    db.refresh(new_return_bill)
    return new_return_bill


@router.get("/return_bills", response_model=ReturnBillListResponse, dependencies=[Security(security_scheme)])
def list_return_bills(
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"]),
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None
):
    query = db.query(ReturnBill)

    if search:
        s = f"%{search.lower()}%"
        query = query.join(Supplier, isouter=True).filter(
            or_(
                func.lower(ReturnBill.id).like(s),
                func.lower(ReturnBill.note).like(s),
                func.lower(ReturnBill.branch).like(s),
                func.lower(ReturnBill.status).like(s),
                func.lower(Supplier.contact_name).like(s)
            )
        )
    total_return_bills = query.count()
    return_bills = query.order_by(ReturnBill.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "total_return_bills": total_return_bills,
        "return_bills": return_bills
    }

@router.get("/return_bills/{return_bill_id}", response_model=ReturnBillResponse, dependencies=[Security(security_scheme)])
def get_return_bill_detail(
    return_bill_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"])
):
    return_bill = db.query(ReturnBill).filter(ReturnBill.id == return_bill_id).first()
    if not return_bill:
        raise HTTPException(status_code=404, detail="RETURN_BILL_NOT_FOUND")

    return return_bill


@router.put("/return_bills/{return_bill_id}", response_model=ReturnBillResponse, dependencies=[Security(security_scheme)])
def update_return_bill(
    return_bill_id: str,
    data: ReturnBillUpdate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"])
):

    return_bill = db.query(ReturnBill).filter(ReturnBill.id == return_bill_id).first()
    if not return_bill:
        raise HTTPException(status_code=404, detail="RETURN_BILL_NOT_FOUND")

    if return_bill.status != "returning":
        raise HTTPException(status_code=400, detail="BILL_COMPLETED")

    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key != "items":
            setattr(return_bill, key, value)

    db.commit()
    db.refresh(return_bill)

    if data.items is not None:
        if len(data.items) == 0:
            raise HTTPException(status_code=400, detail="RETURN_BILL_MUST_HAVE_ITEMS")

        db.query(ReturnBillItem).filter(ReturnBillItem.return_bill_id == return_bill_id).delete()
        db.commit()

        if not return_bill.branch:
            raise HTTPException(status_code=400, detail="BRANCH_NOT_FOUND_IN_BILL")

        for item_data in data.items:
            product = db.query(Product).filter(
                Product.id == item_data.product_id,
                Product.active == True,
                Product.dry_stock == True
            ).first()
            if not product:
                raise HTTPException(
                    status_code=404, detail=f"PRODUCT_{item_data.product_id}_NOT_FOUND_OR_INACTIVE_OR_NOT_DRY"
                )
            if item_data.quantity <= 0:
                raise HTTPException(status_code=400, detail="ITEM_QUANTITY_MUST_BE_POSITIVE")

            if return_bill.branch == "Terra":
                if product.terra_stock < item_data.quantity:
                    raise HTTPException(
                        status_code=400, detail=f"STOCK_NOT_ENOUGH_FOR_PRODUCT_{product.id}"
                    )
            elif return_bill.branch == "Thợ Nhuộm":
                if product.thonhuom_stock < item_data.quantity:
                    raise HTTPException(
                        status_code=400, detail=f"PRODUCT_{product.name}_NOT_ENOUGH_IN_{data.branch}"
                    )
            else:
                raise HTTPException(status_code=400, detail="BRANCH_NOT_SUPPORTED")

            new_item = ReturnBillItem(
                return_bill_id=return_bill.id,
                product_id=product.id,
                quantity=item_data.quantity,
                price=item_data.price,
                discount=item_data.discount
            )
            db.add(new_item)
        db.commit()

    calculate_return_total(db, return_bill)
    db.refresh(return_bill)
    return return_bill


@router.put("/return_bills/{return_bill_id}/confirm", response_model=ReturnBillResponse, dependencies=[Security(security_scheme)])
def confirm_return_bill(
    return_bill_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    return_bill = db.query(ReturnBill).filter(ReturnBill.id == return_bill_id).first()
    if not return_bill:
        raise HTTPException(status_code=404, detail="RETURN_BILL_NOT_FOUND")

    if return_bill.status != "returning":
        raise HTTPException(status_code=400, detail="ONLY_RETURNING_BILL_CAN_BE_CONFIRMED")

    calculate_return_total(db, return_bill)
    for item in return_bill.items:
        product = item.product
        if not product:
            raise HTTPException(status_code=400, detail=f"PRODUCT_{item.product_id}_NOT_FOUND")

        if return_bill.branch == "Terra":
            if product.terra_stock < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"STOCK_NOT_ENOUGH_FOR_PRODUCT_{product.id}"
                )
        elif return_bill.branch == "Thợ Nhuộm":
            if product.thonhuom_stock < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"STOCK_NOT_ENOUGH_FOR_PRODUCT_{product.id}"
                )
        else:
            raise HTTPException(status_code=400, detail="BRANCH_NOT_SUPPORTED")

    # new_price
    total_line_value = 0
    for item in return_bill.items:
        line_val = (item.price * item.quantity)
        print(f"ProductID: {item.product_id} | Price: {item.price} | Quantity: {item.quantity} => Line Value: {line_val}")
        total_line_value += line_val

    print(f"==> Tổng giá trị phiếu: {total_line_value}")
    print(f"Chi phí: {return_bill.extra_fee}")

    for item in return_bill.items:
        product = item.product

        line_val = (item.price * item.quantity)
        ratio = line_val / total_line_value if total_line_value != 0 else 0

        extra_fee_alloc = return_bill.extra_fee * ratio
        cost_in_total = line_val + extra_fee_alloc
        if item.quantity > 0:
            cost_in_unit = cost_in_total / item.quantity
        else:
            cost_in_unit = item.price

        print(f"\n→ ProductID: {product.id}")
        print(f"  - line_val: {line_val}")
        print(f"  - ratio: {ratio}")
        print(f"  - ratio extra_fee_alloc: {extra_fee_alloc}")
        print(f"  - Tổng giá vốn: {cost_in_total}")
        print(f"  - Giá vốn/SLtrả: {cost_in_unit} = {cost_in_total}/ {item.quantity}")

        # reduce_price_import_for_product(db, product, item.quantity, item.price)
        reduce_price_import_for_product(db, product, item.quantity, cost_in_unit)

        if return_bill.branch == "Terra":
            product.terra_stock = max(product.terra_stock - item.quantity, 0)
            product.terra_can_sell = max(product.terra_can_sell - item.quantity, 0)
        else:
            product.thonhuom_stock = max(product.thonhuom_stock - item.quantity, 0)
            product.thonhuom_can_sell = max(product.thonhuom_can_sell - item.quantity, 0)
        
        db.commit()
        db.refresh(product)

    supplier = db.query(Supplier).filter(Supplier.id == return_bill.supplier_id).first()
    if supplier:
        supplier.debt = float(
            Decimal(str(supplier.debt)) - Decimal(str(return_bill.total_value))
        )
        supplier.total_return_orders += 1
        supplier.total_return_value += float(return_bill.total_value)

        db.commit()
        db.refresh(supplier)

    return_bill.status = "returned"
    db.commit()
    db.refresh(return_bill)
    return return_bill

@router.put("/return_bills/{return_bill_id}/cancel", response_model=ReturnBillResponse, dependencies=[Security(security_scheme)])
def cancel_return_bill(
    return_bill_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    try:
        return_bill = db.query(ReturnBill).filter(ReturnBill.id == return_bill_id).first()
        if not return_bill:
            raise HTTPException(status_code=404, detail="RETURN_BILL_NOT_FOUND")

        if return_bill.status != "returning":
            raise HTTPException(status_code=400, detail="ONLY_RETURNING_BILL_CAN_BE_CANCELED")

        return_bill.status = "canceled"
        return_bill.active = False

        db.commit()
        db.refresh(return_bill)
        return return_bill
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))