import requests
from fastapi import HTTPException
from dotenv import load_dotenv, find_dotenv
import os
import logging

# Load environment variables
dotenv_path = find_dotenv()
if not dotenv_path:
    raise ValueError("Không tìm thấy tệp .env")
load_dotenv(dotenv_path)

# Constants loaded from .env
GHN_API_URL_CREATE = os.getenv("GHN_API_URL_CREATE")
GHN_TOKEN = os.getenv("GHN_TOKEN")
GHN_API_URL_GET_ADDRESS = os.getenv("GHN_API_URL_GET_ADDRESS")
GHN_PICKSHIFT_URL = os.getenv("GHN_PICKSHIFT_URL")
# Configure logging
logger = logging.getLogger("ghn_logger")
logging.basicConfig(level=logging.INFO)

# Check if GHN_API_URL and GHN_TOKEN are loaded correctly
if not GHN_API_URL_CREATE or not GHN_TOKEN:
    logger.error("GHN_API_URL hoặc GHN_TOKEN không được tải đúng cách từ tệp .env")
    raise ValueError("GHN_API_URL hoặc GHN_TOKEN không được tải đúng cách từ tệp .env")

def get_pick_shifts():
    url = GHN_PICKSHIFT_URL
    headers = {"Token": GHN_TOKEN}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.json().get("message", "Lỗi không xác định từ GHN API")
        )
    return response.json().get("data", [])

def get_provinces():
    logger.info("Bắt đầu gọi API lấy danh sách tỉnh/thành phố từ GHN.")

    url = f"{GHN_API_URL_GET_ADDRESS}/master-data/province"
    headers = {"Token": GHN_TOKEN}
    
    logger.info("GHN_TOKEN: %s", GHN_TOKEN)
    logger.info("Headers được gửi: %s", headers)
    logger.info("URL được gọi: %s", url)

    try:
        response = requests.get(url, headers=headers)
        logger.info("Response nhận được: %s", response.text)

        if response.status_code != 200:
            logger.error("Không thể lấy danh sách tỉnh/thành phố: %s", response.json())
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json().get("message", "Lỗi không xác định từ GHN API")
            )

        data = response.json().get("data", [])
        logger.info("Lấy danh sách tỉnh/thành phố thành công.")
        return data

    except requests.exceptions.RequestException as e:
        logger.error("Lỗi khi kết nối tới GHN API: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail="Lỗi khi kết nối tới GHN API"
        )

def get_districts(province_id):
    url = f"{GHN_API_URL_GET_ADDRESS}/master-data/district"
    headers = {"Token": GHN_TOKEN}
    params = {"province_id": province_id}
    
    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code, 
            detail=response.json().get("message", "Lỗi không xác định từ GHN API")
        )

    return response.json().get("data", [])

def get_wards(district_id):
    url = f"{GHN_API_URL_GET_ADDRESS}/master-data/ward"
    headers = {"Token": GHN_TOKEN, "User-Agent": "PostmanRuntime/7.43.0"}
    response = requests.get(url, headers=headers, params={"district_id": district_id})
    if response.status_code != 200:
        logger.error("Không thể lấy danh sách phường/xã: %s", response.json())
        raise HTTPException(
            status_code=response.status_code, detail="Không thể lấy danh sách phường/xã."
        )
    logger.info("Lấy danh sách phường/xã thành công.")
    return response.json().get("data", [])


