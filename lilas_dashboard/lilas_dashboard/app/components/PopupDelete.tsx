"use client";

import React from "react";
import {
  CloseOutlined,
  DeleteForeverOutlined,
} from '@mui/icons-material';

interface PopupDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const PopupDelete: React.FC<PopupDeleteProps> = ({ isOpen, onClose, onConfirm, message }) => {
  const handleApply = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60">
      <div className="relative w-full max-w-[560px] bg-white rounded-3xl shadow-[0_2px_0_#D9D9D9] overflow-hidden">
        <div className="flex justify-end pt-6 px-6">
            <button
              className="text-[#3C3C43B2]"
              onClick={onClose}
            >
              <CloseOutlined />
            </button>
          </div>
        <div className="text-[24px] leading-[32px] font-semibold px-6 flex flex-col justify-center items-start">
          <div className="w-[64px] h-[64px] flex items-center justify-center rounded-full bg-[#FCE1DE]">
            <DeleteForeverOutlined className="text-[#E50000] w-12 h-12" sx={{fontSize: 40,}} />
          </div>
          <span className="font-semibold text-[24px] leading-[32px] text-center mt-6">
            Bạn có chắc không?
          </span>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="-mt-6">
            <span className="text-lg text-center font-medium">
              {message}
            </span>
          </div>
        </div>

        <div className="bg-[#F2F2F7] p-6 flex justify-end gap-4">
          {/* <button
            className="bg-transparent px-16 w-[192px] py-2 text-lg text-[#B8000A] font-semibold rounded-[8px] hover:bg-gray-100"
            onClick={onClose}
          >
            Hủy
          </button> */}
          <button
            className="bg-[#E50000] text-white text-lg px-16 w-[192px] py-2 rounded-[8px] hover:bg-red-700"
            onClick={handleApply}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupDelete;