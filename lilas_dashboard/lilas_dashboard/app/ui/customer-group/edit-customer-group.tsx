"use client";

import React, { useEffect, useState } from "react";
import { getCustomerGroupById, updateCustomerGroup, deleteCustomerGroup } from "@/app/lib/data";
import { CustomerGroup } from "@/app/lib/definitions";
import { ReportGmailerrorred, CloseOutlined, CheckCircleOutlined, BookmarkAddedOutlined  , DeleteOutlineOutlined} from "@mui/icons-material";
import EditPopupSkeleton from "@/app/components/EditPopupSkeleton";

interface PopupEditCustomerGroupProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number | null;
  onSaved: (updated: CustomerGroup) => void;
}

export default function PopupEditCustomerGroup({
  isOpen,
  onClose,
  groupId,
  onSaved,
}: PopupEditCustomerGroupProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [id, setID] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name: string }>({ name: "" });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    if (isOpen && groupId) {
      setLoading(true);
      const token = localStorage.getItem("access_token") || "";
      getCustomerGroupById(token, groupId)
        .then((grp) => {
          setName(grp.name || "");
          setID(String(grp.id) || "");
          setDiscountType(grp.discount_type || "percent");
          setDiscount(grp.discount || 0);
          setPaymentMethod(grp.payment_form || "");
          setDescription(grp.description || "");
        })
        .catch((err) => {
          console.error("Fetch group detail error:", err.message);
          const errorResponse = JSON.parse(err.message);
          setMessage(`Lỗi: ${errorResponse.detail}`);
          setMessageType("error");

          setTimeout(() => {
            setMessage("");
          }, 5000);
          // alert(err.message);
        })
        .finally(() => setTimeout(() => {
          setLoading(false);
        }, 600));
    }
  }, [isOpen, groupId]);

  if(loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60">
      <EditPopupSkeleton type="customer-gr" />
    </div>
  )

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!groupId) return;
    if (!name.trim()) {
      setErrors({ name: "Tên nhóm không hợp lệ" });
      return;
    }    
    const token = localStorage.getItem("access_token") || "";
    const payload = {
      name,
      id,
      discount_type: discountType,
      discount,
      payment_method: paymentMethod,
      description,
    };
    try {
      const updated = await updateCustomerGroup(token, groupId, payload);
      onSaved(updated);
      setMessage(`Đã lưu thay đổi`);
      setMessageType("success");
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setMessage(`${err.message}`);
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
      }, 5000);
      // alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!groupId) return;
    const token = localStorage.getItem("access_token") || "";
    try {
      await deleteCustomerGroup(token, groupId);
      setMessage(`Đã xóa nhóm khách hàng "${name}"`);
      setMessageType("error");
      onClose();
      window.location.reload(); 
    } catch (err: any) {
      setMessage(`error: ${err.message}`);
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
            <CheckCircleOutlined style={{ color: "#3AA207", fontSize: 20 }} />
          ) : (
            <DeleteOutlineOutlined style={{ color: "#D93025", fontSize: 20 }} />
          )}
          <span>{message}</span>
          {/* <CloseOutlined
            className="close-btn"
            style={{ fontSize: 16, cursor: "pointer", color: "#5F6368" }}
            onClick={() => setMessage("")}
          /> */}
        </div>
      )}
      <div className="bg-white rounded-3xl shadow-[0_2px_0_#D9D9D9] p-6 pb-0 w-full max-w-[612px]">
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
              <label className="block text-sm mb-1">Tên nhóm</label>
              <input
                className="w-full p-2 border rounded-md border-gray-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="mt-1">
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center">
                    <ReportGmailerrorred className="w-4 h-4 mr-0" />
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Mã nhóm</label>
              <input
                disabled
                className="w-full p-2 border rounded-md border-gray-300 bg-gray-100"
                value={id}
                onChange={(e) => setID(e.target.value)}
              />
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
        )}

        <div className="mt-6 flex justify-end gap-4 p-6 -mx-6 bg-gray-100 rounded-b-2xl">
            {/* <button onClick={handleDelete} className="text-red-500 px-4 py-2 rounded-md ">
                Xóa nhóm
            </button> */}
            <button
                onClick={handleSave}
                className="bg-[#338BFF] text-white px-14 py-2 rounded-md"
            >
                Lưu chỉnh sửa
            </button>
        </div>
      </div>
    </div>
  );
}
