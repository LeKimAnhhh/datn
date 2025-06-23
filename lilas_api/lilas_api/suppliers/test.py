
# #  LẤY THÔNG TIN ĐƠN HÀNG

# import requests

# # URL và Token
# url = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail"
# token = "0acd5410-cffb-11ef-b2e4-6ec7c647cc27"

# # Payload (Dữ liệu gửi đi)
# payload = {
#     "order_code": "LPG8FX"  # Thay bằng mã đơn hàng của bạn
# }

# # Headers
# headers = {
#     "Content-Type": "application/json",
#     "Token": token
# }

# # Gửi yêu cầu POST
# response = requests.post(url, json=payload, headers=headers)

# # Kiểm tra phản hồi
# if response.status_code == 200:
#     print("Chi tiết đơn hàng:")
#     print(response.json())
# else:
#     print(f"Lỗi: {response.status_code}")
#     print(response.text)


# # #  LẤY THÔNG TIN ĐƠN HÀNG

import requests

# URL và Token
url = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail"
token = "0acd5410-cffb-11ef-b2e4-6ec7c647cc27"

# Payload (Dữ liệu gửi đi)
payload = {
    "order_code": "LPG8FX"  # Thay bằng mã đơn hàng của bạn
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
