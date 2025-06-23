from fastapi import APIRouter, Depends, HTTPException, Response, Security, Query
# from fastapi.middleware.cors import CORSMiddleware
from fastapi_jwt_auth import AuthJWT
from fastapi.security import HTTPBearer
from fastapi_jwt_auth.exceptions import AuthJWTException
from sqlalchemy.orm import Session
from users.models import (Base, User, Account )
from database.main import engine
from users.schema import (
    UserCreate, LoginModel, UserUpdate, UserResponse, PasswordChange,UserListResponse,
    AccountListResponse, AccountCreate, AccountResponse, AccountUpdate
)
from invoice.models import Invoice
from passlib.context import CryptContext
import json
from users.dependencies import get_db
from typing import List, Optional, Set
from pydantic import BaseSettings
from datetime import timedelta, datetime

from uuid import uuid4
import os
import redis
from sqlalchemy import desc, cast
from sqlalchemy import or_, func, Integer


Base.metadata.create_all(bind=engine)

router = APIRouter()

security_scheme = HTTPBearer()


ROLE_MAPPING = {
    0: "developer",
    1: "admin",
    2: "staff",
    3: "collaborator",
    4: "warehouse_staff"
}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

class Settings(BaseSettings):
    authjwt_secret_key: str = "f36ebe9fe7caef64452001ff8a5ef83136f8d6dc4c5531f1e3214f7d4157b769"
    authjwt_access_token_expires: timedelta = timedelta(days=7)

@AuthJWT.load_config
def get_config():
    return Settings()

def get_current_user(Authorize: AuthJWT = Depends(), db: Session = Depends(get_db)):
    try:
        Authorize.jwt_required()
        subject = Authorize.get_jwt_subject()
        if not subject:

            raise HTTPException(status_code=401, detail="INVALID_OR_EXPIRED_TOKEN")
        current_user_info = json.loads(subject)
        user = db.query(Account).filter(Account.username == current_user_info["username"]).first()
        if user is None:
            raise HTTPException(status_code=404, detail="USER_NOT_FOUND")
        if not user.active:
            raise HTTPException(status_code=403, detail="USER_DELETED_OR_DISABLED ")
        return user
    except AuthJWTException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def role_required(required_roles: List[str]):
    def wrapper(current_user: Account = Depends(get_current_user)):
        user_role = ROLE_MAPPING.get(current_user.role, "unknown")
        if user_role not in required_roles:
            raise HTTPException(status_code=403, detail="REQUEST_DENIED")
        return current_user
    return Depends(wrapper)


@router.post("/signin")
def signin(
    response: Response,
    user: LoginModel,
    db: Session = Depends(get_db),
    Authorize: AuthJWT = Depends()
):
    db_account = db.query(Account).filter(Account.username == user.username).first()

    if not db_account:
        logger.warning(f"Đăng nhập thất bại: Tài khoản '{user.username}' không tồn tại.")
        raise HTTPException(status_code=401, detail="INVALID_CREDENTIALS")

    if not db_account.active:
        logger.warning(f"Đăng nhập thất bại: Tài khoản '{user.username}' đã bị vô hiệu hóa hoặc xóa.")
        raise HTTPException(status_code=403, detail="ACCOUNT_DELETED_OR_DISABLED")

    if not verify_password(user.password, db_account.password):
        logger.warning(f"Đăng nhập thất bại: Sai mật khẩu cho tài khoản '{user.username}'.")
        raise HTTPException(status_code=401, detail="INVALID_CREDENTIALS")

    subject = json.dumps({"username": db_account.username, "role": ROLE_MAPPING.get(db_account.role, "unknown")})
    access_token = Authorize.create_access_token(subject=subject)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        path="/",
    )

    logger.info(f"Đăng nhập thành công: Tài khoản '{user.username}' đăng nhập thành công.")

    return {
        "id": db_account.id,
        "username": db_account.username,
        "role": db_account.role,
        "access_token": access_token
    }

