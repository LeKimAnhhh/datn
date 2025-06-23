from fastapi import APIRouter, Depends, HTTPException, Security, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from products.models import Product, ProductGroup, ProductImage, Base, TransactionTranfers, TransactionTranferItems
from users.main import role_required 
from users.models import User

from invoice.models import InvoiceItem
from fastapi.security import HTTPBearer
from sqlalchemy import func, desc
from database.main import engine  
from users.dependencies import get_db 
from sqlalchemy import or_, func
from typing import Optional, List
from sqlalchemy import Integer 
from users.models import Account
import json
import os
from products.schema import (ProductCreate, ProductResponse, ProductListResponse, ProductUpdate, TransactionTranferCreate, ProductGroupCreate, ProductGroupResponse, ProductGroupListResponse,
                            TransactionTranferResponse, TransactionTranferListResponse, TransactionTranferUpdate, edit_product)
from datetime import datetime

Base.metadata.create_all(bind=engine)
security_scheme = HTTPBearer()

router = APIRouter()

@router.put("/edit_stock/{product_id}", dependencies=[Security(security_scheme)])
def edit_stock(product_id: str, stock: edit_product, db: Session = Depends(get_db), current_user: Account = role_required(["developer"])):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="NOT_FOUND")

    product.thonhuom_can_sell = stock.thonhuom_can_sell
    product.terra_can_sell = stock.terra_can_sell
    product.thonhuom_stock = stock.thonhuom_stock
    product.terra_stock = stock.terra_stock
    db.commit()
    db.refresh(product)
    return product


def transfer_stock(product_id: str, from_warehouse: str, to_warehouse: str, quantity: int, db: Session):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="NOT_FOUND")

    if from_warehouse == "Terra" and product.terra_stock < quantity:
        raise HTTPException(status_code=400, detail=f"{product.name}_TERRA_STOCK_NOT_ENOUGH")
    if from_warehouse == "Thợ Nhuộm" and product.thonhuom_stock < quantity:
        raise HTTPException(status_code=400, detail=f"{product.name}_THONHUOM_STOCK_NOT_ENOUGH")

    if from_warehouse == "Terra":
        product.terra_stock -= quantity
    elif from_warehouse == "Thợ Nhuộm":
        product.thonhuom_stock -= quantity

    if to_warehouse == "Terra":
        product.terra_stock += quantity
    elif to_warehouse == "Thợ Nhuộm":
        product.thonhuom_stock += quantity

    db.commit()
    db.refresh(product)
    return product

@router.post("/products", response_model=ProductResponse, dependencies=[Security(security_scheme)])
async def create_product(
    # product: ProductCreate = Depends(), 
    product_data: str = Form(...),
    images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db), 
    current_user: Account = role_required(["admin"])
):    
    try:
        product_dict = json.loads(product_data)
        product_create = ProductCreate(**product_dict)
    except (ValueError, json.JSONDecodeError):
        print(f"JSON Parsing Error: {str(e)}")
        raise HTTPException(status_code=400, detail="DATA_NOT_JSON")
    
    # existing_product = db.query(Product).filter(Product.name == product.name).first()
    existing_product = db.query(Product).filter(Product.name == product_create.name).first()
    if existing_product:
        raise HTTPException(status_code=409, detail="PRODUCT_NAME_ALREADY_EXISTS")

    # if product.group_name:
    #     product_group = db.query(ProductGroup).filter(ProductGroup.name == product.group_name).first()
    if product_create.group_name:
        product_group = db.query(ProductGroup).filter(ProductGroup.name == product_create.group_name).first()
        if not product_group:
            raise HTTPException(status_code=400, detail="GROUP_NAME_NOT_FOUND")
    
    last_id = db.query(func.max(func.cast(func.substr(Product.id, 3), Integer))).scalar()

    if last_id: 
        new_id = f"SP{last_id + 1}"
    else:
        new_id = "SP1"
        
    # # if product.barcode is None:
    # if product_create.barcode is None:
    #     raise HTTPException(status_code=400, detail="BARCODE_REQUIRED")
        
    # new_product = Product(id=new_id, **product.dict(exclude_unset=True))
    new_product = Product(id=new_id, **product_create.dict(exclude_unset=True))
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    allowed_extensions = ["image/jpeg", "image/png"]
    max_size = 5 * 1024 * 1024 
    image_dir = "static/images"

    if not os.path.exists(image_dir):
        os.makedirs(image_dir, exist_ok=True)
    try:
        existing_images_count = db.query(ProductImage).filter(ProductImage.product_id == new_product.id).count()
        if existing_images_count + len(images) > 50:
            raise HTTPException(status_code=400, detail="PRODUCTS_EXCEED_50_IMG")
    except Exception as e:
        pass
    image_urls = []  
    if images: 
        timestamp = int(datetime.now().timestamp())
        counter = 1

        for img in images:
            if img.content_type not in allowed_extensions:
                raise HTTPException(status_code=400, detail=f"File {img.filename} không đúng định dạng (chỉ jpg hoặc png).")
            contents = await img.read()
            if len(contents) > max_size:
                raise HTTPException(status_code=400, detail=f"File {img.filename} vượt quá kích thước 5MB.")

            file_name = f"{new_product.id}_{timestamp}_{counter}.png"
            file_path = os.path.join(image_dir, file_name)
            with open(file_path, "wb") as f:
                f.write(contents)

            url = f"/static/images/{file_name}"
            image_urls.append(url)
            product_image = ProductImage(product_id=new_product.id, url=url)
            db.add(product_image)
            counter += 1

    
        new_product.image_url = "\n".join(image_urls)

    db.commit()
    db.refresh(new_product)

    return new_product

