from pydantic import BaseModel, validator, Field, HttpUrl
from datetime import datetime
from typing import Optional
from typing import List
from users.schema import UserResponse
from customers.schema_cus import CustomerResponse
from products.schema import ProductResponse


class InvoiceItemUpdate(BaseModel):
    id: int                  # id để biết dòng item nào cần sửa
    product_id: str
    # quantity: int = Field(..., gt=0)
    quantity: int 
    price: float = Field(..., gt=0)
    discount_type: Optional[str] = None
    discount: float = 0.0

class InvoiceItemCreate(BaseModel):
    product_id: str
    # status: Optional[str] = None
    quantity: int = Field(..., gt=0)
    # price: float = Field(..., gt=0)
    discount_type: Optional[str] = "%" 
    discount: float = 0.0

class InvoiceItemResponse(InvoiceItemCreate):
    id: int
    product_id: str
    quantity: int
    price: float
    discount: float
    discount_type: Optional[str] = None
    product: Optional[ProductResponse] = None
    
    class Config:
        orm_mode = True

class ServiceItemCreate(BaseModel):
    # id: str
    product_id: str
    name: str
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)
    discount_type: Optional[str] = "%" 
    discount: float = 0.0

class ServiceItemResponse(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    discount_type: Optional[str] = None
    discount: float

    class Config:
        orm_mode = True


class InvoiceCreate(BaseModel):
    customer_id: Optional[str] = None
    user_id: Optional[str] = None
    discount: Optional[float] = 0.0
    deposit: Optional[float] = 0.0
    discount_type: Optional[str] = "%" 
    note: Optional[str] = None
    deposit_method: Optional[str] = None
    branch: Optional[str] = None
    is_delivery: Optional[bool] = False
    order_source : Optional[str] = None  
    expected_delivery: Optional[datetime] = None 
    items: List[InvoiceItemCreate]
    service_items: Optional[List[ServiceItemCreate]] = []
    extraCost: Optional[float] = None

class InvoiceUpdate(BaseModel):
    payment_status: Optional[str] = None
    discount: Optional[float] = None
    discount_type: Optional[str] = None
    deposit: Optional[float] = None
    note: Optional[str] = None
    deposit_method: Optional[str] = None
    branch: Optional[str] = None
    is_delivery: Optional[bool] = None
    order_source : Optional[str] = None  
    expected_delivery: Optional[datetime] = None 
    items: Optional[List[InvoiceItemUpdate]] = None # chỉ update items khi invoice còn "dang giao dich"
    service_items: Optional[List[ServiceItemCreate]] = None
    extraCost: Optional[float] = None

class InvoiceResponse(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    customer_id: str
    total_value: float
    # user_id: Optional[str]
    user: Optional[UserResponse] = None
    discount: float
    discount_type: str 
    status: str
    payment_status: str
    deposit: float
    note: Optional[str]
    deposit_method: Optional[str]
    branch: Optional[str]
    is_delivery: bool
    order_source : Optional[str]
    expected_delivery: Optional[datetime] = None
    items: List[InvoiceItemResponse]
    service_items: Optional[List[ServiceItemResponse]] = []
    extraCost: Optional[float] = None 

    customer: Optional[CustomerResponse]
    # user: UserResponse

    class Config:
        orm_mode = True

class InvoiceListResponse(BaseModel):
    total_invoices: int
    invoices: List[InvoiceResponse]


