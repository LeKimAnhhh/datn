from fastapi import APIRouter, Depends, HTTPException, Query, Security
from sqlalchemy.orm import Session
from typing import Optional, List
from customers.models_cus import Base, Customer, CustomerGroup
from customers.schema_cus import (
    CustomerCreate, CustomerResponse, 
    CustomerGroupCreate, CustomerGroupResponse,
    CustomerListResponse, CustomerGroupListResponse
)
from fastapi.security import HTTPBearer
from users.main import role_required 
from users.models import User, Account
from sqlalchemy import func, Integer, desc
from database.main import engine  
from users.dependencies import get_db 
from sqlalchemy import or_, func
from sqlalchemy.orm import joinedload


router = APIRouter()
security_scheme = HTTPBearer()

Base.metadata.create_all(bind=engine)


@router.post("/customers", response_model=CustomerResponse, dependencies=[Security(security_scheme)])
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff", "collaborator"])
):
    if not customer.full_name:
        raise HTTPException(status_code=400, detail="NAME_REQUIRED")

    # if not customer.province_id or not customer.district_id or not customer.ward_code:
    #     raise HTTPException(status_code=400, detail="Địa chỉ đầy đủ bao gồm Tỉnh, Quận, và Phường là bắt buộc.")

    khach_trang_group = db.query(CustomerGroup).filter(CustomerGroup.name == 'Khách Trắng').first()
    if khach_trang_group:
        if customer.group_id == khach_trang_group.id and customer.full_name != 'Khách Trắng':
            raise HTTPException(status_code=400, detail="ONLY_ALLOW_CREATE_CUSTOMER_NAME_KHACH_TRANG_IN_GROUP_KHACH_TRANG")
        if customer.group_id != khach_trang_group.id and customer.full_name == 'Khách Trắng':
            raise HTTPException(status_code=400, detail="CUSTOMER_KHACH_TRANG_GROUP_REQUIRED")
        
    if customer.phone:
        existing_phone_customer = db.query(Customer).filter(Customer.phone == customer.phone).first()
        if existing_phone_customer:
            raise HTTPException(status_code=400, detail="PHONE_NUMBER_REQUIRED")
        
    if customer.email:
        existing_email_customer = db.query(Customer).filter(Customer.email == customer.email).first()
        if existing_email_customer:
            raise HTTPException(status_code=400, detail="EMAIL_EXISTED")
        
    if not customer.group_id:
        default_group = db.query(CustomerGroup).filter(CustomerGroup.name == 'Khách Lẻ').first()
        if not default_group:
            raise HTTPException(status_code=500, detail="DEFAULT_GROUP_NOT_FOUND_KHACH_LE")
        customer.group_id = default_group.id

    last_id = db.query(func.max(func.cast(func.substr(Customer.id, 3), Integer))).scalar()
    if last_id:
        new_id = f"KH{last_id + 1}"
    else:
        new_id = "KH1"

    new_customer = Customer(id=new_id, **customer.dict())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return CustomerResponse.from_orm(new_customer)


@router.get("/customers/{customer_id}", response_model=CustomerResponse, dependencies=[Security(security_scheme)])
def get_customer(
    customer_id: str, 
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin","staff"])
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    
    return CustomerResponse.from_orm(customer)


@router.put("/customers/{customer_id}", response_model=CustomerResponse, dependencies=[Security(security_scheme)])
def update_customer(
    customer_id: str, 
    customer_update: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin","staff"])
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="NOT_FOUND")

    if customer_update.phone:
        existing_phone = db.query(Customer).filter(
            Customer.phone == customer_update.phone, Customer.id != customer_id
        ).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="PHONE_NUMBER_REQUIRED")
        
    if customer.full_name == "Khách Trắng":
         raise HTTPException(status_code=400, detail="CANNOT_UPDATE_KHACH_TRANG_CUSTOMER")
    if customer_update.email:
        existing_email = db.query(Customer).filter(Customer.email == customer.email, Customer.id != customer_id
        ).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="EMAIL_REQUIRED")
    # update fields
    update_data = customer_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(customer, key, value)

    db.commit()
    db.refresh(customer)
    return CustomerResponse.from_orm(customer)

from suppliers.main_sup import normalize

