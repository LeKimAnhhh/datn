from sqlalchemy import (Column,Integer,String,JSON,DateTime,
    ForeignKey,func
)
from datetime import datetime
from sqlalchemy.orm import relationship
from database.main import Base
import pytz


vietnam_tz = pytz.timezone("Asia/Ho_Chi_Minh")
class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=False)
    shop_id = Column(Integer, ForeignKey("information_shop.shop_id"))
    payment_type_id = Column(Integer, nullable=False)

    # from_name = Column(String(1024), nullable=False)
    # from_phone = Column(String, nullable=False)
    # from_address = Column(String(1024), nullable=False)
    # from_ward_name = Column(String, nullable=False)
    # from_district_name = Column(String, nullable=False)
    # from_province_name = Column(String, nullable=False)

    to_name = Column(String(1024), nullable=False)
    to_phone = Column(String, nullable=False)
    to_address = Column(String(1024), nullable=False)
    to_ward_name = Column(String, nullable=False)
    to_district_name = Column(String, nullable=False)
    to_province_name = Column(String, nullable=False)

    return_phone = Column(String, nullable=True)
    return_address = Column(String(1024), nullable=True)
    return_ward_name = Column(String, nullable=True)
    return_district_name = Column(Integer, nullable=True)
    
    client_order_code = Column(String(50), nullable=True)  #Mã đơn hàng riêng của khách hàng.
    cod_amount = Column(Integer, nullable=False, default=0)
    cod_failed_amount = Column(Integer, nullable=True, default=0)
    content = Column(String(2000), nullable=True)
    weight = Column(Integer, nullable=True)   # grams
    length = Column(Integer, nullable=True)   # cm
    width = Column(Integer, nullable=True)    # cm
    height = Column(Integer, nullable=True)   # cm
    
    service_type_id = Column(Integer, nullable=False)
    pick_station_id = Column(Integer, nullable=True, default=None)
    pick_shift = Column(Integer, nullable=True)
    insurance_value = Column(Integer, nullable=False, default=0)
    coupon = Column(String, nullable=True)
    
    pickup_time = Column(Integer, nullable=True)
    # deliver_station_id = Column(Integer, nullable=True)
    
    note = Column(String(5000), nullable=True)
    required_note = Column(String(500), nullable=False)
    
    status = Column(String, nullable=False, default="ready_to_pick")
    message = Column(String, nullable=True)
    order_code = Column(String, nullable=True)
    payment_status = Column(String, nullable=False, default="unpaid")
    service_fee = Column(Integer, nullable=False, default=0)
    
    invoice = relationship("Invoice", back_populates="delivery")
    information_shop = relationship("InformationShop", back_populates="delivery")
    delivery_items = relationship("DeliveryItem", back_populates="delivery")
    
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    updated_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz), onupdate=lambda: datetime.now(vietnam_tz))

class DeliveryItem(Base):
    __tablename__ = "delivery_items"
    
    id = Column(Integer, primary_key=True, index=True)
    delivery_id = Column(Integer, ForeignKey("deliveries.id"), nullable=False)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    
    name = Column(String, nullable=False)
    code = Column(String, nullable=True)  # thêm trường code theo payload
    quantity = Column(Integer, nullable=False)
    price = Column(Integer, nullable=False)
    length = Column(Integer, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    weight = Column(Integer, nullable=False)
    
    category = Column(JSON, nullable=True)
    
    delivery = relationship("Delivery", back_populates="delivery_items")
    
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    updated_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz), onupdate=lambda: datetime.now(vietnam_tz))

class InformationShop(Base):
    __tablename__ = "information_shop"
    
    shop_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    ward_code = Column(String, nullable=False)
    district_id = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    updated_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz), onupdate=lambda: datetime.now(vietnam_tz))

    delivery = relationship("Delivery", back_populates="information_shop")