@router.post("/signup")
def signup(
    account: AccountCreate,
    db: Session = Depends(get_db),
    Authorize: AuthJWT = Depends()
):
    try:
        existing_user = db.query(Account).filter(Account.username == account.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="USERNAME_ALREADY_EXISTS ")

        if account.role not in ROLE_MAPPING.keys():
            raise HTTPException(
                status_code=400,
                detail="ROLE_MUST_BE_1_(admin)_2(staff)_3_(collaborator)_4_(warehouse_staff)"
            )

        last_id = db.query(func.max(func.cast(func.substr(Account.id, 3), Integer))).scalar()

        if last_id: 
            new_id = f"TK{last_id + 1}"
        else:
            new_id = "TK1"

        new_user = Account(
            id=new_id,
            username=account.username,
            password=get_password_hash(account.password),
            role=account.role,
            active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        subject = json.dumps({"username": new_user.username, "role": ROLE_MAPPING.get(new_user.role, "unknown")})
        access_token = Authorize.create_access_token(subject=subject)

        return {
            "msg": "CREATE_ACCOUNT_SUCCESS",
            "id": new_user.id,
            "username": new_user.username,
            # "role": ROLE_MAPPING.get(new_user.role, "unknown"),
            "role": new_user.role,
            "access_token": access_token
        }
    except HTTPException as http_exc:
        raise http_exc 
    except Exception as e:
        db.rollback() 

        return {
            "msg": "CREATE_ACCOUNT_SUCCESS",
            "id": new_user.id,
            "username": new_user.username,
            "role": ROLE_MAPPING.get(new_user.role, "unknown"),
            "access_token": access_token
        }
    except Exception as e:
        db.rollback()  
        raise HTTPException(status_code=500, detail=str(e))




blacklist_tokens: Set[str] = set()  
def is_token_blacklisted(token: str) -> bool:
    return token in blacklist_tokens

def blacklist_token(token: str):
    blacklist_tokens.add(token)

def remove_token_from_blacklist(token: str):
    blacklist_tokens.discard(token)

def token_required(Authorize: AuthJWT = Depends()):
    try:
        Authorize.jwt_required()  
        token = Authorize.get_raw_jwt()
        if is_token_blacklisted(token):

            raise HTTPException(status_code=401, detail="TOKEN_BLACKLISTED")
        return Authorize
    except Exception:
        raise HTTPException(status_code=401, detail="TOKEN_INVALID_OR_EXPIRED")

r = redis.Redis(host='localhost', port=5000, db=0)

def add_to_blacklist(token: str):
    r.set(token, True, ex=3600)  # Blacklist token trong 1 giờ

@router.post("/signout")
def signout(response: Response, Authorize: AuthJWT = Depends()):
    token = Authorize.get_raw_jwt()
    
    # Thêm token vào blacklist
    if token:
        blacklist_token(token)    
    response.delete_cookie(
        key="access_token", 
        path="/",  
    )
    return {"message": "SIGN_OUT_SUCCESS"}


from suppliers.main_sup import normalize
@router.get("/accounts", response_model=AccountListResponse, dependencies=[Security(security_scheme)])
def get_account(
    db: Session = Depends(get_db), 
    current_user: Account = role_required(["admin"]),
    limit: int = 10,
    skip: int = 0,
    search: Optional[str] = Query(None, description="SEARCH_BY_USERNAME_OR_ROLE")
):
    query = db.query(Account).filter(Account.active == True, Account.role != 0)
    account = query.order_by(desc(Account.created_at)).offset(skip).limit(limit).all()
    if search:
        search_normalized = normalize(search) 
        account = [
            account for account in account
            if search_normalized in normalize(account.username)
            or search_normalized in normalize(ROLE_MAPPING.get(account.role, "unknown"))
        ]
    total_account = len(account)
    account = account[skip: skip + limit]   

    return {"total_accounts": total_account, "accounts": account}


@router.get("/account/{account_id}", response_model=AccountResponse, dependencies=[Security(security_scheme)])  
def get_account_by_id(account_id: str, db: Session = Depends(get_db), current_user: Account = role_required(["admin"])):
    account = db.query(Account).filter(Account.id == account_id, Account.active == True).first()
    if not account:

        raise HTTPException(status_code=404, detail="NOT_FOUND")
    return account

@router.put("/update_account/{account_id}", response_model=AccountResponse, dependencies=[Security(security_scheme)])
def update_account(
    account_id: str,
    account_data: AccountUpdate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    try:
        account = db.query(Account).filter(Account.id == account_id, Account.active == True).first()
        if not account:

            raise HTTPException(status_code=404, detail="NOT_FOUND")
        
        for key, value in account_data.dict(exclude_unset=True).items():
            if key == "password":
                value = get_password_hash(value)  
            setattr(account, key, value)

        db.commit()
        db.refresh(account)

        return account
    except HTTPException as http_exc:
        raise http_exc 
    except Exception as e:
        db.rollback()


@router.put("/change_password", response_model=AccountResponse, dependencies=[Security(security_scheme)])
def change_password(
    password_change: PasswordChange,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_user)
):
    try:
        if not verify_password(password_change.current_password, current_account.password):
            raise HTTPException(status_code=400, detail="THAT_PASSWORD_IS_INCORRECT")
        
        if password_change.new_password != password_change.confirm_new_password:
            raise HTTPException(status_code=400, detail="NEW_PASSWORD_AND_CONFIRM_NEW_PASSWORD_DO_NOT_MATCH")
        
        current_account.password = get_password_hash(password_change.new_password)
        db.commit()
        db.refresh(current_account)
        
        return current_account
    except HTTPException as http_exc:
        raise http_exc 
    except Exception as e:
        db.rollback()

@router.put("/delete_account/{user_id}", dependencies=[Security(security_scheme)])
def delete_account(user_id: str, db: Session = Depends(get_db), current_user: Account = role_required(["admin"])):
    account = db.query(Account).filter(Account.id == user_id, Account.active == True).first()
    try:
        if not account:
            raise HTTPException(status_code=404, detail="NOT_FOUND")
        if account.role == 1:
            raise HTTPException(status_code=403, detail="CAN_NOT_DELETE_ADMIN_ACCOUNT")
        if account.id == current_user.id:
            raise HTTPException(status_code=403, detail="CAN_NOT_DELETE_YOURSELF")
        account.active = False
        db.commit()
        return {"msg": "THE_ACCOUNT_HAS_BEEN_DELETED"}
    except HTTPException as http_exc:
        raise http_exc 
    except Exception as e:
        db.rollback()


@router.post("/users", response_model=UserResponse, dependencies=[Security(security_scheme)])
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    try:
        existing_user = db.query(User).filter(User.phone_number == user.phone_number, User.full_name == user.full_name).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="USER_ALREADY_EXISTS")
        
        if user.email:
            existing_email_user = db.query(User).filter(User.email == user.email).first()
            if existing_email_user:
                raise HTTPException(status_code=400, detail="EMAIL_ALREADY_EXISTS")
        
        if user.phone_number:
            existing_phone_user = db.query(User).filter(User.phone_number == user.phone_number).first()
            if existing_phone_user:
                raise HTTPException(status_code=400, detail="PHONE_NUMBER_ALREADY_EXISTS")
            
        last_id = db.query(func.max(cast(func.substr(User.id, 3), Integer))).scalar()
        new_id = f"NV{(last_id + 1) if last_id else 1}"

        new_user = User(id=new_id, **user.dict(exclude={"id"}))  # Exclude the id field
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc
    # except Exception as e:
    #     db.rollback()
    #     raise HTTPException(status_code=500, detail=str(e))