@router.get("/products_name_import", response_model=ProductListResponse, dependencies=[Security(security_scheme)])
def get_products_name_import(
    skip: int = 0, 
    limit: int = 10, 
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên sản phẩm."),
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff", "warehouse_staff"])
 ):
    query = db.query(Product).filter(Product.dry_stock == True)
 
    products = query.order_by(desc(Product.created_at)).all()
 
    if search:
        search_normalized = normalize(search)
        products = [product for product in products if search_normalized in normalize(product.name)]
 
    total_products = len(products)
    products = products[skip: skip + limit]
 
    for product in products:
        if product.group:
            product.group.total_orders = (
                db.query(Product)
                .filter(Product.group_name == product.group_name)
                .count()
            )
 
    return {"total_products": total_products, "products": products}

from suppliers.main_sup import normalize


@router.get("/products_name", response_model=ProductListResponse, dependencies=[Security(security_scheme)])
def get_products_name(
    skip: int = 0, 
    limit: int = 10, 
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên sản phẩm."),
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff", "warehouse_staff", "collaborator"])
):
    query = db.query(Product).filter(Product.dry_stock == True)
    query = query.filter(or_(Product.thonhuom_can_sell > 0, Product.terra_can_sell > 0))
 
    products = query.order_by(desc(Product.created_at)).all()

    if search:
        search_normalized = normalize(search)
        products = [product for product in products if search_normalized in normalize(product.name)]

    total_products = len(products)
    products = products[skip: skip + limit]

    for product in products:
        if product.group:
            product.group.total_orders = (
                db.query(Product)
                .filter(Product.group_name == product.group_name)
                .count()
            )

    return {"total_products": total_products, "products": products}
from suppliers.main_sup import normalize

@router.get("/products", response_model=ProductListResponse, dependencies=[Security(security_scheme)])
def get_products(
    skip: int = 0, 
    limit: int = 10, 
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên, mô tả, thương hiệu, barcode, hoặc nhóm sản phẩm."),
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff", "warehouse_staff", "developer"]),
):
    ROLE_MAPPING = {
        "true": True,
        "false": False,
        "có thể bán": True,
        "không thể bán": False,
        "co the ban": True,
        "ngung ban": False,
        "ngừng bán": False,
        "khong the ban": False
    }

    query = db.query(Product)
    products = query.all()  

    if search:
        search_normalized = normalize(search)
        products = [
            product for product in products
            if search_normalized in normalize(product.name)
            # or search_normalized in normalize(product.description)
            or search_normalized in normalize(product.brand)
            or search_normalized in normalize(product.barcode)
            or search_normalized in normalize(product.group_name)
            or (search_normalized in ROLE_MAPPING and product.dry_stock == ROLE_MAPPING[search_normalized])
        ]

    sorted_products = sorted(products, key=lambda product: product.created_at, reverse=True)
  
    total_products = len(products)
    products = sorted_products[skip: skip + limit]  

    for product in products:
        if product.group:
            product.group.total_orders = (
                db.query(Product)
                .filter(Product.group_name == product.group_name)
                .count()
            )

    return {"total_products": total_products, "products": products}





