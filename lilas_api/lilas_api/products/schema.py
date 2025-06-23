from pydantic import BaseModel, validator, Field, HttpUrl
from datetime import datetime
from typing import Optional
from typing import List
from products.models import ProductGroup
from users.schema import UserResponse
from datetime import date
from fastapi import HTTPException

class ProductBase(BaseModel):
    name: str   
    description: Optional[str] = None
    brand: Optional[str] = None
    dry_stock: bool = True
    expiration_date: Optional[date] = None
    price_retail: float = Field(..., gt=0)
    price_import: float = Field(..., gt=0)
    price_wholesale: float = Field(..., gt=0)
    group_name: Optional[str] = None
    barcode : Optional[str] = None
    weight: float = 0 #Field(..., gt=0, description="Khối lượng đơn hàng")
    # barcode: Optional[str] = Field(None, description="Barcode ") 


    @validator('expiration_date', pre=True)
    def parse_expiration_date(cls, value):
        if isinstance(value, str):
            return datetime.strptime(value, "%d-%m-%Y").date()
        return value

    
    # @validator('stock', 'can_sell')
    # def validate_stock(cls, value):
    #     if value < 0:
    #         raise ValueError("Stock và Can_sell không thể là số âm.")
    #     return value
    
    # @validator('group_name')
    # def validate_group_name(cls, value):
    #     from database.main import SessionLocal
    #     db = SessionLocal()
    #     try:
    #         product_group = db.query(ProductGroup).filter(ProductGroup.name == value).first()
    #         if not product_group:
    #             raise HTTPException(status_code=501, detail="INVALID_GROUP") #ValueError("Group không tồn tại.")
    #     finally:
    #         db.close()
    #     return value
    

    # @validator('barcode', pre=True, always=True)
    # def generate_barcode(cls, value):
    #     if value is None or not value.isdigit():  #nếu barcode k có hoặc k hợp lệ
    #         value = str(random.randint(10000000, 9999999999999))  
    #     return value


class ProductCreate(ProductBase):
    # group_id: Optional[int] = None
    # pass

    @validator('group_name')
    def validate_group_name(cls, value):
        if value is None:
            return value
        from database.main import SessionLocal
        db = SessionLocal()
        try:
            product_group = db.query(ProductGroup).filter(ProductGroup.name == value).first()
            if not product_group:
                raise HTTPException(status_code=400, detail="INVALID_GROUP")  # Chỉnh lại thành status 400
        finally:
            db.close()
        return value
    
    @validator('expiration_date')
    def validate_expiration_date(cls, value):
        if value and value < date.today():
            raise HTTPException(status_code=502, detail="EXPIRATION_DATE_MUST_BE_AFTER_CURRENT_DATE") #ValueError("Hạn sử dụng phải sau ngày hiện tại.")
        return value

    def formatted_expiration_date(self) -> Optional[str]:
        if self.expiration_date:
            return self.expiration_date.strftime("%d/%m/%Y")
        return None

class ProductGroupCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProductGroupResponse(BaseModel):
    name: str
    description: str
    created_at: datetime
    updated_at: datetime
    total_orders: int = 0

    class Config:
        orm_mode = True

class ProductGroupListResponse(BaseModel):
    total_groups: int
    groups: List[ProductGroupResponse]

class ProductImageResponse(BaseModel):
    id: int
    url: str

    class Config:
        orm_mode = True
 

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    brand: Optional[str] = None

    expiration_date: Optional[date] = None
    price_retail: Optional[float] = Field(None, gt=0)
    price_import: Optional[float] = Field(None, gt=0)
    price_wholesale: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    weight : Optional[float] = None
    barcode : Optional[str] = None
    group_name: Optional[str] = None
    removed_image_ids: Optional[List[int]] = None


    @validator('group_name')
    def validate_group_name(cls, value):
        if value is None:
            return value
        from database.main import SessionLocal
        db = SessionLocal()
        try:
            product_group = db.query(ProductGroup).filter(ProductGroup.name == value).first()
            if not product_group:
                raise HTTPException(status_code=400, detail="INVALID_GROUP")
        finally:
            db.close()
        return value

class ProductResponse(ProductBase):
    id: str  # ID sản phẩm
    thonhuom_can_sell: int
    terra_can_sell:int
    thonhuom_stock:int
    terra_stock: int
    pending_arrival_thonhuom: Optional[int]
    out_for_delivery_thonhuom: Optional[int]
    pending_arrival_terra: Optional[int]
    out_for_delivery_terra: Optional[int]
    created_at : date
    group: Optional[ProductGroupResponse] 
    #barcode : str 
    barcode: Optional[str]
    images: List[ProductImageResponse] = []
    
    class Config:
        orm_mode = True 
        arbitrary_types_allowed = True

class ProductListResponse(BaseModel):
    total_products: int
    products: List[ProductResponse]
    class Config:
        orm_mode = True

class TransactionTranferItemsCreate(BaseModel):
    product_id: str
    quantity: int

    @validator('quantity')
    def validate_quantity(cls, value):
        if value <= 0:
            raise ValueError("INVALID_QUANTITY")
        return value

class TransactionTranferCreate(BaseModel):
    user_id: str
    from_warehouse: str
    to_warehouse: str
    extra_fee: Optional[float] = None
    note: Optional[str] = None
    items: List[TransactionTranferItemsCreate]  # Không để `= []`, vì cần bắt buộc nhập items

class TransactionTranferUpdate(BaseModel):
    user_id: Optional[str] = None
    from_warehouse: Optional[str] = None
    to_warehouse: Optional[str] = None
    extra_fee: Optional[float] = None
    # status: Optional[str] = None
    note: Optional[str] = None
    items: Optional[List[TransactionTranferItemsCreate]] = None

class TransactionTranferItemsResponse(BaseModel):
    id: int
    product_id: str
    quantity: int
    product: Optional["ProductResponse"] = None

    class Config:
        orm_mode = True

class TransactionTranferResponse(BaseModel):
    id: str
    user_id: str
    user: Optional[UserResponse]
    from_warehouse: str
    to_warehouse: str
    extra_fee: Optional[float] = None
    status: Optional[str] = None
    note: Optional[str] = None
    active: bool
    items: List[TransactionTranferItemsResponse]  # Đảm bảo trả về danh sách sản phẩm trong giao dịch
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class TransactionTranferListResponse(BaseModel):
    total_transactions: int
    transactions: List[TransactionTranferResponse]

    class Config:
        orm_mode = True

class edit_product(BaseModel):
    terra_can_sell: Optional[int] = None
    thonhuom_can_sell: Optional[int] = None
    terra_stock: Optional[int] = None
    thonhuom_stock: Optional[int] = None