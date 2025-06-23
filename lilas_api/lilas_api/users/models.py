from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, Date, Text
from sqlalchemy.orm import relationship
from database.main import Base
from sqlalchemy.orm import validates
from datetime import datetime, timezone
from sqlalchemy.sql import func
from pydantic import validator
from imports_inspection.models import ImportBill
import pytz


vietnam_tz = pytz.timezone("Asia/Ho_Chi_Minh")
class Account(Base):
    __tablename__ = 'account'

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    hashed_password = Column(String)
    role = Column(Integer)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    

    @validates('role')
    def validate_role(self, key, value):
        if value not in [1, 2, 3, 4]:
            raise ValueError("Quyền truy cập phải là 1 (admin), 2 (staff), 3 (collaborator), hoặc 4 (warehouse_staff)")
        return value

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role={self.role})>"

    class Config:
        orm_mode = True
        str_strip_whitespace = True
        str_min_length = 1


class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    role = Column(Integer)
    active = Column(Boolean, default=True)
    address = Column(String, nullable=True)
    shift_work = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    email = Column(String, nullable=True)
    invoices = relationship("Invoice", back_populates="user", cascade="all, delete-orphan")
    total_orders = Column(Integer, default=0)
    total_revenue = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    import_bills = relationship("ImportBill", back_populates="user", lazy="joined")
    inspection_reports = relationship("InspectionReport", back_populates="user", lazy="joined")
    return_bills = relationship("ReturnBill", back_populates="user")  
    tranfers = relationship("TransactionTranfers", back_populates="user", lazy="joined")

    @validates('role')
    def validate_role(self, key, value):
        if value not in [1, 2, 3, 4]:
            raise ValueError("Quyền truy cập phải là 1 (admin), 2 (staff), 3 (collaborator), hoặc 4 (warehouse_staff)")
        return value

    def __repr__(self):
        return f"<User(id={self.id}, full_name='{self.full_name}', role={self.role})>"

    class Config:
        orm_mode = True
        str_strip_whitespace = True
        str_min_length = 1