@router.get("/product/{product_id}", response_model=ProductResponse, dependencies=[Security(security_scheme)])
def get_product(product_id: str, db: Session = Depends(get_db),
                current_user: Account = role_required(["admin", "developer", "staff", 'warehouse_staff'])):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="NOT_FOUND")    
    
    # total_orders nếu product.group tồn tại
    if product.group:
        product.group.total_orders = (
            db.query(Product)
            .filter(Product.group_name == product.group_name)
            .count()
        )
    
    return product


import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.put("/products/{product_id}", response_model=ProductResponse, dependencies=[Security(security_scheme)])
async def update_product(
    product_id: str,
    product_data: str = Form(...),  # JSON của ProductUpdate
    removed_image_ids: Optional[str] = Form(None),  # ID ảnh dạng JSON
    images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "developer"]),
):
    product = db.query(Product).filter(Product.id == product_id, Product.dry_stock == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="PRODUCT_IS_STOP_ACTIVE")

    # Parse JSON product_update
    try:
        product_update_dict = json.loads(product_data)
        product_update = ProductUpdate(**product_update_dict)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="DATA_NOT_JSON")

    # Validate group_name nếu có
    if product_update.group_name:
        product_group = db.query(ProductGroup).filter(ProductGroup.name == product_update.group_name).first()
        if not product_group:
            raise HTTPException(status_code=400, detail="GROUP_NAME_NOT_FOUND")

    # Cập nhật các trường của product
    for key, value in product_update.dict(exclude_unset=True, exclude={"removed_image_ids"}).items():
        setattr(product, key, value)

    removed_ids = []
    if removed_image_ids:
        try:
            removed_ids = json.loads(removed_image_ids)
            if isinstance(removed_ids, int):
                removed_ids = [removed_ids]
            elif not isinstance(removed_ids, list):
                raise ValueError
        except (json.JSONDecodeError, ValueError):
            raise HTTPException(status_code=400, detail="DELETED_IMAGE_IDS_NOT_VALID")

    if removed_ids:
        images_to_remove = db.query(ProductImage).filter(ProductImage.product_id == product.id, ProductImage.id.in_(removed_ids)).all()
        image_dir = "static/images"

        for img_obj in images_to_remove:
            if img_obj.url:
                file_path = os.path.join(image_dir, os.path.basename(img_obj.url))
                try:
                    os.remove(file_path)  
                    logger.info(f"Đã xóa ảnh: {file_path}")
                except FileNotFoundError:
                    logger.warning(f"Không tìm thấy ảnh: {file_path}")
                except Exception as e:
                    logger.error(f"Lỗi khi xóa ảnh {file_path}: {str(e)}")

            db.delete(img_obj)

        db.commit()

    if product_update.description and len(product_update.description.encode('utf-8')) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="DESCRIPTION_TOO_LARGE")

    existing_images = db.query(ProductImage).filter(ProductImage.product_id == product.id).all()
    existing_image_urls = {img.url for img in existing_images}
    
    images = images or []
    if len(existing_image_urls) + len(images) > 50:
        raise HTTPException(status_code=400, detail="PRODUCTS_EXCEED_50_IMG")

    if images:
        allowed_extensions = ["image/jpeg", "image/png"]
        max_size = 5 * 1024 * 1024  # 5MB
        timestamp = int(datetime.now().timestamp())
        counter = 1

        image_dir = "static/images"
        os.makedirs(image_dir, exist_ok=True)

        new_image_urls = set()

        for img in images:
            if img.content_type not in allowed_extensions:
                raise HTTPException(status_code=400, detail=f"INVALID FILE FORMAT FOR {img.filename}. ONLY JPG AND PNG ARE ALLOWED.")

            file_name = f"{product.id}_{timestamp}_{counter}.png"
            file_path = os.path.join(image_dir, file_name)
            new_image_url = f"/static/images/{file_name}"

            if new_image_url in existing_image_urls:
                logger.info(f"Ảnh {new_image_url} đã tồn tại, bỏ qua.")
                continue

            contents = await img.read()
            if len(contents) > max_size:
                raise HTTPException(status_code=400, detail=f"{img.filename} EXCEEDS THE 5MB FILE SIZE LIMIT.")

            with open(file_path, "wb") as f:
                f.write(contents)

            new_image = ProductImage(product_id=product.id, url=new_image_url)
            db.add(new_image)
            new_image_urls.add(new_image_url)
            counter += 1

        if new_image_urls:
            all_image_urls = existing_image_urls.union(new_image_urls)
            product.image_url = "\n".join(all_image_urls)

    db.commit()
    db.refresh(product)

    return product


