"use client";

import React, { useEffect, useState } from "react";
import { updateAccount, fetchAccountById } from "@/app/lib/data";
import { Account } from "@/app/lib/definitions";
import { CloseOutlined, BookmarkAddedOutlined } from "@mui/icons-material";
import EditPopupSkeleton from "@/app/components/EditPopupSkeleton";

interface PopupEditAccountProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChangePassword: () => void;
  accountId: string | null;
}

const PopupEditAccount: React.FC<PopupEditAccountProps> = ({
  isOpen,
  onClose,
  onOpenChangePassword,
  accountId,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    role: "",
    passwordMasked: "********", 
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    if (accountId && isOpen) {
      setLoading(true);
      const token = localStorage.getItem("access_token") || "";

      fetchAccountById(token, accountId)
        .then((acc: Account) => {
          setFormData({
            username: acc.username,
            role: String(acc.role),
            passwordMasked: "********", 
          });
        })
        .catch((err) => {
          console.error("Failed to fetch account:", err);
        })
        .finally(() => setTimeout(() => {
          setLoading(false);
        }, 600));
    }
  }, [accountId, isOpen]);

  if(loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60">
        <EditPopupSkeleton type="account" />
      </div>
    );
  }

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!accountId) return;
    const token = localStorage.getItem("access_token") || "";

    const payload = {
      username: formData.username,
      role: Number(formData.role),
    };

    try {
      await updateAccount(token, accountId, payload);
      setMessage(`Cập nhật thông tin tài khoản thành công!`);
      setMessageType("success");
      // alert("Cập nhật thông tin tài khoản thành công!");
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Failed to update account:", error.message);
      const errorResponse = JSON.parse(error.message);
      setMessage(`Lỗi: ${errorResponse.detail[0]?.msg}`);
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
      }, 5000);
      // alert(`Lỗi: ${error.message}`);
    }
  };

  const handleOpenChangePassword = () => {
    onClose();
    onOpenChangePassword(); 
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

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 border border-none rounded-md bg-gray-100"
                disabled // readonly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Chức vụ</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border rounded-md border-gray-300"
              >
                <option value="">-- Chọn chức vụ --</option>
                <option value="1">Quản lý</option>
                <option value="2">Nhân viên bán hàng</option>
                <option value="4">Nhân viên kho</option>
                <option value="3">Cộng tác viên</option>
              </select>
            </div>

            <div className="">
              <label className="block text-sm font-medium mb-1">Mật khẩu</label>
              <input
                type="password"
                name="passwordMasked"
                value={formData.passwordMasked}
                onChange={handleChange}
                className="w-full p-2 border rounded-md border-gray-300"
                disabled
              />

              {/* Cho sang bên phải  */}
              <div className="text-sm text-blue-500 cursor-pointer mt-2 float-right"
                   onClick={handleOpenChangePassword}>
                <span> Tạo mới mật khẩu</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end bg-gray-100 p-6 -mx-6 rounded-b-2xl">

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-[#338BFF] text-white px-[16px] py-[10px] rounded-md font-semibold"
            >
              Lưu chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupEditAccount;
