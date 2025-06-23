"use client";

import React, { useState } from "react";
import { createSuppliers } from "@/app/lib/data";
import { Supplier } from "@/app/lib/definitions";
import {
  CloseOutlined,
  ReportGmailerrorred,
  CheckCircleOutlined,
} from "@mui/icons-material";

interface PopupCreateSupplierProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (supplierData: Supplier) => void;
  disableReload?: boolean;
}

export default function PopupCreateSupplier({
  isOpen,
  onClose,
  onCreated,
  disableReload = false,
}: PopupCreateSupplierProps) {
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [debt, setDebt] = useState("");
  // const [error, setError] = useState<string | null>(null);
  // const [message, setMessage] = useState('');
  // const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [contactNameError, setContactNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  if (!isOpen) return null;

  const handleCreate = async () => {
    let isValid = true;
    // if (!contactName.trim()) {
    //   setError("Vui lòng nhập tên nhà cung cấp");
    //   return;
    // }

    if (!contactName.trim()) {
      setContactNameError("Vui lòng nhập tên nhà cung cấp");
      isValid = false;
    } else {
      setContactNameError(null);
    }

    // Validate email nếu có nhập
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
    if (email.trim() && !emailRegex.test(email.trim())) {
      setEmailError("Vui lòng nhập email hợp lệ");
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!isValid) return;

    const token = localStorage.getItem("access_token") || "";
    // setError(null);
    const payload = {
      contact_name: contactName.trim(),
      phone: phone.trim() || "",
      email: email.trim() || "",
      address: address.trim() || "",
      debt: debt.trim() || 0,
    };

    // try {
    //   const newSupplier = await createSuppliers(token, payload);
    //   onCreated(newSupplier);
    //   onClose();
    //   if (!disableReload) {
    //     window.location.reload(); // Reload nếu không có `disableReload`
    //   }
    // } catch (err: any) {
    //   console.error("Create supplier error:", err.message);
    //   setMessage(`Lỗi: ${err.message}`);
    //   setMessageType("error");
    //   // alert(err.message);
    // }

    try {
      const newSupplier = await createSuppliers(token, payload);
      setMessage("Nhà cung cấp được tạo thành công!");
      setMessageType("success");
  
      setTimeout(() => {
        onCreated(newSupplier);
        onClose();
        if (!disableReload) {
          window.location.reload();
        }
      }, 2000);
    } catch (err: any) {
      setMessage(`${err.message}`);
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
          className={`toast-message ${messageType === "success" ? "success" : messageType === "error" ? "error" : ""
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
      <div className="bg-white rounded-3xl shadow-[0_2px_0_#D9D9D9] p-6 w-full max-w-[612px] pb-0">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">Tạo nhà cung cấp</h2>
          <button onClick={onClose} className="text-gray-600">
            <CloseOutlined />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1">Tên nhà cung cấp</label>
            <input
              className="w-full p-2 border rounded-md border-gray-300"
              placeholder="VD: Công ty ABC"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              maxLength={50}
            />
            {/* {error && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <ReportGmailerrorred className='w-4 h-4 mr-1' />
                {error}
              </p>
            )
            } */}
            {contactNameError && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <ReportGmailerrorred className="w-4 h-4 mr-1" />
                {contactNameError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Số điện thoại</label>
            <input
              className="w-full p-2 border rounded-md border-gray-300"
              placeholder="0909xxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded-md border-gray-300"
              placeholder="abc@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
              {emailError && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <ReportGmailerrorred className="w-4 h-4 mr-1" />
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Địa chỉ</label>
            <input
              className="w-full p-2 border rounded-md border-gray-300"
              placeholder="Địa chỉ công ty..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Công nợ</label>
            <input
              className="w-full p-2 border rounded-md border-gray-300"
              placeholder="Công nợ..."
              value={debt}
              onChange={(e) => setDebt(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4 bg-gray-100 p-6 -mx-6 rounded-b-3xl">
          {/* Thay đổi kích cỡ button và xóa button Thoát  */}
          <button
            onClick={handleCreate}
            className="bg-[#338BFF] text-white px-[79px] py-[10px] rounded-md font-semibold"
          >
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
}