@router.put("/products/{product_id}/activate", response_model=ProductResponse, dependencies=[Security(security_scheme)])
def activate_product(product_id: str, db: Session = Depends(get_db), 
                     current_user: Account = role_required(["admin"])):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    
    if product.dry_stock:
        raise HTTPException(status_code=400, detail="PRODUCT_ALREADY_ACTIVATED")
    
    product.dry_stock = True
    db.commit()
    db.refresh(product)
    return product


@router.put("/deactivate_product/{product_id}", dependencies=[Security(security_scheme)])
def deactivate_product(product_id: str, db: Session = Depends(get_db), current_user: Account = role_required(["admin"])):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    
    product.dry_stock = False
    db.commit()
    db.refresh(product)
    return {"msg": "Tạm ngừng bán sản phẩm thành công."}



@router.post("/transfer_stock", response_model=TransactionTranferResponse, dependencies=[Security(security_scheme)])
def transfer_stock_create(
    data: TransactionTranferCreate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"])
):
    try:
        user = db.query(User).filter(User.id == data.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="NOT_FOUND_USER")
        valid_warehouses = ["Thợ Nhuộm", "Terra"]
        if data.from_warehouse not in valid_warehouses or data.to_warehouse not in valid_warehouses:
            raise HTTPException(status_code=400, detail="INVALID_WAREHOUSE")
        if data.from_warehouse == data.to_warehouse:
            raise HTTPException(status_code=400, detail="SAME_WAREHOUSE")
        if data.extra_fee is not None and data.extra_fee < 0:
            raise HTTPException(status_code=400, detail="INVALID_EXTRA_FEE")

        total_quantity = sum(item.quantity for item in data.items)
        if total_quantity <= 0:
            raise HTTPException(status_code=400, detail="INVALID_TOTAL_QUANTITY")

        transaction_items = []
        for item in data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"NOT_FOUND_PRODUCT: {item.product_id}")

            if item.quantity <= 0:
                raise HTTPException(status_code=400, detail="INVALID_QUANTITY")

            if data.from_warehouse == "Thợ Nhuộm" and data.to_warehouse == "Terra":
                if product.thonhuom_can_sell < item.quantity:
                    raise HTTPException(status_code=400, detail=f"{product.name}_THONHUOM_STOCK_NOT_ENOUGH")
                product.thonhuom_can_sell -= item.quantity
                product.out_for_delivery_thonhuom += item.quantity
            elif data.from_warehouse == "Terra" and data.to_warehouse == "Thợ Nhuộm":
                if product.terra_can_sell < item.quantity:
                    raise HTTPException(status_code=400, detail=f"{product.name}_TERRA_STOCK_NOT_ENOUGH")
                product.terra_can_sell -= item.quantity
                product.out_for_delivery_terra += item.quantity

            transaction_items.append(TransactionTranferItems(
                tranfer_id=None,  
                product_id=item.product_id,
                quantity=item.quantity
            ))

        transaction = TransactionTranfers(
            user_id=data.user_id,
            from_warehouse=data.from_warehouse,
            to_warehouse=data.to_warehouse,
            quantity=total_quantity,
            extra_fee=data.extra_fee,
            note=data.note,
            created_at=datetime.now(),
        )

        last_id = db.query(func.max(func.cast(func.substr(TransactionTranfers.id, 3), Integer))).scalar()
        if last_id:
            new_id = f"PC{last_id + 1}"
        else:
            new_id = "PC1"
        transaction.id = new_id
        db.add(transaction)

        for item in transaction_items:
            item.tranfer_id = transaction.id
            db.add(item)

        db.commit()
        db.refresh(transaction)

        return transaction

    except HTTPException as e:
        db.rollback()
        raise e  
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))



from products.schema import TransactionTranferListResponse, TransactionTranferItemsCreate
from suppliers.main_sup import normalize

