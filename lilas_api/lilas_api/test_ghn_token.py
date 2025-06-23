# import requests
# import json

# # URL API của GHN cho môi trường phát triển
# url = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create"

# # Token GHN của bạn
# token = "0acd5410-cffb-11ef-b2e4-6ec7c647cc27"

# # Header cung cấp thông tin xác thực
# headers = {
#     "Content-Type": "application/json",
#     "Token": token
# }

# # Dữ liệu đơn hàng mẫu
# order_data = {
#     "payment_type_id": 2,  # Mặc định thanh toán qua người gửi
#     "note": "Giao hàng nhanh",
#     "required_note": "KHONGCHOXEMHANG",  # Có thể thay đổi thành "CHOXEMHANG"
#     "to_name": "Nguyễn Văn A",
#     "to_phone": "0901234567",
#     "to_address": "123 Đường ABC",
#     "to_ward_code": "20314",  # Mã phường hợp lệ (lấy từ GHN)
#     "to_district_id": 1542,  # Mã quận/huyện hợp lệ (lấy từ GHN)
#     "cod_amount": 50000,  # Tổng giá trị đơn hàng
#     "weight": 1000,  # Cân nặng (gram)
#     "length": 30,
#     "width": 20,
#     "height": 10,
#     "service_id": 53321,  # ID dịch vụ giao hàng nhanh (xác định từ tài liệu GHN)
#     "pick_station_id": 1444,  # ID kho lấy hàng (xác định từ GHN)
#     "insurance_value": 50000,  # Giá trị bảo hiểm đơn hàng
#     "content": "sp ABC",  # Tên hàng hóa
#     "from_name": "Nguyễn Văn B",  # Tên người gửi
#     "from_phone": "0987654321",  # Số điện thoại người gửi
#     "from_address": "456 Đường XYZ",  # Địa chỉ người gửi
#     "from_ward_code": "1B1509",  # Mã phường người gửi (lấy từ GHN)
#     "from_district_id": 1542  # Mã quận/huyện người gửi (lấy từ GHN)
# }

# # Gửi yêu cầu POST đến API
# response = requests.post(url, headers=headers, data=json.dumps(order_data))

# # Kiểm tra kết quả
# if response.status_code == 200:
#     print("Tạo đơn hàng thành công!")
#     print("Thông tin đơn hàng:")
#     print(response.json())
# else:
#     print(f"Lỗi: {response.status_code}")
#     print("Chi tiết lỗi:", response.json())


#  LẤY THÔNG TIN ĐƠN HÀNG

import requests

# URL và Token
url = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail"
token = "0acd5410-cffb-11ef-b2e4-6ec7c647cc27"

# Payload (Dữ liệu gửi đi)
payload = {
    "order_code": "LPUMBV"  # Thay bằng mã đơn hàng của bạn
}

# Headers
headers = {
    "Content-Type": "application/json",
    "Token": token
}

# Gửi yêu cầu POST
response = requests.post(url, json=payload, headers=headers)

# Kiểm tra phản hồi
if response.status_code == 200:
    print("Chi tiết đơn hàng:")
    print(response.json())
else:
    print(f"Lỗi: {response.status_code}")
    print(response.text)

import json

# Đọc dữ liệu từ file test.json
with open("test.json", "r", encoding="utf-8") as file:
    response_data = json.load(file)

# Kiểm tra và lấy thông tin status và order_code
status = response_data.get("data", {}).get("status")
order_code = response_data.get("data", {}).get("order_code")

if status and order_code:
    print(f"Trạng thái đơn hàng: {status}")
    print(f"Mã đơn hàng: {order_code}")
else:
    if not status:
        print("Không tìm thấy trạng thái đơn hàng trong phản hồi.")
    if not order_code:
        print("Không tìm thấy mã đơn hàng trong phản hồi.")
