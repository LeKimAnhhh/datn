from pydantic import BaseModel, EmailStr, validator
from decimal import Decimal
from datetime import datetime
from typing import Optional
import re
from fastapi import HTTPException

class SupplierCreate(BaseModel):
    # company_name: str
    contact_name: Optional[str] = None
    address: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    debt: Optional[Decimal] = 0.0
    # paid_amount: Optional[Decimal] = 0.0 
    # established_date: Optional[datetime] = None

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
class SupplierResponse(BaseModel):
    id: str
    # company_name: str
    contact_name: Optional[str]
    address: Optional[str]
    email: Optional[str] = None
    phone: Optional[str] = None
    debt: Optional[Decimal]
    # paid_amount: Optional[Decimal]
    active: bool 
    # established_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    total_import_orders: int
    total_import_value: float
    total_return_orders: int
    total_return_value: float

    class Config:
        orm_mode = True
class SupplierlistResponse(BaseModel):
    total_suppliers: int
    suppliers: list[SupplierResponse]