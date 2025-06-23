from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from invoice.schema import InvoiceResponse

class CategorySchema(BaseModel):
    level1: Optional[str] = None


class DeliveryItemBase(BaseModel):
    name: str
    code: Optional[str] = None
    quantity: int
    price: int
    length: int
    width: int
    height: int
    weight: int
    category: Optional[CategorySchema] = None

class DeliveryItemCreate(DeliveryItemBase):
    pass

class DeliveryItem(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    quantity: int
    price: int
    length: int
    width: int
    height: int
    weight: int
    category: Optional[CategorySchema] = None

    class Config:
        orm_mode = True

class DeliveryBase(BaseModel):
    # shop_id: int
    payment_type_id: int
    note: Optional[str] = None
    required_note: str

    return_phone: Optional[str] = None
    return_address: Optional[str] = None
    return_district_name: Optional[str] = None
    return_ward_name: Optional[str] = None

    client_order_code: Optional[str] = None

    cod_amount: int
    content: Optional[str] = None
    length: int
    width: int
    height: int
    weight: int
    cod_failed_amount: Optional[int] = None
    cupon: Optional[str] = None

    pick_station_id: Optional[int] = None
    deliver_station_id: Optional[int] = None
    insurance_value: int
    service_type_id: int
    coupon: Optional[str] = None

    pickup_time: Optional[int] = None
    pick_shift: Optional[int] = None

    items: List[DeliveryItemCreate]

class DeliveryCreate(DeliveryBase):
    pass

class Delivery(BaseModel):
    id: int
    payment_type_id: int
    note: Optional[str] = None
    required_note: str
    return_phone: Optional[str] = None
    return_address: Optional[str] = None
    return_district_id: Optional[int] = None
    return_ward_code: Optional[str] = None
    client_order_code: Optional[str] = None
    # from_name: str
    # from_phone: str
    # from_address: str
    # from_ward_code: Optional[str] = None
    # from_district_id: Optional[str] = None
    to_name: str
    to_phone: str
    to_address: str
    to_ward_name: Optional[str] = None
    to_district_name: Optional[str] = None
    to_province_name: Optional[str] = None
    cod_amount: int
    # content: Optional[str] = None
    length: int
    width: int
    height: int
    weight: int
    cod_failed_amount: Optional[int] = None
    pick_station_id: Optional[int] = None
    # deliver_station_id: Optional[int] = None
    insurance_value: int
    service_type_id: int
    coupon: Optional[str] = None
    pickup_time: Optional[int] = None
    pick_shift: Optional[int] = None

    delivery_items: List[DeliveryItem] = []

    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

from datetime import datetime

class DeliveryListResponse(BaseModel):
    invoice_id : str
    order_code: str
    invoice: Optional[InvoiceResponse] = None

    to_name: str
    to_phone:str
    status: str
    payment_status: str
    content:str
    to_address:str
    cod_amount: Optional[int]
    insurance_value: Optional[int]
    created_at: datetime
    # amount_due: float

    class Config:
        orm_mode = True

class DeliveriesResponse(BaseModel):
    total_deliveries: int
    deliveries: List[DeliveryListResponse]

    class Config:
        orm_mode = True

class Shopcreate(BaseModel):
    name: str
    address: str
    phone: str
    district_id: int
    ward_code: str

    class Config:
        orm_mode = True

class ShopUpdate(BaseModel):
    name: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    district_id: Optional[int]
    ward_code: Optional[str]

    class Config:
        orm_mode = True

class ShopResponse(BaseModel):
    shop_id: Optional[int] 
    name: Optional[str] 
    address: Optional[str]
    phone: Optional[str]
    district_id: Optional[int]
    ward_code: Optional[str] 

    class Config:
        orm_mode = True

class DeliveryResponse(BaseModel): 
    id: int
    order_code: str
    status: str
    message: str
    data: dict
    shop_address: Optional[ShopResponse] = None
    # pickup_time: str
    class Config:
        orm_mode = True
class PickupTimeResponse(BaseModel):
    order_code: str
    pickup_time: str  

    class Config:
        orm_mode = True
