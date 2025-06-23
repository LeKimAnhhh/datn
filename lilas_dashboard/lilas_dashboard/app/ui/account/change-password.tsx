"use client";

import React, { useState } from "react";
import { changeAccountPassword } from "@/app/lib/data";
import { CloseOutlined, Check, ReportGmailerrorred, VisibilityOutlined, VisibilityOffOutlined, BookmarkAddedOutlined } from "@mui/icons-material";

interface PopupChangePasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

const PopupChangePassword: React.FC<PopupChangePasswordProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  if (!isOpen) return null;

  const handleChangePassword = async () => {
    const token = localStorage.getItem("access_token") || "";

    try {
      await changeAccountPassword(token, currentPassword, newPassword, confirmNewPassword);
      setMessage(`Đổi mật khẩu thành công!`);
      setMessageType("success");
      // alert("Đổi mật khẩu thành công!");

      setTimeout(() => {
        setMessage("");
      }, 5000);
      onClose();
    } catch (error: any) {
      console.error("Failed to change password:", error.message);
      const errorResponse = JSON.parse(error.message);
      setMessage(`Lỗi: ${errorResponse.detail[0]?.msg}`);
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
      }, 5000);
      // alert(`Lỗi: ${error.message}`);
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60">
      {message && (
        <div className="toast-message">
          <BookmarkAddedOutlined style={{ color: "#1A73E8", fontSize: 20 }} />
          <span>{message}</span>
          {/* <span className="close-btn" onClick={handleClose}>✖</span> */}
        </div>
      )}
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
            <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded-md border-gray-300"
              placeholder="123456789a123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded-md border-gray-300"
              placeholder="123456789a123123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu mới</label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-2 border rounded-md border-gray-300"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                {showConfirmPassword ? (
                  <VisibilityOffOutlined className="h-5 w-5 text-gray-400" />
                ) : (
                  <VisibilityOutlined className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end bg-gray-100 p-6 -mx-6 rounded-b-2xl">
          <button
            onClick={handleChangePassword}
            className="bg-[#338BFF] text-white px-14 py-2 rounded-md font-semibold hover:bg-[#66B2FF]"
          >
            Lưu chỉnh sửa
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default PopupChangePassword;
