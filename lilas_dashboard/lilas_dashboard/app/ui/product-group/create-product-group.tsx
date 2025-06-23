"use client";

import React, { useState } from "react";
import { createProductGroup } from "@/app/lib/data";
import {
  CloseOutlined,
  ReportGmailerrorred,
  CheckCircleOutlined,
} from "@mui/icons-material";

interface CreateProductGroupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProductGroupPopup({
  isOpen,
  onClose,
}: CreateProductGroupPopupProps) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Vui lòng nhập tên loại sản phẩm");
      return;
    }

    const token = localStorage.getItem("access_token") || "";
    setLoading(true);
    setError(null);
    try {
      await createProductGroup(token, {
        name: name.trim(),
        description: note.trim(),
      });
      setMessage(`Tạo loại sản phẩm thành công!`);
      setMessageType("success");
      // alert("Tạo loại sản phẩm thành công!");
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      <div className="bg-white rounded-2xl shadow-[0_2px_0_#D9D9D9] p-6 pb-0 w-full max-w-[612px] relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500"
        >
          <CloseOutlined />
        </button>
        <h2 className="text-2xl font-bold mb-6">Tạo loại sản phẩm</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 text-[17px] leading-[22px] font-normal">Tên loại sản phẩm</label>
            <input
              className="w-full p-2 border rounded-lg border-gray-200"
              // placeholder="Tên loại sản phẩm"
              value={name}
              maxLength={500}
              onChange={(e) => setName(e.target.value)}
            />
            {error && (
              <p className="text-red-500 mb-2 flex items-center">
                <ReportGmailerrorred className='w-4 h-4 mr-1' />
                {error}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 text-[17px] font-normal leading-[22px]">Ghi chú</label>
            <textarea
              className="w-full p-2 border rounded-lg border-gray-200"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              // placeholder="Ghi chú sản phẩm"
              maxLength={5000}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end bg-gray-100 p-6 -mx-6 rounded-b-2xl">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-[#338BFF] hover:bg-[#66B2FF] text-white px-14 py-2 rounded-md font-semibold"
          >
            {loading ? "Đang tạo..." : "Tạo"}
          </button>
        </div>
      </div>
    </div>
  );
}
