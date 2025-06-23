"use client";

import React, { useState } from "react";
import { createCustomerGroup } from "@/app/lib/data";
import { 
  ReportGmailerrorred,
  CloseOutlined,
  CheckCircleOutlined,
} from "@mui/icons-material";

interface PopupCreateCustomerGroupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (groupData: any) => void;
}

export default function PopupCreateCustomerGroup({
  isOpen,
  onClose,
  onCreated,
}: PopupCreateCustomerGroupProps) {
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState("percent"); // percent | money
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name: string }>({ name: "" });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) {
      setErrors({ name: "Tên nhóm khách hàng không hợp lệ"});
      return;
    }  
    const token = localStorage.getItem("access_token") || "";
    const payload = {
      name: name.trim(),
      discount_type: discountType,
      discount: discount,
      payment_method: paymentMethod.trim(),
      description: description.trim(),
    };
    try {
      const newGroup = await createCustomerGroup(token, payload);
      onCreated(newGroup);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error(err.message);
      setMessage(`${err.message}`);
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
      }, 5000);
      // alert(err.message);
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
      {/* Chỉnh sửa kích thước popup */}
      <div className="bg-white rounded-3xl shadow-[0_2px_0_#D9D9D9] p-6 pb-0 w-[612px]">
        {/* Thêm button "thoát" icon X  */}
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">Thông tin chung</h2>
          <button onClick={onClose} className="text-gray-600">
            <CloseOutlined />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1">Tên nhóm</label>
            <input
              className="w-full p-2 border rounded-md border-gray-300"
              placeholder="Tên nhóm"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="mt-1">
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center">
                  <ReportGmailerrorred className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Loại chiết khấu</label>
            <div className="flex">
              <input
                type="text"
                className="w-full p-2 border rounded-s-md border-gray-300"
                value={discount === 0 ? "0" : discount.toLocaleString("en-ES")}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\./g, "").replace(/,/g, "");
                  let value = Number(rawValue);
                  if (discountType === "percent") {
                    if (value < 0) value = 0;
                    if (value > 100) value = 100;
                  } else if (discountType === "money") {
                    if (value < 0) value = 0;
                  }
                  setDiscount(value);
                }}
                min={0}
                max={discountType === "percent" ? 100 : undefined}
                placeholder="Giá trị chiết khấu"
              />
              <select
                className="w-[100px] p-2 bg-gray-100 border-gray-300 rounded-e-md cursor-pointer"
                value={discountType}
                onChange={(e) => {
                  setDiscountType(e.target.value);
                  setDiscount(0);
                }}
              >
                <option value="percent">%</option>
                <option value="money">VNĐ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Hình thức thanh toán</label>
            <select
              className="w-full p-2 border rounded-md border-gray-300"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Tiền mặt">Tiền mặt</option>
              <option value="Chuyển khoản">Chuyển khoản</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Mô tả</label>
            <textarea
              className="w-full p-2 border rounded-md border-gray-300"
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4 p-6 -mx-6 rounded-b-2xl bg-gray-100">
          {/* Xóa button "Thoát" */}
          <button
            onClick={handleCreate}
            className="bg-[#338BFF] text-white px-14 py-2 rounded-md"
          >
            Tạo mới
          </button>
        </div>
      </div>
    </div>
  );
}
