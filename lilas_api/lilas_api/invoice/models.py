from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.main import Base
from sqlalchemy.sql import func
from datetime import datetime
from sqlalchemy.orm import validates
from customers.models_cus import Customer
from products.models import Product
from delivery.models import Delivery 
import pytz
from typing import Optional


vietnam_tz = pytz.timezone("Asia/Ho_Chi_Minh")
class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    updated_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz), onupdate=lambda: datetime.now(vietnam_tz))
    customer_id = Column(String, ForeignKey("customers.id"), nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="ready_to_pick", nullable=False)  # invoice status: "dang giao dich" | "dang giao hang" | "da hoan thanh" | "da huy"
    payment_status = Column(String, default="unpaid", nullable=False)  # payment status: "da thanh toan" | "chua thanh toan" | "thanh toan 1 phan"
    discount = Column(Float, default=0.0)  # discount toàn đơn
    discount_type = Column(String, default="%", nullable=False)  # "%" hoặc "value"
    deposit = Column(Float, default=0.0)  # tiền cọc
    total_value = Column(Float, default=0.0)  # tổng giá trị đơn sau discount
    note = Column(Text, nullable=True)
    deposit_method = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    is_delivery = Column(Boolean, default=False)
    active = Column(Boolean, default=True)
    stock_restored = Column(Boolean, default=False)
    stock_deducted = Column(Boolean, default=False)
    # stock_updated = Column(Boolean, default=False)

    order_source  = Column(String, nullable=True)
    expected_delivery = Column(DateTime, nullable=True)
    extraCost = Column(Float, nullable=True) 
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")  # 1 đơn hàng có nhiều InvoiceItem
    service_items = relationship("InvoiceServiceItem", back_populates="invoice", cascade="all, delete-orphan", lazy="joined")
    user = relationship("User", back_populates="invoices")
    customer = relationship("Customer", back_populates="invoices")
    delivery = relationship("Delivery", uselist=False, back_populates="invoice", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invoice_id = Column(String, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, default=1)
    price = Column(Float, default=0.0)
    discount_type = Column(String, default="%", nullable=False) 
    discount = Column(Float, default=0.0)  # chiết khấu riêng dòng 
    invoice = relationship("Invoice", back_populates="items")
    product = relationship("Product", back_populates="invoice_items", lazy="joined")
    
    @validates('quantity')
    def validate_quantity(self, key, value):
        if value <= 0:
            raise ValueError("Số lượng sản phẩm phải lớn hơn 0")
        return value
    
class InvoiceServiceItem(Base):
    __tablename__ = "invoice_service_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invoice_id = Column(String, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String, nullable=True)
    name = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    price = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)

    invoice = relationship("Invoice", back_populates="service_items")