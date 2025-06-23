"use client";

import React, { useState } from "react";

interface PopupMethodProps {
  isOpen: boolean;
  onClose: () => void;
  finalTotal: number;
}

const PopupMethod: React.FC<PopupMethodProps> = ({ isOpen, onClose, finalTotal }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  if (!isOpen) return null; 

  const paymentMethods = ["Chuyển khoản", "Tiền mặt", "POS", "COD"];
  const handleSelectPaymentMethod = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handleApply = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60">
      <div className="relative w-full max-w-[612px] bg-white rounded-3xl shadow-[0_2px_0_#D9D9D9] overflow-hidden">
        <div className="text-[24px] leading-[32px] font-semibold p-6">
          Chọn phương thức thanh toán
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Khách phải trả</span>
            <input
              className="border border-gray-300 rounded-md px-3 py-1 w-[120px]"
              readOnly
              value={finalTotal.toLocaleString("en-US")}
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  className={`text-base py-2 px-3 rounded-md ${
                    selectedPaymentMethod === method
                      ? "text-white bg-[#0061FD]"
                      : "bg-[#73738733] text-[#928395]"
                  }`}
                  onClick={() => handleSelectPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="border border-gray-300 rounded-md px-3 py-1 w-[120px]"
                min={0}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#E1DFE2] p-6 flex justify-end gap-4">
          <button
            className="bg-transparent px-6 py-2 text-lg rounded hover:bg-gray-100"
            onClick={onClose}
          >
            Thoát
          </button>
          <button
            className="bg-[#0061FD] text-white text-lg px-6 py-2 rounded hover:bg-blue-700"
            onClick={handleApply}
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupMethod;