import logging
logger = logging.getLogger(__name__)

def update_user_stats(user_id: str, db: Session):
    try:
        total_orders = db.query(func.count(Invoice.id)).filter(
            Invoice.user_id == user_id, Invoice.status == "ready_to_pick").scalar() or 0

        total_revenue = db.query(func.sum(Invoice.total_value)).filter(
            Invoice.user_id == user_id, Invoice.status == "ready_to_pick").scalar()
        total_revenue = total_revenue if total_revenue is not None else 0

        logger.info("User %s - Total Orders: %d, Total Revenue: %.2f", user_id, total_orders, total_revenue)

        # Lấy user cần cập nhật
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error("Không tìm thấy user với ID: %s", user_id)
            return

        user.total_orders = total_orders
        user.total_revenue = total_revenue
        db.commit()
        logger.info("Cập nhật thành công cho user %s: total_orders=%d, total_revenue=%.2f", user_id, total_orders, total_revenue)

    except Exception as e:
        logger.exception("Lỗi khi cập nhật thống kê cho user %s: %s", user_id, str(e))
        db.rollback()

@router.get("/get_user", response_model=UserListResponse, dependencies=[Security(security_scheme)])
def get_user(
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin", "staff", "warehouse_staff", "collaborator"]),
    limit: int = 10,
    skip: int = 0,
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên, email, số điện thoại, địa chỉ, hoặc ca làm việc.") 
):
    try:
        ROLE_MAPPING = {
            "1": 1, "2": 2, "3": 3,
            "admin": 1, "staff": 2, "collaborator": 3,
            "nhân viên": 2, "nhan vien": 2,
            "đối tác": 3, "doi tac": 3,
            "quản lý": 1, "quan ly": 1
        }

        users = db.query(User).filter(User.active == True).order_by(desc(User.created_at)).all()
        if search:
            search_normalized = normalize(search)

            if search_normalized in ROLE_MAPPING:
                users = [user for user in users if user.role == ROLE_MAPPING[search_normalized]]
            else:
                users = [
                    user for user in users
                    if search_normalized in normalize(user.full_name)
                    or search_normalized in normalize(user.email)
                    or search_normalized in normalize(user.phone_number)
                    or search_normalized in normalize(user.address)
                    or search_normalized in normalize(user.shift_work)
                ]

        total_users = len(users)
        users = users[skip: skip + limit]
        user_responses = [
            UserResponse(
                id=user.id,
                full_name=user.full_name,
                phone_number=user.phone_number,
                email=user.email,
                address=user.address,
                shift_work=user.shift_work,
                role=user.role,
                active=user.active,
                total_orders=user.total_orders,
                total_revenue=user.total_revenue,
                created_at=user.created_at,
            )
            for user in users
        ]

        return {"total_users": total_users, "users": user_responses}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="INTERNAL_SERVER_ERROR")

