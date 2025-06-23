from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Date
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from database.main import Base, SessionLocal
import pytz


vietnam_tz = pytz.timezone("Asia/Ho_Chi_Minh")
class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    email = Column(String, nullable=True)
    group_id = Column(Integer, ForeignKey("customer_groups.id"), nullable=True, default=1)
    group = relationship("CustomerGroup", back_populates="customers")
    total_spending = Column(Float, default=0.0)
    province = Column(String, nullable=True)
    district_id = Column(Integer, nullable=True)
    district_name = Column(String, nullable=True)
    ward_code = Column(String, nullable=True)
    ward_name = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    debt = Column(Float, default=0.0)
    total_order = Column(Integer, default=0)
    total_return_spending = Column(Float, default=0.0)
    total_return_orders = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    invoices = relationship("Invoice", back_populates="customer")
    transactions = relationship("Transaction", back_populates="customer")

    def __repr__(self):
        return f"<Customer(id={self.id}, name={self.full_name})>"

class CustomerGroup(Base):
    __tablename__ = "customer_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    discount_type = Column(String, nullable=False, default="percent")  
    discount = Column(Float, default=0.0)
    # payment_form = Column(String, nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    updated_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz), onupdate=lambda: datetime.now(vietnam_tz))

    customers = relationship("Customer", back_populates="group")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=True)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String, nullable=False, default="refund")  
    note = Column(String, nullable=True)
    active = Column(Boolean, default=True) 
    # payment_method = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))

    customer = relationship("Customer", back_populates="transactions")
    invoice = relationship("Invoice", back_populates="transactions")

from sqlalchemy import event
@event.listens_for(CustomerGroup.__table__, 'after_create')
def insert_default_customer_groups(target, connection, **kw):
    session = SessionLocal()
    default_groups = [
        {"name": "Khách Lẻ", "discount_type": "percent", "discount": 0.0, "description": "Nhóm khách hàng lẻ"},
        {"name": "Khách Buôn", "discount_type": "percent", "discount": 10, "description": "Nhóm khách hàng buôn"},
        {"name": "Khách Trắng", "discount_type": "percent", "discount": 0.0, "description": "Nhóm khách hàng trắng"},
        {"name": "Khách VIP", "discount_type": "percent", "discount": 15, "description": "Nhóm khách hàng VIP"},
        {"name": "Đại lý", "discount_type": "percent", "discount": 13, "description": "Nhóm đại lý"},
    ]
    for group in default_groups:
        existing_group = session.query(CustomerGroup).filter_by(name=group["name"]).first()
        if not existing_group:
            new_group = CustomerGroup(**group)
            session.add(new_group)
    session.commit()
    session.close()

@event.listens_for(Customer.__table__, 'after_create')
def insert_default_customer(target, connection, **kw):
    session = SessionLocal()

    group = session.query(CustomerGroup).filter_by(name="Khách Trắng").first()
    if group:
        customer_exists = session.query(Customer).filter_by(full_name="Khách Trắng").first()
        if not customer_exists:
            new_customer = Customer(
                id = "KH1",
                full_name="Khách Trắng",
                phone="0000000000",
                group_id=group.id,  
                district_id=0, 
                district_name="N/A",
                ward_code="N/A",
                ward_name="N/A"
            )
            session.add(new_customer)

    session.commit()
    session.close()