@router.get("/transfer_stock", response_model=TransactionTranferListResponse, dependencies=[Security(security_scheme)])
def get_transfer_stock(
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"]),
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = Query(None, description="Tìm kiếm theo thông tin giao dịch, kho, ghi chú...")
):
    query = db.query(TransactionTranfers)
    
    if search:
        transactions = query.all()
        search_normalized = normalize(search)
        filtered_transactions = [
            transaction for transaction in transactions
            if search_normalized in normalize(transaction.from_warehouse)
            or search_normalized in normalize(transaction.to_warehouse)
            or search_normalized in normalize(transaction.note)
            or search_normalized in normalize(transaction.id)
            or search_normalized in normalize(transaction.user_id)
        ]
    else:
        filtered_transactions = query.all()

    sorted_transactions = sorted(filtered_transactions, key=lambda transaction: transaction.created_at, reverse=True)
    total_transactions = len(filtered_transactions)
    transactions = sorted_transactions[skip: skip + limit]
    
    return {
         "total_transactions": total_transactions,
         "transactions": transactions
     }


@router.get("/transfer_stock/{transaction_id}", response_model=TransactionTranferResponse, dependencies=[Security(security_scheme)])
def get_transfer_stock_by_id(transaction_id: str, db: Session = Depends(get_db),
                                current_user: Account = role_required(["admin", "warehouse_staff"])):
        transaction = db.query(TransactionTranfers).filter(TransactionTranfers.id == transaction_id).first()
        if not transaction:
            raise HTTPException(status_code=404, detail="TRANSACTION_NOT_FOUND")

        return transaction

