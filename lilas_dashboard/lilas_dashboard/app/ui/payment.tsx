"use client";
import React, { useState } from "react";

interface PaymentModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;    
    allowNegative?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    title,
    isOpen,
    onClose,
    onConfirm,
    allowNegative = false,
}) => {
    const [remainToPayStr, setRemainToPayStr] = useState("");

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        value = value.replace(/,/g, "");
        if (value === "") {
            setRemainToPayStr("");
            return;
        }

        if (value === "-" && allowNegative) {
            setRemainToPayStr(value);
            return;
        }

        const numericValue = Number(value);
        if (!isNaN(numericValue)) {
            if (allowNegative) {
                    if (numericValue >= -9999999999999 && numericValue <= 9999999999999) {
                    setRemainToPayStr(value);
                }
            } else {
                    if (numericValue >= 0 && numericValue <= 9999999999999) {
                    setRemainToPayStr(value);
                }
            }
        }
    };

    let displayValue = "";
    if (remainToPayStr === "-") {
        displayValue = "-";
    } else if (remainToPayStr !== "") {
        displayValue = Number(remainToPayStr).toLocaleString("en-ES");
    }

    const handleConfirm = () => {
        const amount = Number(remainToPayStr) || 0;
        onConfirm(amount);
    };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-[24px] shadow-lg w-96 relative">
        <div className="p-[24px]">
          <h2 className="text-lg font-semibold text-center mb-4">
            Thanh toán công nợ cho {title}
          </h2>
          <input
            type="text"
            placeholder="0.000"
            className="mt-2 w-full p-2 border border-gray-300 rounded-lg text-gray-500 text-left"
            value={displayValue}
            onChange={handleChange}
          />
        </div>
        <div className="flex bg-gray-100 p-[24px] justify-between rounded-b-[24px]">
          <button onClick={onClose} className="text-black font-semibold">
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;