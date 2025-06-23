"use client";

import React, { useState } from "react";
import { createEmployee } from '@/app/lib/data';
import { 
  CloseOutlined,
  ReportGmailerrorred,
  CheckCircleOutlined,
 } from "@mui/icons-material";

interface PopupCreateEmployeeProps {
  isOpen: boolean;
  onClose: () => void;
}

const roleOptions = [
  { value: "1", label: "Quản lý" },
  { value: "2", label: "Nhân viên" },
  { value: "3", label: "Cộng tác viên" },
];

const shiftOptions = [
  "Ca sáng",
  "Ca chiều",
  "Ca tối",
  "Cả ngày",
];

const PopupCreateEmployee: React.FC<PopupCreateEmployeeProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    role: "1",
    shift_work: "Ca sáng",
    phone_number: "",
    email: "",
    address: "",
  });

  const [errors, setErrors] = useState({
    full_name: "",
    role: "",
    shift_work: "",
    phone_number: "",
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // const token = localStorage.getItem("access_token") || "";
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : "";

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
    if (!formData.full_name.trim()) newErrors.full_name = "Vui lòng nhập tên nhân viên";
    if (!formData.role) newErrors.role = "Vui lòng chọn chức vụ";
    if (!formData.shift_work) newErrors.shift_work = "Vui lòng chọn ca làm";
    if (!formData.phone_number.trim()) newErrors.phone_number = "Vui lòng nhập số điện thoại";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;

  }

  const handleCreate = async () => {
    if (!validateForm()) return;

    const payload = {
      full_name: formData.full_name.trim(),
      role: Number(formData.role),
      shift_work: formData.shift_work,
      phone_number: formData.phone_number.trim(),
      email: formData.email.trim() || null,
      address: formData.address.trim() || null,
    };

    console.log(payload)

    try {
      const result = await createEmployee(token, payload);
      setMessage(`Tạo nhân viên thành công`);
      setMessageType("success");
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.log('Error:', error.message);
      setMessage(`${error.message}`);
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60">
      {message && (
        <div
          className={`toast-message ${
            messageType === "success" ? "success" : messageType === "error" ? "error" : ""
          }`}
        >
          {messageType === "success" ? (
            <CheckCircleOutlined style={{ color: "#1A73E8", fontSize: 20 }} />
          ) : (
            <ReportGmailerrorred style={{ color: "#D93025", fontSize: 20 }} />
          )}
          <span>{message}</span>
          <CloseOutlined
            className="close-btn"
            style={{ fontSize: 16, cursor: "pointer", color: "#5F6368" }}
            onClick={() => setMessage("")}
          />
        </div>
      )}
      <div className="relative w-full max-w-[612px] bg-white rounded-3xl shadow-[0_2px_0_#D9D9D9] p-6 pb-0">
        {/* Header */}
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">Thông tin chung</h2>
          <button onClick={onClose} className="text-gray-600">
            <CloseOutlined />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4">
          {/* Tên nhân viên */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Tên nhân viên</label>
            <input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.full_name ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="Nguyen Van A"
            />
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <ReportGmailerrorred className='w-4 h-4 mr-1' />
                {errors.full_name}
              </p>
            )}
          </div>

          {/* Chức vụ */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Chức vụ</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.role ? "border-red-500" : "border-gray-300"
                }`}
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <ReportGmailerrorred className='w-4 h-4 mr-1' />
                {errors.role}
              </p>
            )}
          </div>

          {/* Ca làm */}
          <div className='relative'>
            <label className="block text-sm font-medium mb-1">Ca làm</label>
            <select
              name="shift_work"
              value={formData.shift_work}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.shift_work ? "border-red-500" : "border-gray-300"
                }`}
            >
              {shiftOptions.map((shift) => (
                <option key={shift} value={shift}>
                  {shift}
                </option>
              ))}
            </select>
            {errors.shift_work && (
              <p className="text-red-500 text-xs mt-1">{errors.shift_work}</p>
            )}
          </div>

          {/* Số điện thoại */}
          <div className='relative'>
            <label className="block text-sm font-medium mb-1">Số điện thoại</label>
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.phone_number ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="Số điện thoại"
            />
            {errors.phone_number && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <ReportGmailerrorred className='w-4 h-4 mr-1' />
              {errors.phone_number}
            </p>
            )}
          </div>

          {/* Email */}
          <div className='relative'>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded-md border-gray-300"
              placeholder="Địa chỉ Email"
            />
          </div>

          {/* Địa chỉ */}
          <div className='relative'>
            <label className="block text-sm font-medium mb-1">Địa chỉ</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded-md border-gray-300"
              placeholder="Địa chỉ"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end bg-gray-100 p-6 -mx-6 rounded-b-2xl">
          {/* Thay đổi kích cỡ button và xóa button Thoát  */}
          <div className="">
            <button
              onClick={handleCreate}
              className="bg-[#338BFF] text-white px-14 py-2 rounded-md font-semibold hover:bg-[#66B2FF]"
            >
              Tạo mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupCreateEmployee;