@router.put("/transfer_stock/{transaction_id}", response_model=TransactionTranferResponse, dependencies=[Security(security_scheme)])
def update_transfer_stock(
    transaction_id: str,
    transaction_update: TransactionTranferUpdate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"])
):
    transaction = db.query(TransactionTranfers).filter(TransactionTranfers.id == transaction_id, TransactionTranfers.active == True).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="TRANSACTION_NOT_FOUND")

    if transaction.status == "delivering":
        raise HTTPException(status_code=400, detail="TRANSACTION_DELIVERING")

    if transaction_update.from_warehouse not in ["Thợ Nhuộm", "Terra"] or \
       transaction_update.to_warehouse not in ["Thợ Nhuộm", "Terra"]:
        raise HTTPException(status_code=400, detail="INVALID_WAREHOUSE")

    if transaction_update.to_warehouse == transaction_update.from_warehouse:
        raise HTTPException(status_code=400, detail="SAME_WAREHOUSE")

    if transaction_update.extra_fee is not None and transaction_update.extra_fee < 0:
        raise HTTPException(status_code=400, detail="INVALID_EXTRA_FEE")

    if not transaction_update.items or len(transaction_update.items) == 0:
        raise HTTPException(status_code=400, detail="ITEMS_REQUIRED")

    for item in transaction.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            if transaction.from_warehouse == "Thợ Nhuộm":
                product.thonhuom_can_sell += item.quantity
                product.out_for_delivery_thonhuom -= item.quantity
            elif transaction.from_warehouse == "Terra":
                product.terra_can_sell += item.quantity
                product.out_for_delivery_terra -= item.quantity


    db.query(TransactionTranferItems).filter(TransactionTranferItems.tranfer_id == transaction.id).delete()

    total_quantity = 0
    for item in transaction_update.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"NOT_FOUND_PRODUCT: {item.product_id}")

        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail="INVALID_QUANTITY")

        if transaction_update.from_warehouse == "Thợ Nhuộm" and product.thonhuom_can_sell < item.quantity:
            raise HTTPException(status_code=400, detail=f"{product.name}_THONHUOM_STOCK_NOT_ENOUGH")
        elif transaction_update.from_warehouse == "Terra" and product.terra_can_sell < item.quantity:
            raise HTTPException(status_code=400, detail=f"{product.name}_TERRA_STOCK_NOT_ENOUGH")

        if transaction_update.from_warehouse == "Thợ Nhuộm":
            product.thonhuom_can_sell -= item.quantity
            product.out_for_delivery_thonhuom += item.quantity
        elif transaction_update.from_warehouse == "Terra":
            product.terra_can_sell -= item.quantity
            product.out_for_delivery_terra += item.quantity

        new_item = TransactionTranferItems(
            tranfer_id=transaction.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(new_item)
        total_quantity += item.quantity

    transaction.user_id = transaction_update.user_id
    transaction.from_warehouse = transaction_update.from_warehouse
    transaction.to_warehouse = transaction_update.to_warehouse
    transaction.extra_fee = transaction_update.extra_fee
    transaction.quantity = total_quantity
    transaction.note = transaction_update.note
    transaction.updated_at = datetime.now()
    
    db.commit()
    db.refresh(transaction)

    return transaction

@router.put("/change_status_transfer_stock/{transaction_id}", response_model=TransactionTranferResponse, dependencies=[Security(security_scheme)])
def change_status_transfer_stock(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"])
):
    try:
        transaction = db.query(TransactionTranfers).filter(TransactionTranfers.id == transaction_id, TransactionTranfers.active == True).first()
        if not transaction:
            raise HTTPException(status_code=404, detail="TRANSACTION_NOT_FOUND")

        transaction.status = "delivering"
        db.commit()
        db.refresh(transaction)

        return transaction
    except HTTPException as e:
        db.rollback()
        raise e

@router.put("/transfer_stock/{transaction_id}/complete", response_model=TransactionTranferResponse, dependencies=[Security(security_scheme)])
def complete_transfer_stock(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"])
):
    transaction = db.query(TransactionTranfers).filter(TransactionTranfers.id == transaction_id, TransactionTranfers.active == True).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="TRANSACTION_NOT_FOUND")

    if transaction.from_warehouse not in ["Thợ Nhuộm", "Terra"] or transaction.to_warehouse not in ["Thợ Nhuộm", "Terra"]:
        raise HTTPException(status_code=400, detail="INVALID_WAREHOUSE")
    
    if transaction.to_warehouse == transaction.from_warehouse:
        raise HTTPException(status_code=400, detail="SAME_WAREHOUSE")

    # Duyệt từng sản phẩm trong giao dịch và cập nhật tồn kho
    for item in transaction.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"PRODUCT_NOT_FOUND: {item.product_id}")
        
        if transaction.from_warehouse == "Thợ Nhuộm":
            if product.thonhuom_stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"{product.name}_THONHUOM_STOCK_NOT_ENOUGH")
            product.thonhuom_stock -= item.quantity
            product.terra_stock += item.quantity
            product.terra_can_sell += item.quantity
            product.out_for_delivery_thonhuom -= item.quantity
        
        elif transaction.from_warehouse == "Terra":
            if product.terra_stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"{product.name}_TERRA_STOCK_NOT_ENOUGH")
            product.terra_stock -= item.quantity
            product.thonhuom_stock += item.quantity
            product.thonhuom_can_sell += item.quantity
            product.out_for_delivery_terra -= item.quantity
    
    # Đánh dấu giao dịch là hoàn tất
    # transaction.active = False
    transaction.updated_at = datetime.now()
    transaction.status = "delivered"

    db.commit()
    db.refresh(transaction)

    return transaction


@router.delete("/transfer_stock/{transaction_id}", response_model=TransactionTranferResponse,dependencies=[Security(security_scheme)])
def cancel_transfer_stock(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "warehouse_staff"])
):
    try:
        transaction = db.query(TransactionTranfers).filter(
            TransactionTranfers.id == transaction_id,
            TransactionTranfers.active == True
        ).first()
        if transaction.status == "delivering":
            raise HTTPException(status_code=400, detail="TRANSACTION_DELIVERING")

        if not transaction:
            raise HTTPException(status_code=404, detail="TRANSACTION_NOT_FOUND")

        for item in transaction.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"PRODUCT_NOT_FOUND: {item.product_id}")

            if transaction.from_warehouse == "Thợ Nhuộm":
                product.thonhuom_can_sell += item.quantity
            elif transaction.from_warehouse == "Terra":
                product.terra_can_sell += item.quantity

        transaction.status = "cancelled"
        transaction.active = False
        db.commit()

        return transaction

    except HTTPException as e:
        db.rollback()
        raise e

