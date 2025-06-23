from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import Optional
import re
from typing import List
from customers.schema_cus import CustomerResponse
from fastapi import HTTPException
from unidecode import unidecode

class LoginModel(BaseModel):
    username: str
    password: str

class AccountCreate(BaseModel):
    username: str
    password: str
    role: int
    @validator("username")
    def validate_username(cls, value):
        if " " in value:
            raise HTTPException(status_code=400, detail="USERNAME_CANNOT_CONTAIN_SPACES")

        # Kiểm tra có dấu tiếng Việt
        if value != unidecode(value):
            raise HTTPException(status_code=400, detail="USERNAME_CANNOT_CONTAIN_ACCENTED_CHARACTERS")

        # Kiểm tra có ký tự đặc biệt không hợp lệ (chỉ cho phép chữ và số)
        if not re.match("^[a-zA-Z0-9]+$", value):
            raise HTTPException(status_code=400, detail="USERNAME_CAN_ONLY_CONTAIN_LETTERS_AND_NUMBERS")

        return value
    
    @validator("role")
    def validate_role(cls, value):
        if value not in [1, 2, 3, 4]:
            raise HTTPException(status_code=505, detail="INVALID_ROLE")  # 505: Role không hợp lệ
        return value

    @validator("password")
    def validate_password(cls, value):
        if len(value) < 6:
            raise HTTPException(status_code=506, detail="PASSWORD_TOO_SHORT")  # 506: Mật khẩu quá ngắn
        if not re.search(r'[A-Za-z]', value) or not re.search(r'\d', value):
            raise HTTPException(status_code=507, detail="PASSWORD_WEAK")  # 507: Mật khẩu không đủ mạnh
        return value
    class Config:
        orm_mode = True

class AccountUpdate(BaseModel):
    # password: Optional[str] = None
    role: Optional[int] = None

    @validator('role')
    def validate_role(cls, value):
        if value and value not in [0, 1, 2, 3, 4]:
            raise HTTPException(status_code=505, detail="INVALID_ROLE")
        return value

    # @validator('password')
    # def validate_new_password(cls, value):
    #     if len(value) < 6:
    #         raise ValueError("Mật khẩu phải có tối thiểu 6 ký tự.")
    #     if not re.search(r'[A-Za-z]', value) or not re.search(r'\d', value):
    #         raise ValueError("Mật khẩu phải có ít nhất 1 chữ cái và 1 số.")
    #     return value

    class Config:
        orm_mode = True

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str

    @validator('new_password')
    def validate_new_password(cls, value):
        if len(value) < 6:
            raise HTTPException(status_code=506, detail="PASSWORD_TOO_SHORT")
        if not re.search(r'[A-Za-z]', value) or not re.search(r'\d', value):
            raise HTTPException(status_code=507, detail="PASSWORD_WEAK")
        return value
    
    @validator('confirm_new_password')
    def validate_confirm_new_password(cls, value, values):
        if 'new_password' in values and value != values['new_password']:
            raise HTTPException(status_code=508, detail="PASSWORD_MISMATCH")
        return value

    class Config:
        orm_mode = True
 
class AccountResponse(BaseModel):
    id: str
    username: str
    role: int
    active: bool
    created_at: datetime

    class Config:
        orm_mode = True

class AccountListResponse(BaseModel):
    total_accounts: int
    accounts: List[AccountResponse]

    class Config:
        orm_mode = True
        
class UserCreate(BaseModel):
    # id: Optional[str] = None
    full_name: Optional[str] = None
    role: int  
    address: Optional[str] = None
    shift_work: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None

    @validator('role')
    def validate_role(cls, value):
        if value not in [1, 2, 3, 4]:
            raise HTTPException(status_code=505, detail="INVALID_ROLE")
        return value
    

    @validator('email')
    def validate_email(cls, value):
        if value:
            email_regex = r"[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+" 
            if not re.match(email_regex, value):
                raise HTTPException(status_code=502, detail="INVALID_EMAIL")
        return value
    
    @validator("phone_number")
    def validate_phone(cls, value):
        if value:
            phone_regex = r"^\+(\d{1,3})[-.\s]?(\d{9,15})$"  
            local_phone_regex = r"^0\d{9}$"  

            if not (re.match(phone_regex, value) or re.match(local_phone_regex, value)):
                raise HTTPException(status_code=502, detail="INVALID_PHONE_NUMBER")
            
            # if re.match(phone_regex, value):
            #     if not 10 <= len(value) <= 15:
            #         raise HTTPException(status_code=506, detail="INVALID_LENGTH_PHONE_NUMBER ")
        return value

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    address: Optional[str] = None
    role: Optional[int] = None
    shift_work: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None

class UserResponse(BaseModel):
    id: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    role: int
    address: Optional[str] = None
    shift_work: Optional[str] = None
    email: Optional[str] = None
    total_orders: int = 0
    total_revenue: Optional[float] = 0.0 
    created_at: datetime

    class Config:
        orm_mode = True

class UserListResponse(BaseModel):
    total_users: int
    users: List[UserResponse]