@router.put("/user/{user_id}", dependencies=[Security(security_scheme)])
def update_user(
    user_id: str,
    employee_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    try:
        employee = db.query(User).filter(User.id == user_id, User.active == True).first()
        if not employee:
            raise HTTPException(status_code=404, detail="NOT_FOUND")
        
        if employee_data.phone_number and employee.phone_number != employee_data.phone_number:
            existing_phone_user = db.query(User).filter(
                User.phone_number == employee_data.phone_number,
                User.id != user_id  
            ).first()
            if existing_phone_user:
                raise HTTPException(status_code=400, detail="PHONE_NUMBER_ALREADY_EXISTS")

        if employee_data.email and employee.email != employee_data.email:
            existing_email_user = db.query(User).filter(
                User.email == employee_data.email,
                User.id != user_id  
            ).first()
            if existing_email_user:
                raise HTTPException(status_code=400, detail="EMAIL_ALREADY_EXISTS")
            
        current_data = {
            "full_name": employee.full_name,
            "address": employee.address,
            "shift_work": employee.shift_work,
            "email": employee.email
        }

        for key, value in employee_data.dict(exclude_unset=True).items():
            setattr(employee, key, value)

        db.commit()
        db.refresh(employee)

        return {
            "msg": "Cập nhật thành công",
            "updated_data": {
                key: getattr(employee, key) for key in current_data.keys()
            },
        }
    except Exception as e:
        db.rollback()


@router.get("/employee/{employee_id}", dependencies=[Security(security_scheme)])
def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Account = role_required(["admin"])
):
    user = db.query(User).filter(User.id == user_id, User.active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    
    return {
        
        "full_name": user.full_name,
        "role": user.role,
        "shift_work": user.shift_work,
        "phone_number": user.phone_number,
        "email": user.email,
        "address": user.address,
        "total_orders": user.total_orders,
        "total_revenue": user.total_revenue,
    }

@router.put("/employee/{employee_id}", dependencies=[Security(security_scheme)])
def deactivate_user(user_id: str, db: Session = Depends(get_db), current_user: Account = role_required(["admin"])):
    try:
        user = db.query(User).filter(User.id == user_id, User.active == True).first()
        if not user:
            raise HTTPException(status_code=404, detail="NOT_FOUND")
        user.active = False
        db.commit()
        return {"msg": "Người dùng đã bị vô hiệu hóa."}
    except Exception as e:
        db.rollback()