@router.get("/total_inventory_value")
def total_inventory_value(
    warehouse: Optional[str] = Query(None, description="Tên kho: 'thonhuom_stock' hoặc 'terra_stock'"),
    db: Session = Depends(get_db),
):

    products = db.query(Product).all()  
    query = db.query(Product)
    total_stock = 0
    total_stock_value = 0
    for product in products:
        if warehouse == "thonhuom_stock":
            stock = product.thonhuom_stock or 0
        elif warehouse == "terra_stock":
            stock = product.terra_stock or 0
        else:
            stock = (product.thonhuom_stock or 0) + (product.terra_stock or 0) 

        stock_value = stock * (product.price_import or 0) 
        total_stock += stock
        total_stock_value += stock_value
    total_products = query.count()

    return {
        "warehouse": warehouse if warehouse else "all",
        "total_products": total_products,
        "total_stock": total_stock,
        "total_stock_value": total_stock_value
    }




@router.post("/create_group_product", response_model=ProductGroupResponse, dependencies=[Security(security_scheme)])
def create_group_product(group: ProductGroupCreate, 
                         db: Session = Depends(get_db),
                         current_user: Account = role_required(["admin", "staff"])):
    group_name_normalized = group.name.strip()

    db_group = db.query(ProductGroup).filter(ProductGroup.name.ilike(group_name_normalized)).first()
    if db_group:
        raise HTTPException(status_code=400, detail="GROUP_NAME_ALREADY_EXISTS")


    try:
        new_group = ProductGroup(**group.dict())
        new_group.name = group_name_normalized  
        db.add(new_group)
        db.commit()
        db.refresh(new_group)
    except Exception as e:
        db.rollback()  
        raise HTTPException(status_code=500, detail="ERROR_CREATING_PRODUCT_GROUP") from e

    return new_group


from sqlalchemy import func, Integer
@router.get("/get_groups_product", response_model=ProductGroupListResponse, dependencies=[Security(security_scheme)])
def get_groups_product(
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên hoặc mô tả"),
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff", "warehouse_staff"])
):
    query = db.query(ProductGroup)

    groups = query.outerjoin(
        Product, Product.group_name == ProductGroup.name
    ).outerjoin(
        InvoiceItem, InvoiceItem.product_id == Product.id
    ).group_by(
        ProductGroup.name,
        ProductGroup.description,
        ProductGroup.created_at,
        ProductGroup.updated_at).add_columns(func.count(InvoiceItem.id).label('total_orders')
    ).order_by(desc(ProductGroup.created_at)).all()

    if search:
        search_normalized = normalize(search)
        groups = [
            (group, total_orders) for group, total_orders in groups
            if search_normalized in normalize(group.name)
            or search_normalized in normalize(group.description)
        ]

    total_groups = len(groups)
    groups = groups[skip: skip + limit] 
    result = [
        ProductGroupResponse(
            name=group.name,
            description=group.description,
            created_at=group.created_at,
            updated_at=group.updated_at,
            total_orders=total_orders
        )
        for group, total_orders in groups
    ]

    return {
        "total_groups": total_groups,
        "groups": result
    }

@router.put("/update_groups_product/{group_name}", response_model=ProductGroupResponse, dependencies=[Security(security_scheme)])
def update_groups_product(group_name: str, group: ProductGroupCreate, db: Session = Depends(get_db),
                          current_user: Account = role_required(["admin","staff"])):
    db_group = db.query(ProductGroup).filter(ProductGroup.name == group_name).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="NOT_FOUND")

    for key, value in group.dict(exclude_unset=True).items():
        setattr(db_group, key, value)



    db.commit()
    db.refresh(db_group)
    return db_group

@router.delete("/delete_group_product/{group_name}",dependencies=[Security(security_scheme)])
def delete_group_product(group_name: str, db: Session = Depends(get_db),
                         current_user: Account = role_required(["admin"])):
    default_group_name = "Mỹ phẩm"
    if group_name.strip().lower() == default_group_name.lower():
        raise HTTPException(status_code=400, detail="CAN_NOT_DELETE_DEFAULT_GROUP")
    db_group = db.query(ProductGroup).filter(ProductGroup.name == group_name).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    default_group = db.query(ProductGroup).filter(ProductGroup.name.ilike(default_group_name)).first()
    if not default_group:
        default_group = ProductGroup(
            name=default_group_name,
            description="Nhóm mặc định dành cho các sản phẩm chưa được phân loại."
        )
        db.add(default_group)
        db.commit()
        db.refresh(default_group)
    db.query(Product).filter(Product.group_name.ilike(group_name)).update(
        {"group_name": default_group.name},
        synchronize_session=False
    )
    db.delete(db_group)
    db.commit()
    return db_group