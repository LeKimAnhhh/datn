from pydantic import BaseModel, EmailStr, validator
from datetime import datetime, date
from typing import Optional
from typing import List
from users.schema import UserResponse
from suppliers.schema_sup import SupplierResponse 
from products.schema import ProductResponse 

class ImportBillItemCreate(BaseModel):
    product_id: str
    quantity: int = 1
    price: float = 0.0
    discount: float = 0.0  # %

class ImportBillItemResponse(BaseModel):
    id: str
    product_id: Optional[str]
    quantity: int
    price: float
    discount: float
    total_line: float
    product: Optional[ProductResponse] = None

    class Config:
        orm_mode = True

class ImportBillCreate(BaseModel):
    supplier_id: Optional[str]
    user_id: Optional[str]
    branch: Optional[str]
    note: Optional[str]
    discount: float = 0.0
    extra_fee: float = 0.0
    paid_amount: float = 0.0
    items: List[ImportBillItemCreate] 
    delivery_date: Optional[datetime] = None
 
class ImportBillUpdate(BaseModel):
    supplier_id: Optional[str]
    user_id: Optional[str]
    branch: Optional[str]
    note: Optional[str]
    discount: Optional[float]
    extra_fee: Optional[float]
    paid_amount: Optional[float]
    status: Optional[str]
    delivery_date: Optional[datetime]
    # update items khi bill "dang giao dich"
    items: Optional[List[ImportBillItemCreate]]

class ImportBillReturnCreate(BaseModel):
    product_id: str
    quantity: int

class ImportBillReturnResponse(BaseModel):
    id: int
    import_bill_id: str
    product_id: str
    product: Optional[ProductResponse] = None
    quantity: int
    total_line: int
    created_at: datetime

    class Config:
        orm_mode = True

class ImportBillResponse(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    supplier_id: Optional[str]
    supplier: Optional[SupplierResponse]
    user_id: Optional[str]
    user: Optional[UserResponse]
    branch: Optional[str]
    note: Optional[str]
    discount: float
    extra_fee: float
    total_value: float
    paid_amount: float
    status: str
    delivery_date: Optional[datetime]
    active: bool

    items: List[ImportBillItemResponse] = []
    returns: List[ImportBillReturnResponse] = []

    class Config:
        orm_mode = True

class ImportBillListResponse(BaseModel):
    total_import_bills: int
    import_bills: List[ImportBillResponse]

    class Config:
        orm_mode = True

class InspectionReportItemUpdate(BaseModel):
    product_id: str
    actual_quantity: Optional[int] = None
    reason: Optional[str] = None
    note: Optional[str] = None

class InspectionReportUpdate(BaseModel):
    branch: Optional[str]
    note: Optional[str] = None
    # user_id: Optional[str] = None
    items: List[InspectionReportItemUpdate]

class InspectionReportItemCreate(BaseModel):
    product_id: str
    actual_quantity: int
    reason: str
    note: str

class InspectionReportCreate(BaseModel):
    user_id: str
    import_bill_id: str
    branch :str
    note: str
    items: List[InspectionReportItemCreate]

class InspectionReportItemResponse(BaseModel):
    id: int
    inspection_report_id: str
    product_id: str
    product: Optional[ProductResponse] = None
    quantity: int
    actual_quantity: int
    reason: str
    note: str

    class Config:
        orm_mode = True

class InspectionReportResponse(BaseModel):
    id: str
    user_id: str
    user: Optional[UserResponse]
    import_bill_id: str
    import_bill: Optional[ImportBillResponse] = None
    branch: str
    note: str
    status: str
    created_at: datetime
    complete_at: Optional[datetime] = None

    items: List[InspectionReportItemResponse]

    class Config:
        orm_mode = True

class InspectionReportHistoryResponse(BaseModel):
    id: int
    inspection_report_id: str
    user_id: str
    # product_id: str
    # actual_quantity: int
    reason: str
    note: str
    created_at: datetime

    class Config:
        orm_mode = True


class InspectionReportListResponse(BaseModel):
    total_reports: int
    reports: List[InspectionReportResponse]

    class Config:
        orm_mode = True

class ReturnBillItemCreate(BaseModel):
    product_id: str
    quantity: int = 1
    price: float = 0.0
    discount: float = 0.0

class ReturnBillItemResponse(BaseModel):
    id: int
    product_id: Optional[str]
    quantity: int
    price: float
    discount: float
    total_line: float
    created_at: datetime
    product: Optional[ProductResponse] = None

    class Config:
        orm_mode = True
class ReturnBillCreate(BaseModel):
    supplier_id: str
    user_id: str
    branch: Optional[str] = None
    note: Optional[str] = None
    discount: float = 0.0
    extra_fee: float = 0.0
    paid_amount: float = 0.0
    items: List[ReturnBillItemCreate]

class ReturnBillUpdate(BaseModel):
    supplier_id: Optional[str]
    user_id: Optional[str]
    branch: Optional[str]
    note: Optional[str]
    discount: Optional[float]
    extra_fee: Optional[float]
    paid_amount: Optional[float]
    status: Optional[str]
    items: Optional[List[ReturnBillItemCreate]]

class ReturnBillResponse(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime

    supplier_id: str
    supplier: Optional[SupplierResponse] = None
    user_id: str
    user: Optional[UserResponse] = None

    branch: Optional[str]
    note: Optional[str]
    discount: float
    extra_fee: float
    total_value: float
    paid_amount: float
    status: str
    active: bool

    items: List[ReturnBillItemResponse] = []

    class Config:
        orm_mode = True

class ReturnBillListResponse(BaseModel):
    total_return_bills: int
    return_bills: List[ReturnBillResponse]

    class Config:
        orm_mode = True