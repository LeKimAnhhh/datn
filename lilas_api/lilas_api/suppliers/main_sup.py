from fastapi import APIRouter, Depends, HTTPException, Security, Query
from sqlalchemy.orm import Session
from suppliers.models_sup import Supplier, Base, SupplierTransaction
from suppliers.schema_sup import SupplierCreate, SupplierResponse,SupplierlistResponse
from users.main import role_required 
from users.models import User, Account
from fastapi.security import HTTPBearer
from sqlalchemy import func, Integer, desc, or_
from database.main import engine  
from users.dependencies import get_db 
from typing import Optional
from decimal import Decimal

Base.metadata.create_all(bind=engine)
security_scheme = HTTPBearer()

router = APIRouter()
@router.post("/suppliers", response_model=SupplierResponse, dependencies=[Security(security_scheme)])
def create_supplier(supplier: SupplierCreate, 
                    db: Session = Depends(get_db),
                    current_user: Account = role_required(["admin"])):

    if not supplier.contact_name:
        raise HTTPException(status_code=400, detail="CONTACT_NAME_REQUIRED")
    
    # existing_active_supplier = db.query(Supplier).filter(
    #     Supplier.contact_name == supplier.contact_name,
    #     Supplier.active == True
    existing_supplier = db.query(Supplier).filter(
        func.lower(Supplier.contact_name) == func.lower(supplier.contact_name)
    ).first()

    # if existing_active_supplier:
    #     raise HTTPException(
    #         status_code=400, 
    #         detail="CONTACT_NAME_ALREADY_USED"
    #     )
    if existing_supplier:
        raise HTTPException(status_code=400, detail="CONTACT_NAME_ALREADY_USED")

    if supplier.phone:
        existing_phone_supplier = db.query(Supplier).filter(Supplier.phone == supplier.phone).first()
        if existing_phone_supplier:
            raise HTTPException(status_code=400, detail="PHONE_NUMBER_ALREADY_USED")

    if supplier.email:
        existing_email_supplier = db.query(Supplier).filter(Supplier.email == supplier.email).first()
        if existing_email_supplier:
            raise HTTPException(status_code=400, detail="EMAIL_ALREADY_USED")

    last_id = db.query(func.max(func.cast(func.substr(Supplier.id, 4), Integer))).scalar()

    new_id = f"NCC{(last_id + 1) if last_id else 1}"

    new_supplier = Supplier(id = new_id, **supplier.dict())
    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)
    return new_supplier

from unidecode import unidecode

def normalize(text):
    return unidecode(text).lower() if text else ""


@router.get("/suppliers", response_model=SupplierlistResponse, dependencies=[Security(security_scheme)])
def get_suppliers(skip: int = 0, 
                limit: int = 10, 
                db: Session = Depends(get_db),
                current_user: Account = role_required(["admin", "warehouse_staff"]),
                search: Optional[str] = Query(None, description="Tìm kiếm nhà cung cấp theo tên, số điện thoại hoặc email")
                ):
    query = db.query(Supplier).filter(Supplier.active == True)

    suppliers = query.order_by(desc(Supplier.created_at)).all()

    if search:
        search_normalized = normalize(search)
        suppliers = [
            supplier for supplier in suppliers
            if search_normalized in normalize(supplier.contact_name)
            or search_normalized in normalize(supplier.phone)
            or search_normalized in normalize(supplier.email)
            or search_normalized in normalize(supplier.address)
        ]

    total_suppliers = len(suppliers)
    suppliers = suppliers[skip: skip + limit] 

    return {"total_suppliers": total_suppliers, "suppliers": suppliers}

@router.get("/suppliers/{supplier_id}", response_model=SupplierResponse, dependencies=[Security(security_scheme)])
def get_supplier(supplier_id: str, 
                db: Session = Depends(get_db),
                current_user: Account = role_required(["admin"])):
    
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    return supplier

@router.put("/suppliers/{supplier_id}", response_model=SupplierResponse, dependencies=[Security(security_scheme)])
def update_supplier(supplier_id: str, 
                    supplier_update: SupplierCreate, 
                    db: Session = Depends(get_db),
                    current_user: Account = role_required(["admin"])):
    
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    
    if supplier_update.contact_name:
        existing_supplier = db.query(Supplier).filter(
            func.lower(Supplier.contact_name) == func.lower(supplier_update.contact_name),
            Supplier.id != supplier_id  
        ).first()
        if existing_supplier:
            raise HTTPException(status_code=400, detail="CONTACT_NAME_ALREADY_USED")
        
    # # paid_amount 
    # if supplier_update.paid_amount is not None:
    #     if supplier_update.paid_amount < 0:
    #         raise HTTPException(status_code=400, detail="Số tiền đã trả không thể âm.")
    #     supplier.paid_amount = supplier_update.paid_amount
    #     if supplier.debt - supplier.paid_amount <= 0:
    #         supplier.debt = 0 
    #     else:
    #         supplier.debt -= supplier.paid_amount

    # for key, value in supplier_update.dict(exclude_unset=True).items():
    #     if key != "paid_amount":  # ko ghi đè cột đã trả
    #         setattr(supplier, key, value)
    
    # if supplier_update.contact_name:
    #     existing_name_supplier = db.query(Supplier).filter(
    #         Supplier.contact_name == supplier_update.contact_name, Supplier.id != supplier_id).first()
    #     if existing_name_supplier:
    #         raise HTTPException(status_code=400, detail="SUPPLIER_NAME_ALREADY_EXISTS")

    if supplier_update.email:
        existing_email_supplier = db.query(Supplier).filter(
            Supplier.email == supplier_update.email, Supplier.id != supplier_id).first()
        if existing_email_supplier:
            raise HTTPException(status_code=400, detail="EMAIL_ALREADY_EXISTS")

    if supplier_update.phone:
        existing_phone_supplier = db.query(Supplier).filter(
            Supplier.phone == supplier_update.phone, Supplier.id != supplier_id).first()
        if existing_phone_supplier:
            raise HTTPException(status_code=400, detail="PHONE_NUMBER_ALREADY_EXISTS") 

    for key, value in supplier_update.dict(exclude_unset=True).items():
        setattr(supplier, key, value)

    db.commit()
    db.refresh(supplier)
    return supplier

@router.put("/deactivate_supplier/{supplier_id}", dependencies=[Security(security_scheme)])
def deactivate_supplier(
    supplier_id = str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    supplier.active = False
    db.commit()
    return {"msg": "Xóa nhà cung cấp thành công."}


@router.post("/suppliers/{supplier_id}/pay-amount", dependencies=[Security(security_scheme)])
def process_payment_supplier(
    supplier_id: str,
    pay_for_supplier: float,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="SUPPLIER_NOT_FOUND")

    # if pay_for_supplier <= 0:
    #     raise HTTPException(status_code=400, detail="INVALID_AMOUNT")

    supplier.debt -= Decimal(pay_for_supplier)
    transaction = SupplierTransaction(
        supplier_id=supplier_id,
        amount=pay_for_supplier,
        note=f"Thanh toán tự do {pay_for_supplier}"
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return {"msg": "Thanh toán thành công."}

