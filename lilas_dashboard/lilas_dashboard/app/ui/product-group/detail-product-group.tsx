"use client";

import React, { useState } from "react";
import { ProductGroupResponse } from "@/app/lib/definitions";
import { deleteProductGroup, updateProductGroup } from "@/app/lib/data";
import { CloseOutlined, CheckCircleOutlined, ReportGmailerrorred } from "@mui/icons-material";
import PopupDelete from "@/app/components/PopupDelete";

interface DetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  group: ProductGroupResponse;
}

export default function DetailProductGroupPopup({
  isOpen,
  onClose,
  group,
}: DetailPopupProps) {
  const [name, setName] = useState(group.name);
  const [note, setNote] = useState(group.description || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isProductDetailHidden, setIsProductDetailHidden] = useState(false);


  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token") || "";
      await deleteProductGroup(token, group.name);
      setMessage(`Đã xóa loại sản phẩm "${group.name}". Các sản phẩm sẽ được chuyển sang nhóm sản phẩm mặc định "Mỹ phẩm"`);
      setMessageType("success");
      // alert(`Xóa nhóm "${group.name}" thành công. Các sản phẩm trong nhóm được chuyển sang nhóm sản phẩm mặc định "Mỹ phẩm".`);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message);

      setMessageType("error");
      setMessage(err.message);

      setTimeout(() => {setMessage("");}, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      // setError("Vui lòng nhập tên nhóm");
      setMessage("Vui lòng nhập tên nhóm");
      setMessageType("error");
      setTimeout(() => {setMessage("");}, 2000);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token") || "";
      await updateProductGroup(token, group.name, {
        name: name.trim(),
        description: note.trim(),
      });
      setMessage(`Cập nhật loại sản phẩm thành công!`);
      setMessageType("success");
      // alert("Cập nhật loại sản phẩm thành công!");
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      // setError(err.message);
      setMessage(err.message);
      setMessageType("error");
      setTimeout(() => {setMessage("");}, 2000);
      
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
          style={{ maxWidth: "90%" }}
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
      {!isProductDetailHidden && (
        <div className="bg-white rounded-2xl shadow-[0_2px_0_#D9D9D9] p-6 pb-0 w-full max-w-[612px] relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500"
          >
            <CloseOutlined />
          </button>
          <h2 className="text-2xl font-bold mb-6">Chi tiết loại sản phẩm</h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1">Tên loại sản phẩm</label>
              <input
                className="w-full p-2 border rounded-lg border-gray-200"
                value={name}
                // placeholder="Tên loại sản phẩm"
                onChange={(e) => setName(e.target.value)}
                maxLength={500}
              />
            </div>
            <div>
              <label className="mb-1">Ghi chú</label>
              <textarea
                className="w-full p-2 border rounded-lg border-gray-200"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                // placeholder="Ghi chú sản phẩm"
                rows={5}
                maxLength={500}
              />
            </div>
          </div>
          {/* {error && <p className="text-red-500 mb-2">{error}</p>} */}

          <div className="-mx-6 mt-6 flex justify-end gap-4 bg-gray-100 rounded-b-2xl p-6">
            <button
              onClick={() => {
                setIsDeletePopupOpen(true);
                setIsProductDetailHidden(true); 
              }}
              disabled={loading}
              className="text-white bg-red-500 px-14 py-2 rounded-md font-semibold hover:bg-red-700"
            >
              Xóa
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-[#338BFF] hover:bg-[#66B2FF] text-white px-14 py-2 rounded-md font-semibold"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      )}

      {isDeletePopupOpen && (
        <PopupDelete
          isOpen={isDeletePopupOpen}
          onClose={() => {
            setIsDeletePopupOpen(false);
            setIsProductDetailHidden(false);
          }}
          onConfirm={handleDelete}
          message={`Hệ thống sẽ xoá loại sản phẩm "${group.name}" và không thể khôi phục!`}
        />
      )}
    </div>
  );
}
