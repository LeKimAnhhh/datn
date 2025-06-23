from sqlalchemy import Column, Integer, String, Float, DateTime, Numeric, func, Boolean, ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship

from database.main import Base
import pytz


vietnam_tz = pytz.timezone("Asia/Ho_Chi_Minh")
class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(String, primary_key=True, index=True)
    # company_name = Column(String, nullable=False)
    contact_name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    debt = Column(Numeric, default=0.0)
    # paid_amount = Column(Numeric, default=0.0) 

    total_import_orders = Column(Integer, default=0)
    total_import_value = Column(Float, default=0.0)
    total_return_orders = Column(Integer, default=0)
    total_return_value = Column(Float, default=0.0)

    active = Column(Boolean, default=True)    
    # established_date = Column(DateTime, default=datetime)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    updated_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz), onupdate=lambda: datetime.now(vietnam_tz))
    import_bills = relationship("ImportBill", back_populates="supplier", lazy="joined")
    transactions = relationship("SupplierTransaction", back_populates="supplier", cascade="all, delete-orphan")
    return_bills = relationship("ReturnBill", back_populates="supplier")

    def __repr__(self):
        return f"<Supplier(id={self.id}, contact_name={self.contact_name}, debt={self.debt})>"
    
class SupplierTransaction(Base):
    __tablename__ = "supplier_transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    import_bill_id = Column(String, ForeignKey("import_bills.id"), nullable=True)
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=False)
    amount = Column(Float, nullable=False)
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    supplier = relationship("Supplier", back_populates="transactions")