@router.get("/customers", response_model=CustomerListResponse, dependencies=[Security(security_scheme)])
def list_customers(
    limit: int = Query(10, description="Số lượng khách hàng trên mỗi trang"),
    skip: int = Query(0, description="Số lượng khách hàng bỏ qua"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên, số điện thoại hoặc email"),
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff", "collaborator"])
):
    query = db.query(Customer).filter(Customer.active == True, Customer.full_name != "Khách Trắng")
    customers = query.all()

    if search:
        search_normalized = normalize(search)
        customers = [
            c for c in customers
            if search_normalized in normalize(c.full_name)
            or search_normalized in normalize(c.phone)
            or search_normalized in normalize(c.email)
            or (c.group and search_normalized in normalize(c.group.name))
        ]
    customers.sort(key=lambda c: c.full_name.split(' ')[-1].lower())  

    total_customers = len(customers)
    customers = customers[skip: skip + limit] 

    result = [
        CustomerResponse(
            id=c.id,
            full_name=c.full_name,
            address=c.address,
            phone=c.phone,
            date_of_birth=c.date_of_birth,
            email=c.email,
            group_name=c.group.name if c.group else None,
            group_id=c.group_id,
            group=CustomerGroupResponse.from_orm(c.group) if c.group else None,
            total_spending=c.total_spending,
            active=c.active,
            debt=c.debt,
            total_order=c.total_order,
            total_return_spending=c.total_return_spending,
            total_return_orders=c.total_return_orders,
            created_at=c.created_at
        )
        for c in customers
    ]

    return {"total_customers": total_customers, "customers": result}


@router.get("/top", response_model=List[CustomerResponse], dependencies=[Security(security_scheme)])
def get_top_customers(
    limit: int = Query(5, description="Top 5 khách hàng"),
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    query = db.query(Customer).filter(Customer.active == True, Customer.total_spending > 0)

    top_customers = (
        query.order_by(desc(Customer.total_spending))
        .limit(limit)
        .all()
    )

    if not top_customers:
        raise HTTPException(status_code=404, detail="NOT_FOUND")

    return top_customers

@router.put("/deactivate_customer/{customer_id}", dependencies=[Security(security_scheme)])
def deactivate_customer(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.full_name != "Khách Trắng").first()
    if not customer:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    customer.active = False
    db.commit()
    return {"msg": "Xóa khách hàng thành công."}


@router.post("/groups", response_model=CustomerGroupResponse, dependencies=[Security(security_scheme)])
def create_group(
    group: CustomerGroupCreate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff"])
):
    existing_group = db.query(CustomerGroup).filter(CustomerGroup.name == group.name).first()
    if existing_group:
        raise HTTPException(status_code=400, detail="CUSTOMER_GROUP_ALREADY_EXISTS")

    new_group = CustomerGroup(**group.dict())
    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    return CustomerGroupResponse(
        id=new_group.id,
        name=new_group.name,
        description=new_group.description,
        discount_type=new_group.discount_type,
        discount=new_group.discount,
        total_customers=0,
        total_spending=0.0,
        total_order=0,
        created_at=new_group.created_at
    )

from suppliers.main_sup import normalize

@router.get("/groups", response_model=CustomerGroupListResponse, dependencies=[Security(security_scheme)])
def list_groups(
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff", "collaborator"]),
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên hoặc mô tả")
):
    query = db.query(CustomerGroup).filter(CustomerGroup.name != "Khách Trắng")
    groups = query.order_by(CustomerGroup.created_at.desc()).all()

    if search:
        search_normalized = normalize(search)
        groups = [
            g for g in groups
            if search_normalized in normalize(g.name)
            or search_normalized in normalize(g.description)
        ]

    total_groups = len(groups)
    groups = groups[skip: skip + limit]

    subquery_stats = (
        db.query(
            Customer.group_id.label("grp_id"),
            func.count(Customer.id).label("total_customers"),
            func.sum(Customer.total_order).label("sum_orders"),
            func.sum(Customer.total_spending).label("sum_spending")
        )
        .group_by(Customer.group_id)
        .subquery()
    )

    stats_data = db.query(
        subquery_stats.c.grp_id,
        subquery_stats.c.total_customers,
        subquery_stats.c.sum_orders,
        subquery_stats.c.sum_spending
    ).all()

    stats_map = {s.grp_id: {"total_customers": s.total_customers or 0, 
                             "sum_orders": s.sum_orders or 0, 
                             "sum_spending": s.sum_spending or 0} for s in stats_data}

    result = [
        CustomerGroupResponse(
            id=g.id,
            name=g.name,
            description=g.description,
            discount_type=g.discount_type,
            discount=g.discount,
            total_customers=stats_map.get(g.id, {}).get("total_customers", 0),
            total_spending=stats_map.get(g.id, {}).get("sum_spending", 0),
            total_order=stats_map.get(g.id, {}).get("sum_orders", 0),
            created_at=g.created_at
        )
        for g in groups
    ]

    return {"total_groups": total_groups, "groups": result}


@router.get("/groups/{group_id}", response_model=CustomerGroupResponse, dependencies=[Security(security_scheme)])
def get_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    group = db.query(CustomerGroup).filter(CustomerGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="NOT_FOUND")

    # tính lại
    total_customers = len(group.customers)
    total_order = sum(customer.total_order for customer in group.customers)
    total_spending = sum(customer.total_spending for customer in group.customers)

    return CustomerGroupResponse(
        id=group.id,
        name=group.name,
        description=group.description,
        discount_type=group.discount_type,
        discount=group.discount,
        total_customers=total_customers,
        total_spending=total_spending,
        total_order=total_order,
        created_at=group.created_at
    )


@router.put("/groups/{group_id}", response_model=CustomerGroupResponse, dependencies=[Security(security_scheme)])
def update_group(
    group_id: int,
    group_data: CustomerGroupCreate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    group = db.query(CustomerGroup).filter(CustomerGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    if group.name == "Khách Trắng":
        raise HTTPException(status_code=400, detail="CANNOT_UPDATE_KHACH_TRANG_GROUP")
    
    if group_data.name:
        same_name = db.query(CustomerGroup).filter(CustomerGroup.name == group_data.name, CustomerGroup.id != group_id).first()
        if same_name:
            raise HTTPException(status_code=400, detail="CUSTOMER_GROUP_ALREADY_EXISTS")

    group.name = group_data.name
    group.description = group_data.description
    group.discount_type = group_data.discount_type or "percent"
    group.discount = group_data.discount

    db.commit()
    db.refresh(group)

    # tính lại
    total_customers = len(group.customers)
    total_order = sum(customer.total_order for customer in group.customers)
    total_spending = sum(customer.total_spending for customer in group.customers)

    return CustomerGroupResponse(
        id=group.id,
        name=group.name,
        description=group.description,
        discount_type=group.discount_type,
        discount=group.discount,
        total_customers=total_customers,
        total_spending=total_spending,
        total_order=total_order,
        created_at=group.created_at
    )

@router.delete("/groups/{group_id}", dependencies=[Security(security_scheme)])
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"]
    )
):
    default_group = db.query(CustomerGroup).filter(CustomerGroup.name == "Khách Lẻ").first()
    if not default_group:
        raise HTTPException(status_code=400, detail="DEFAULT_GROUP_NOT_FOUND_KHACH_LE")
    if group_id == default_group.id:
        raise HTTPException(status_code=400, detail="CANNOT_DELETE_DEFAULT_GROUP_KHACH_LE")

    group = db.query(CustomerGroup).filter(CustomerGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="CUSTOMER_GROUP_NOT_FOUND")

    customers_in_group = db.query(Customer).filter(Customer.group_id == group_id).all()
    for customer in customers_in_group:
        customer.group_id = default_group.id

    db.commit()

    db.delete(group)
    db.commit()
    return {"detail": "Xóa nhóm khách hàng thành công."}


from customers.models_cus import Transaction
from customers.schema_cus import TransactionListResponse

import uuid
from invoice.models import Invoice

@router.get("transaction", response_model=TransactionListResponse, dependencies=[Security(security_scheme)])
def list_transactions(
    limit: int = 10,
    skip: int = 0,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    transactions = db.query(Transaction).all()
    total_transactions = len(transactions)
    transactions = transactions[skip: skip + limit]

    return {"total_transactions": total_transactions, "transactions": transactions}


@router.post("/customers/{customer_id}/pay")
def process_payment(customer_id: str, invoice_id: str, 
                    db: Session = Depends(get_db),
                    current_user: Account = role_required(["admin"])
                    ):  
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="CUSTOMER_NOT_FOUND")

    transaction = db.query(Transaction).filter(
        Transaction.invoice_id == invoice_id, 
        Transaction.active == True
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="TRANSACTION_NOT_FOUND_OR_PAID")

    if transaction.amount <= 0:
        raise HTTPException(status_code=400, detail="INVALID_AMOUNT")

    if transaction.amount > customer.debt:
        raise HTTPException(status_code=400, detail="AMOUNT_GREATER_THAN_DEBT")
    
    transaction.active = False
    customer.debt -= transaction.amount

    invoice = db.query(Invoice).filter(Invoice.id == transaction.invoice_id).first()
    if invoice:
        # invoice.payment_status = "paid"
        # invoice.total_value -= transaction.amount
        invoice.deposit = 0

    db.add(transaction)  
    db.commit()
    db.refresh(transaction)
    return transaction


@router.post("/customers/{customer_id}/pay-amount")
def process_payment_amount(
    customer_id: str,
    pay_for_customer: float,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="CUSTOMER_NOT_FOUND")

    if pay_for_customer <= 0:
        raise HTTPException(status_code=400, detail="INVALID_AMOUNT")

    if pay_for_customer > customer.debt:
        raise HTTPException(status_code=400, detail="AMOUNT_GREATER_THAN_DEBT")

    customer.debt -= pay_for_customer
    transaction = Transaction(
        # id=str(uuid.uuid4()),
        customer_id=customer_id,
        amount=pay_for_customer,
        note = f"Thanh toán tự do {pay_for_customer} cho khách hàng {customer.full_name}"
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    db.commit()
    return transaction.note
    