from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from datetime import datetime, timezone, date
from sqlalchemy.orm import relationship
from database.main import Base
from sqlalchemy.sql import func
from suppliers.models_sup import Supplier
import pytz


vietnam_tz = pytz.timezone("Asia/Ho_Chi_Minh")
class ImportBill(Base):
    __tablename__ = "import_bills"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    updated_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz), onupdate=lambda: datetime.now(vietnam_tz))
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=True)
    supplier = relationship("Supplier", back_populates="import_bills")
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="import_bills")
    branch = Column(String, nullable=True)
    note = Column(Text, nullable=True)
    discount = Column(Float, default=0.0)
    extra_fee = Column(Float, default=0.0)
    total_value = Column(Float, default=0.0)
    paid_amount = Column(Float, default=0.0)
    status = Column(String, default="pending")
    # payment_status = Column(String, default="Chưa thanh toán", nullable=False)
    delivery_date = Column(DateTime, nullable=True)    
    items = relationship("ImportBillItem", back_populates="import_bill", cascade="all, delete-orphan") # Quan hệ 1-n với import_bill_items
    active = Column(Boolean, default=True)
    inspection_reports = relationship("InspectionReport", back_populates="import_bill", cascade="all, delete-orphan") 
    returns = relationship("ImportBillReturn", back_populates="import_bill", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ImportBill(id={self.id}, supplier_id={self.supplier_id}, total={self.total_value})>"


class ImportBillItem(Base):
    __tablename__ = "import_bill_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    import_bill_id = Column(String, ForeignKey("import_bills.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)

    quantity = Column(Integer, default=1)
    price = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)  # % chiết khấu dòng
    total_line = Column(Float, default=0.0)  # thành tiền dòng

    import_bill = relationship("ImportBill", back_populates="items")
    product = relationship("Product", lazy="joined")

    def __repr__(self):
        return f"<ImportBillItem(id={self.id}, product_id={self.product_id})>"


class InspectionReport(Base):
    __tablename__ = "inspection_reports"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="inspection_reports")
    import_bill_id = Column(String, ForeignKey("import_bills.id"), nullable=False)
    import_bill = relationship("ImportBill", back_populates="inspection_reports")
    branch = Column(String, nullable=True)
    note = Column(Text, nullable=True)
    status = Column(String, default="checking")
    active = Column(Boolean, default=True)
    complete_at = Column(DateTime, nullable=True)
    items = relationship("InspectionReportItem", back_populates="inspection_report", cascade="all, delete-orphan")
    history = relationship("InspectionReportHistory", back_populates="inspection_report", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<InspectionReport(id={self.id}, user_id={self.user_id}, status={self.status})>"

class InspectionReportItem(Base):
    __tablename__ = "inspection_reports_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inspection_report_id = Column(String, ForeignKey("inspection_reports.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, default=1)
    actual_quantity = Column(Integer, default=0)
    reason = Column(Text, nullable=True)  # Lý do
    note = Column(Text, nullable=True)  

    inspection_report = relationship("InspectionReport", back_populates="items")
    product = relationship("Product", lazy="joined")
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    def __repr__(self):
        return f"<InspectionReportItem(id={self.id}, product_id={self.product_id}, quantity={self.quantity}, actual_quantity={self.actual_quantity})>"
    

class InspectionReportHistory(Base):
    __tablename__ = "inspection_report_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inspection_report_id = Column(String, ForeignKey("inspection_reports.id", ondelete="CASCADE"), nullable=False)
    # product_id = Column(String, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    # actual_quantity = Column(Integer, default=0)
    reason = Column(Text, nullable=True)
    note = Column(Text, nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    inspection_report = relationship("InspectionReport", back_populates="history")
    # product = relationship("Product", lazy="joined")
    user = relationship("User")

    def __repr__(self):
        return f"<InspectionReportHistory(id={self.id}, product_id={self.product_id}, actual_quantity={self.actual_quantity})>"
 

class ImportBillReturn(Base):
    __tablename__ = "import_bill_returns"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    import_bill_id = Column(String, ForeignKey("import_bills.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=0)
    total_line = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))

    import_bill = relationship("ImportBill", back_populates="returns")
    product = relationship("Product", lazy="joined")

class ReturnBill(Base):
    __tablename__ = "return_bills"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))
    updated_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz), onupdate=lambda: datetime.now(vietnam_tz))

    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=False)
    supplier = relationship("Supplier", back_populates="return_bills")
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="return_bills")

    branch = Column(String, nullable=True)
    note = Column(Text, nullable=True)

    discount = Column(Float, default=0.0)
    extra_fee = Column(Float, default=0.0)
    total_value = Column(Float, default=0.0)
    paid_amount = Column(Float, default=0.0)

    status = Column(String, default="returning")  # returning -> returned -> canceled
    active = Column(Boolean, default=True)

    items = relationship("ReturnBillItem", back_populates="return_bill", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ReturnBill(id={self.id}, supplier_id={self.supplier_id}, total={self.total_value})>"


class ReturnBillItem(Base):
    __tablename__ = "return_bill_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    return_bill_id = Column(String, ForeignKey("return_bills.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)

    quantity = Column(Integer, default=1)
    price = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total_line = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(vietnam_tz))

    return_bill = relationship("ReturnBill", back_populates="items")
    product = relationship("Product", lazy="joined")

    def __repr__(self):
        return f"<ReturnBillItem(id={self.id}, product_id={self.product_id}, quantity={self.quantity})>"