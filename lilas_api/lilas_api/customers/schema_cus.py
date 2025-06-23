from pydantic import BaseModel, EmailStr, validator
from datetime import datetime, date
from typing import Optional
import re
from sqlalchemy import Date
from fastapi import HTTPException
# CUSTOMER_GROUPS = ["Khách Lẻ", "Khách Buôn", "Đại Lý", "Khách VIP"]

class CustomerCreate(BaseModel):
    full_name: str
    email: Optional[str]
    phone: Optional[str] = None
    date_of_birth: Optional[date]
    group_id: Optional[int]
    address: Optional[str]
    province: Optional[str]
    district_id: Optional[int]
    district_name: Optional[str]
    ward_code: Optional[str]
    ward_name: Optional[str]
    debt: Optional[float] = 0.0

    @validator("phone")
    def validate_phone(cls, value):
        if value:
            phone_regex = r"^\+(\d{1,3})[-.\s]?(\d{9,15})$"
            local_phone_regex = r"^0\d{9}$"

            if not (re.match(phone_regex, value) or re.match(local_phone_regex, value)):
                raise HTTPException(status_code=503, detail="INVALID_PHONE_NUMBER")
            if re.match(phone_regex, value):
                if not 10 <= len(value) <= 15:
                    raise HTTPException(status_code=504, detail="INVALID_LENGTH_PHONE_NUMBER ")
        return value
    @validator('email')
    def validate_email(cls, value):
        if value:
            email_regex = r"[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+" 
            if not re.match(email_regex, value):
                raise HTTPException(status_code=502, detail="INVALID_EMAIL")
        return value
    # @validator("group_id")
    # def validate_group(cls, value):
    #     if value and value not in range(1, len(CUSTOMER_GROUPS) + 1):
    #         raise ValueError(f"Group ID must be between 1 and {len(CUSTOMER_GROUPS)}")
    #     return value

class CustomerGroupCreate(BaseModel):
    name: str
    description: Optional[str]
    discount_type: Optional[str] = "percent"
    discount: float

class CustomerGroupResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    discount_type: str
    discount: float
    total_customers: int = 0
    total_spending: float = 0.0
    total_order: int = 0
    created_at: datetime
    # updated_at: datetime

    class Config:
        orm_mode = True


class CustomerResponse(BaseModel):
    id: str
    full_name: str
    address: Optional[str]
    phone: str
    date_of_birth: Optional[date]
    email: Optional[str]
    group_name: Optional[str] = None
    group_id: Optional[str]
    province: Optional[str]
    district_name: Optional[str]
    ward_name: Optional[str]
    group: Optional[CustomerGroupResponse]
    total_spending: float
    active: bool
    debt: Optional[float] = 0.0 
    total_order: int
    total_return_spending: float
    total_return_orders: int
    # ward_code: Optional[str] = None
    # district_id: Optional[int] = None
    created_at: datetime

    class Config:
        orm_mode = True

class CustomerListResponse(BaseModel):
    total_customers: int
    customers: list[CustomerResponse]

class CustomerGroupListResponse(BaseModel):
    total_groups: int
    groups: list[CustomerGroupResponse]

class TransactionBase(BaseModel):
    id: int
    customer_id: str
    transaction_id: int
    amount: float
    note: Optional[str] = None
    # payment_method: str 
    class Config:
        orm_mode = True

class TransactionListResponse(BaseModel):
    total_transactions: int
    transactions: list[TransactionBase]