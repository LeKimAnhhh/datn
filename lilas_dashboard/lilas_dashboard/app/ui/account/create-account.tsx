"use client";

import React, { useState } from "react";
import { createAccount } from "@/app/lib/data";
import { CloseOutlined, ReportGmailerrorred, VisibilityOutlined, VisibilityOffOutlined, BookmarkAddedOutlined } from "@mui/icons-material";

interface PopupCreateAccountProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (accountData: any) => void;
}

const PopupCreateAccount: React.FC<PopupCreateAccountProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    role: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    role: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (value.length > 50) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.username.trim()) newErrors.username = "Vui lòng nhập tên đăng nhập";
    if (!formData.role) newErrors.role = "Vui lòng chọn chức vụ";
    if (!formData.password.trim()) newErrors.password = "Vui lòng nhập mật khẩu";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    const token = localStorage.getItem("access_token") || "";
    const payload = {
      username: formData.username.trim(),
      role: Number(formData.role),
      password: formData.password.trim(),
    };

    console.log(payload)

    try {
      const result = await createAccount(token, payload);
      onCreate(result);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.log("🚀 ~ handleCreate ~ error:", error.message);
      if ( error.message === 'PASSWORD_WEAK') {
        setMessage(`Mật khẩu quá yếu`);
        setMessageType("error");

        setTimeout(() => {
          setMessage("");
        }, 5000);
      } else {
        setMessage(`${error.message}`);
        setMessageType("error");

        setTimeout(() => {
          setMessage("");
        }, 5000);
      }
      // alert(`Lỗi: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60">
        {message && (
          <div className="toast-message">
            <BookmarkAddedOutlined style={{ color: "#1A73E8", fontSize: 20 }} />
            <span>{message}</span>
            {/* <span className="close-btn" onClick={handleClose}>✖</span> */}
          </div>
        )}
      {/* Chỉnh sửa kích thước popup */}
      <div className="relative w-full max-w-[612px] bg-white rounded-3xl shadow-[0_2px_0_#D9D9D9] p-6 pb-0">
        {/* Thêm button "thoát" icon X  */}
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">Thông tin chung</h2>
          <button onClick={onClose} className="text-gray-600">
            <CloseOutlined />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.username ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="Nguyen Van A"
            />
            {errors.username && (
              <p className="text-red-500 flex items-center text-xs mt-1">
                <ReportGmailerrorred className='w-4 h-4 mr-1' />
                {errors.username}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Chức vụ</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.role ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option value="">-- Chọn chức vụ --</option>
              <option value="1">Quản lý</option>
              <option value="2">Nhân viên bán hàng</option>
              <option value="4">Nhân viên kho</option>
              <option value="3">Cộng tác viên</option>
            </select>
            {errors.role && (
              <p className="text-red-500 flex items-center text-xs mt-1">
                <ReportGmailerrorred className='w-4 h-4 mr-1' />
                {errors.role}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-4'>
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu</label>
              <div className='relative mt-1'> 
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Mật khẩu đăng nhập"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                {showPassword ? (
                  <VisibilityOffOutlined className="h-5 w-5 text-gray-400" />
                ) : (
                  <VisibilityOutlined className="h-5 w-5 text-gray-400" />
                )}
              </button>
              </div>
            </div>
            <div className="mt-0">
              {errors.password && (
                  <p className="text-red-500 text-xs flex items-center -mt-3">
                    <ReportGmailerrorred className='w-4 h-4 mr-1' />
                    {errors.password}
                  </p>
                )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end bg-gray-100 p-6 -mx-6 rounded-b-2xl">
          {/* Xóa button "Thoát" */}
          <button
            onClick={handleCreate}
            className="bg-[#338BFF] text-white px-[75px] py-[10px] rounded-md font-semibold hover:bg-[#66B2FF]"
          >
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupCreateAccount;
