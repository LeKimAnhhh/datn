const errorMessages: Record<string, string> = {
    "NAME_REQUIRED": "Tên khách hàng đã được sử dụng.",
    "CUSTOMER_KHACH_TRANG_GROUP_REQUIRED": "Khách hàng tên 'Khách Trắng' chỉ có thể được tạo vào nhóm 'Khách Trắng'.",
    "PHONE_NUMBER_REQUIRED": "Số điện thoại đã được sử dụng.",
    "ONLY_ALLOW_CREATE_CUSTOMER_NAME_KHACH_TRANG_IN_GROUP_KHACH_TRANG": "Chỉ có thể tạo khách hàng tên 'Khách Trắng' vào nhóm 'Khách Trắng'.",
    "NOT_FOUND": "Không tìm thấy dữ liệu.",
    "CUSTOMER_GROUP_ALREADY_EXISTS": "Nhóm khách hàng đã tồn tại.",
    "DEFAULT_GROUP_NOT_FOUND_KHACH_LE": "Không tìm thấy nhóm mặc định khách lẻ.",
    "INVALID_ROLE": "Vai trò không hợp lệ",
    
    "NOT_FOUND_INVOICE": "Invoice không tồn tại.",
    "NOT_FOUND_SHOP": "Shop không tồn tại.",
    "NOT_FOUND_CUSTOMER": "Khách hàng không tồn tại.",
    "ERROR_CALLING_GHN_API": "Lỗi khi gọi GHN API.",
    "NO_ORDER_CODE_RETURNED": "Không nhận được mã đơn hàng.",
    "NO_MESSAGE_RETURNED": "Không nhận được thông báo từ hệ thống.",
    "GHN_ERROR": "Lỗi từ GHN.",
    "NOT_FOUND_DELIVERY": "Không tìm thấy đơn vận chuyển.",
    "NO_SHOP_ID_RETURNED": "Không nhận được shop_id từ hệ thống.",
    "NO_PICKUP_TIME_RETURNED": "Không nhận được thời gian lấy hàng.",
    "NOT_FOUND_STATUS": "Không tìm thấy trạng thái đơn hàng.",
    
    "IMPORT_BILL_MUST_HAVE_ITEMS": "Phiếu nhập phải có ít nhất một sản phẩm.",
    "NOT_FOUND_SUPPLIER": "Không tìm thấy nhà cung cấp.",
    "NOT_FOUND_USER": "Không tìm thấy người dùng.",
    "IMPORT_BILL_MUST_HAVE_USER": "Phiếu nhập phải có người nhập.",
    "PRODUCT_NOT_AVAILABLE": "Sản phẩm không có sẵn.",
    "NOT_FOUND_IMPORT_BILL": "Không tìm thấy phiếu nhập.",
    "CAN_NOT_UPDATE_ITEMS_WHEN_IMPORT_BILL_STATUS_IS_NOT_COMPLETED_OR_CANCELLED": "Không thể cập nhật sản phẩm khi trạng thái phiếu nhập không phải 'Đã hoàn thành' hoặc 'Đã hủy'.",
    "INSPECTION_REPORT_ALREADY_EXISTS": "Mã phiếu nhập đã kiếm.",
    "CAN_NOT_UPDATE_INSPECTION_REPORT_WHEN_STATUS_IS_NOT_INSPECTING": "Không thể cập nhật báo cáo kiểm tra khi trạng thái không phải 'Đang kiểm'.",
    "BRANCH_NOT_FOUND": "Không tìm thấy chi nhánh.",
    "IMPORT_BILL_CANCELED": "Mã phiếu nhập đã hủy",
    "Internal Server Error": "Lỗi hệ thống, thử lại sau.",
    "ONLY_RECEIVED_BILLS_CAN_BE_INSPECTED": "Cần xác nhận hàng đã nhập kho trước khi tạo phiếu kiểm!",
    
    "DEFAULT_CUSTOMER_KHACH_TRANG_NOT_FOUND": "Không tìm thấy khách hàng mặc định 'Khách Trắng'.",
    "NOT_FOUND_PRODUCT_BY_ID": "Không tìm thấy sản phẩm với ID.",
    "PRODUCT_NOT_ENOUGH_IN_STOCK": "Sản phẩm không đủ hàng trong kho.",
    "TERRA_STOCK_NOT_ENOUGH": "Số lượng hàng trong kho Terra không đủ.",
    "THONHUOM_STOCK_NOT_ENOUGH": "Số lượng hàng trong kho Thợ Nhuộm không đủ.",
    "PRODUCT_NAME_ALREADY_EXISTS": "Tên sản phẩm đã tồn tại.",
    "GROUP_NAME_NOT_FOUND": "Không tìm thấy nhóm sản phẩm.",
    "BARCODE_REQUIRED": "Mã vạch là bắt buộc.",
    "INVALID_FILE_FORMAT": "File không đúng định dạng (chỉ jpg hoặc png).",
    "FILE_SIZE_EXCEEDED": "File vượt quá kích thước 5MB.",
    
    "DATA_NOT_JSON": "Dữ liệu không phải định dạng JSON.",
    "DELETED_IMAGE_IDS_NOT_VALID": "Danh sách ID ảnh đã xóa không hợp lệ.",
    "PRODUCT_ALREADY_ACTIVATED": "Sản phẩm đã được kích hoạt.",
    "GROUP_NAME_ALREADY_EXISTS": "Nhóm sản phẩm đã tồn tại.",
    "ERROR_CREATING_PRODUCT_GROUP": "Lỗi khi tạo nhóm sản phẩm.",
    "CAN_NOT_DELETE_DEFAULT_GROUP": "Không thể xóa nhóm mặc định.",
    
    "CONTACT_NAME_REQUIRED": "Tên người liên hệ không được để trống.",
    "CONTACT_NAME_ALREADY_USED": "Tên người dùng đã được sử dụng.",
    "PHONE_NUMBER_ALREADY_EXISTS": "Số điện thoại đã được sử dụng.",
    "EMAIL_ALREADY_EXISTS": "Email đã được sử dụng.",
    "PAID_AMOUNT_CANNOT_BE_NEGATIVE": "Số tiền đã trả không thể âm.",
    "SUPPLIER_NAME_ALREADY_USED": "Tên nhà cung cấp đã được sử dụng.",
    "SUPPLIER_NOT_FOUND": "Không tìm thấy nhà cung cấp.",
    
    "INVALID_OR_EXPIRED_TOKEN": "Token không hợp lệ hoặc đã hết hạn.",
    "USER_DELETED_OR_DISABLED": "Người dùng đã bị xóa hoặc vô hiệu hóa.",
    "REQUEST_DENIED": "Tài khoản không đủ quyền.",
    "ACCOUNT_DELETED_OR_DISABLED": "Tài khoản đã bị xóa hoặc vô hiệu hóa.",
    "INVALID_CREDENTIALS": "Thông tin đăng nhập không hợp lệ.",
    "USERNAME_ALREADY_EXISTS": "Tên người dùng đã tồn tại.",
    "ROLE_INVALID": "Vai trò không hợp lệ.",
    "TOKEN_BLACKLISTED": "Token đã bị đưa vào danh sách đen.",
    "ACCOUNT_NOT_FOUND": "Không tìm thấy tài khoản.",
    "PASSWORD_INCORRECT": "Mật khẩu hiện tại không chính xác.",
    "NEW_PASSWORD_MISMATCH": "Mật khẩu mới và xác nhận mật khẩu không khớp.",
    "CAN_NOT_DELETE_ADMIN_ACCOUNT": "Không thể xóa tài khoản admin.",
    "CAN_NOT_DELETE_YOURSELF": "Không thể tự xóa tài khoản của chính mình.",
    "USER_ALREADY_EXISTS": "Người dùng đã tồn tại.",
    "TRANSACTION_DELIVERING": "Đang vận chuyển, không thể cập nhật!",
    
    "EXPIRATION_DATE_MUST_BE_AFTER_CURRENT_DATE": "Hạn sử dụng phải sau ngày hiện tại.",
    "INVALID_GROUP": "Loại sản phẩm không hợp lệ.",
    "INVALID_PHONE_NUMBER": "Số điện thoại không hợp lệ.",
    "INVALID_EMAIL": "Email không hợp lệ",
    "INVALID_LENGTH_PHONE_NUMBER": "Số điện thoại có mã quốc gia phải có độ dài từ 10 đến 15 chữ số.",
    "UNKNOWN_ERROR_FROM_GHN": "Lỗi không xác định từ GHN.",
    "CAN_NOT_CANCEL_WHEN_INVOICE_STATUS_IS_NOT_READY": "Không thể hủy đơn khi đơn hàng không ở trạng thái 'Sẵn sàng lấy hàng'.",
    
    "CUSTOMER_NOT_FOUND": "Không tìm thấy khách hàng.",
    "TRANSACTION_NOT_FOUND_PAID": "Không tìm thấy giao dịch hoặc đã thanh toán.",
    "INVALID_AMOUNT": "Số tiền không hợp lệ.",
    "NO_ORDER_FEE_RETURNED": "Không nhận được phí đơn hàng từ hệ thống.",
    "DELIVERY_NOT_FOUND": "Không tìm thấy đơn vận chuyển.",
    "CANNOT_UPDATE_KHACH_TRANG_CUSTOMER": "Không thể cập nhật Khách Trắng",
    "CANNOT_UPDATE_KHACH_TRANG_GROUP": "Không thể cập nhật nhóm Khách Trắng",
    "CANNOT_DELETE_DEFAULT_GROUP_KHACH_LE": "Không thể xoá nhóm Khách Lẻ",
    "TRANSACTION_NOT_FOUND_OR_PAID": "Không tìm thấy giao dịch hoặc đã được thanh toán",
    "AMOUNT_GREATER_THAN_DEBT": "Số tiền lớn hơn Công nợ",
    "AMOUNT_EXCEEDS_TOTAL_VALUE": "Số tiền vượt quá tổng giá trị",
    "AMOUNT_MUST_BE_POSITIVE": "Số tiền phải >= 0",
    "BILL_COMPLETED": "Hoá đơn đã được thanh toán",
    "BRANCH_NOT_FOUND_IN_BILL": "Không tìm thấy chi nhánh trong phiếu",
    "BRANCH_NOT_SUPPORTED": "Chi nhánh không được hỗ trợ",
    "CAN_NOT_CANCEL_WHEN_DELIVERY_STATUS_IS_NOT_ready_to_pick_OR_picking_OR_money_collect_picking": "Không thể huỷ đơn khi trạng thái không phải 'Chờ lấy hàng'",
    "CAN_NOT_UPDATE_INSPECTION_REPORT_WHEN_STATUS_IS_NOT_CHECKING": "Không thể cập nhật phiếu kiểm khi trạng thái không phải 'Đang kiểm'",
    "CAN_NOT_UPDATE_ITEMS_WHEN_IMPORT_BILL_COMPLETED": "Không thể cập nhật khi phiếu nhập đã hoàn thành",
    "CAN_NOT_UPDATE_WHEN_INVOICE_STATUS_IS_NOT_ready_to_pick": "Không thể cập nhật đơn hàng nếu đơn hàng ở trạng thái không phải 'Chờ lấy hàng'",
    "CUSTOMER_GROUP_NOT_FOUND": "Không thể tìm thấy nhóm khách hàng",
    "DEFAULT_CUSTOMER_'Khách Trắng'_NOT_FOUND": "Không tìm thấy khách hàng mặc định 'Khách Trắng'",
    "DELIVERY_ALREADY_CANCELED": "Đơn vận chuyển đã huỷ",
    "DESCRIPTION_TOO_LARGE": "Mô tả quá dài",
    "EMAIL_EXISTED": "Email đã được sử dụng",
    "EMAIL_REQUIRED": "Yêu cầu điền email",
    "IMPORT_BILL_MUST_HAVE_AT_LEAST_ONE_ITEM": "Phiếu nhập phải có ít nhất 1 sản phẩm",
    "IMPORT_BILL_NOT_FOUND": "Không tìm thấy phiếu nhập",
    "IMPORT_BILL_NOT_YET_RECEIVED": "Phiếu nhập chưa được nhận",
    "IN_SHIPPING_NO_CANCELLATION": "Đang vận chuyển, không thể hủy",
    "INVOICE_NO_PRODUCT": "Đơn hàng không có sản phẩm",
    "INTERNAL_SERVER_ERROR": "Lỗi hệ thống",
    "ONLY_PENDING_BILLS_CAN_BE_IMPORTED": "Chỉ các hóa đơn chờ xử lý mới có thể được nhập",
    "ONLY_RETURNING_BILL_CAN_BE_CONFIRMED": "Chỉ các hóa đơn trả lại mới có thể được xác nhận",
    "PAID_AMOUNT_CANNOT_EXCEED_TOTAL_VALUE": "Số tiền thanh toán không thể vượt quá tổng giá trị",
    "PRODUCTS_EXCEED_50_IMG": "Không vượt quá 50 ảnh",
    "PRODUCT_IS_STOP_ACTIVE": "Sản phẩm đã 'Ngừng bán'",
    "RETURN_BILL_NOT_FOUND": "Không tìm thấy phiếu trả",
    "QUANTITY_MUST_BE_AT_LEAST_1": "Số lượng phải ít nhất 1",
    "RETURN_BILL_MUST_HAVE_ITEMS": "Phiếu trả phải có ít nhất 1 sản phẩm",
    "THAT_PASSWORD_IS_INCORRECT": "Mật khẩu không chính xác",
    "USER_NOT_FOUND": "Không tìm thấy Nhân viên",
    "PHONE_NUMBER_IS_REQUIRED": "Thiếu số điện thoại khách hàng",
    "ADDRESS_IS_REQUIRED": "Thiếu địa chỉ cụ thể khách hàng",
    "PROVINCE_IS_REQUIRED": "Thiếu tỉnh thành giao hàng",
    "DISTRICT_IS_REQUIRED": "Thiếu quận/huyện giao hàng",
    "WARD_IS_REQUIRED": "Thiếu phường/xã giao hàng",
    "USERNAME_CANNOT_CONTAIN_SPACES": "Tên tài khoản không chứa khoảng trống",
    "USERNAME_CANNOT_CONTAIN_ACCENTED_CHARACTERS": "Tên tài khoản không chứa ký tự đặc biệt",
    "USERNAME_CAN_ONLY_CONTAIN_LETTERS_AND_NUMBERS": "Tên tài khoản chỉ chấp nhận chữ hoặc số"
    };

export const getDynamicErrorMessage = (errorCode: string): string => {
    // Handle the new format: "{product.name}_THONHUOM_STOCK_NOT_ENOUGH"
    const match = errorCode.match(/^(.+)_(THONHUOM|TERRA)_STOCK_NOT_ENOUGH$/);
    if (match) {
        const [_, productName, warehouse] = match;
        const warehouseName = warehouse === 'THONHUOM' ? 'Thợ Nhuộm' : 'Terra';
        return `${productName} không đủ hàng trong kho ${warehouseName}`;
    }
    
    // Keep the old format handling as fallback
    return errorCode.replace(
        /^PRODUCT_(.+)_NOT_ENOUGH_IN_(.+)$/,
        (_, product, branch) => `${product} không đủ hàng trong kho '${branch}'.`
    );
};

export const getErrorMessage = (errorCode: string): string => {
    // return errorMessages[errorCode] || "Lỗi không xác định. Vui lòng thử lại sau.";
    return errorMessages[errorCode] ?? errorCode; 
};

export default errorMessages;