"use client";

import React, { useEffect, useState } from "react";
import { fetchEmployeeDetails, updateEmployeeDetails } from "@/app/lib/data";
import { CloseOutlined, CheckCircleOutlined, ReportGmailerrorred } from "@mui/icons-material";
import EditPopupSkeleton from "@/app/components/EditPopupSkeleton";

interface PopupEditEmployeeProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
  employeeId: string | null;
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

const PopupEditEmployee: React.FC<PopupEditEmployeeProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeId,
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    role: "",
    shift_work: "",
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

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employeeId && isOpen) {
      const token = localStorage.getItem("access_token") || "";
      setLoading(true);

      fetchEmployeeDetails(employeeId, token)
        .then((data) => {
          setFormData({
            full_name: data.full_name || "",
            role: data.role ? String(data.role) : "",
            shift_work: data.shift_work || "",
            phone_number: data.phone_number || "",
            email: data.email || "",
            address: data.address || "",
          });
          console.log("Employee data:", data);  
        })
        .catch((err) => console.error("Failed to fetch employee:", err))
        .finally(() => {
          setTimeout(() => {
            setLoading(false);
          }, 600);
        });
    }
  }, [employeeId, isOpen]);

  if(loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60">
        <EditPopupSkeleton type="employee" />
      </div>
    )
  }

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
    // if (!formData.phone_number.trim()) newErrors.phone_number = "Vui lòng nhập số điện thoại";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    const token = localStorage.getItem("access_token") || "";
    const payload = {
      full_name: formData.full_name.trim(),
      role: Number(formData.role),
      shift_work: formData.shift_work,
      phone_number: formData.phone_number.trim(),
      email: formData.email.trim() || null,
      address: formData.address.trim() || null,
    };

    try {
      const result = await updateEmployeeDetails(employeeId!, payload, token);
      setMessage(`Cập nhật thông tin nhân viên thành công!`);
      setMessageType("success");
      // alert("Cập nhật thông tin nhân viên thành công!");
      // onSave(result);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Failed to update employee:", error.message);
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
        
        {/* Thêm button "thoát" icon X  */}
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">Chỉnh sửa nhân viên</h2>
          <button onClick={onClose} className="text-gray-600">
            <CloseOutlined />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Tên nhân viên */}
            <div>
              <label className="block text-sm font-medium mb-1">Tên nhân viên</label>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors.full_name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.full_name && (
                <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
              )}
            </div>

            {/* Chức vụ */}
            <div>
              <label className="block text-sm font-medium mb-1">Chức vụ</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border rounded-md border-gray-300"
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ca làm */}
            <div>
              <label>Ca làm</label>
              <select
                name="shift_work"
                value={formData.shift_work}
                onChange={handleChange}
                className="w-full p-2 border rounded-md border-gray-300"
              >
                {shiftOptions.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>

            {/* Số điện thoại */}
            <div>
              <label>Số điện thoại</label>
              <input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full p-2 border rounded-md border-gray-300"
              />
            </div>

            {/* Email */}
            <div>
              <label>Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-md border-gray-300"
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label>Địa chỉ</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded-md border-gray-300"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end bg-gray-100 p-6 -mx-6 rounded-b-2xl">
          {/* Xóa button "Thoát" */}
          <button
            onClick={handleSave}
            className="bg-[#338BFF] text-white px-14 py-2 rounded-md font-semibold hover:bg-[#66B2FF]"
          >
            Lưu chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupEditEmployee;
