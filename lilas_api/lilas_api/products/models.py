from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from database.main import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import validates
from datetime import datetime, timezone
from pydantic import validator
import pytz


vietnam_tz = pytz.timezone("Asia/Ho_Chi_Minh")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    url = Column(String, nullable=False)
    product = relationship("Product", back_populates="images")       

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)  
    description = Column(Text, nullable=True)  
    brand = Column(String, nullable=True) 
    thonhuom_can_sell = Column(Integer, default=0)   
    terra_can_sell = Column(Integer, default=0)   
    terra_stock = Column(Integer, default=0)
    thonhuom_stock = Column(Integer, default=0)
    dry_stock = Column(Boolean, default=True)  
    expiration_date = Column(Date, nullable=True)  
    price_retail = Column(Float, nullable=False)  
    price_import = Column(Float, nullable=False) 
    price_wholesale = Column(Float, nullable=False)  
    image_url = Column(String, nullable=True)
    #
    active = Column(Boolean, default=True)
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")

    pending_arrival_thonhuom = Column(Integer, default=0)
    out_for_delivery_thonhuom = Column(Integer, default=0)
    pending_arrival_terra = Column(Integer, default=0)
    out_for_delivery_terra = Column(Integer, default=0)

    invoice_items = relationship("InvoiceItem", back_populates="product", lazy="joined") 
    tranfers_items = relationship("TransactionTranferItems", back_populates="product", lazy="joined")
    group_name = Column(String, ForeignKey("product_groups.name", ondelete="SET NULL"), nullable=True)
    group = relationship("ProductGroup", back_populates="products")
    barcode = Column(String, nullable=True) 
    weight = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))


    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}', price={self.price_retail})>" 
    @validator('stock', 'can_sell')
    def validate_stock(cls, value):
        if value < 0:
            raise ValueError("Stock và Can_sell không thể là số âm.")
        return value
    
    class Config:
        orm_mode = True
        str_strip_whitespace = True  
        str_min_length = 1          

class ProductGroup(Base):
    __tablename__ = "product_groups"

    name = Column(String, unique=True, nullable=False, primary_key=True)
    description = Column(Text, nullable=True) 
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    updated_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz), onupdate=lambda: datetime.now(vietnam_tz))

    products = relationship("Product", back_populates="group")

    def __repr__(self):
        return f"<ProductGroup(name='{self.name}')>"

class TransactionTranfers(Base):
    __tablename__ = "transaction_tranfers"

    id = Column(String, primary_key=True, index=True)
    from_warehouse = Column(String, nullable=False)
    to_warehouse = Column(String, nullable=False)
    # product_id = Column(String, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    extra_fee = Column(Float, nullable=True)
    status = Column(String, nullable=False, default="ready_to_pick")
    note = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    updated_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz), onupdate=lambda: datetime.now(vietnam_tz))

    user = relationship("User", back_populates="tranfers")
    items = relationship("TransactionTranferItems", back_populates="tranfer", cascade="all, delete-orphan")

class TransactionTranferItems(Base):
    __tablename__ = "transaction_tranfers_items"

    id = Column(Integer, primary_key=True, index=True)
    tranfer_id = Column(Integer, ForeignKey("transaction_tranfers.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, default=0) 

    tranfer = relationship("TransactionTranfers", back_populates="items")
    product = relationship("Product", lazy="joined")