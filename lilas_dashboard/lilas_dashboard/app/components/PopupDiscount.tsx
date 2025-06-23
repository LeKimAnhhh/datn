"use client";

import React, { useState } from "react";

interface PopupDiscountProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (discountValue: number, type: "%" | "value") => void;
}

const PopupDiscount: React.FC<PopupDiscountProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [discountType, setDiscountType] = useState<"%" | "value">("%");
  const [discount, setDiscount] = useState<number>(0);
  const [isLoyaltyDiscount, setIsLoyaltyDiscount] = useState(false);
  const [loyaltyDiscountValue, setLoyaltyDiscountValue] = useState<number>(0);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(discount, discountType);
    onClose();
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(e.target.value);

    if (discountType === "%") {
      value = Math.min(100, Math.max(0, value));
    } else {
      value = Math.max(0, value);
    }

    setDiscount(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60">
      <div className="relative w-full max-w-[612px] bg-white rounded-3xl shadow-[0_2px_0_#D9D9D9] overflow-hidden">
        <div className="text-[24px] leading-[32px] font-semibold p-6">
          Chi tiết đơn hàng
        </div>

        <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-[16px] font-medium">Chiết khấu thường</span>
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                        <button
                            className={`px-3 py-1 ${
                            discountType === "%" ? "bg-[#478E06] text-white" : "bg-gray-200"
                            }`}
                            onClick={() => {
                              setDiscountType("%");
                              setDiscount(0);
                          }}
                        >
                            %
                        </button>
                        <button
                            className={`px-3 py-1 ${
                            discountType === "value"
                                ? "bg-[#478E06] text-white"
                                : "bg-gray-200"
                            }`}
                            onClick={() => {
                              setDiscountType("value");
                              setDiscount(0);
                          }}
                        >
                            Giá trị
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                    type="number"
                    value={discount === 0 ? '' : discount}
                    placeholder="0"
                    onChange={handleDiscountChange}
                    className="border border-gray-300 rounded-md px-3 py-1 w-[120px]"
                    min={0}
                    max={discountType === "%" ? 100 : undefined}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="loyalty-discount"
                      checked={isLoyaltyDiscount}
                      onChange={() => setIsLoyaltyDiscount(!isLoyaltyDiscount)}
                    />
                    <label
                      htmlFor="loyalty-discount"
                      className="text-[16px] font-medium cursor-pointer"
                    >
                      Chiết khấu tích điểm ({loyaltyDiscountValue}%)
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <input
                    type="number"
                    value={loyaltyDiscountValue === 0 ? '' : loyaltyDiscountValue}
                    placeholder="0"
                    onChange={(e) =>
                        setLoyaltyDiscountValue(Number(e.target.value))
                    }
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
            className="bg-[#478E06] text-white text-lg px-6 py-2 rounded hover:bg-green-700"
            onClick={handleApply}
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupDiscount;
