"use client";

import React from "react";
import {
  CloseOutlined,
  PendingActionsOutlined,
} from "@mui/icons-material";


interface PopupPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PopupPayment: React.FC<PopupPaymentProps> = ({ isOpen, onClose, onConfirm }) => {
  const handleApply = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60">
      <div className="relative w-[621px] bg-white rounded-3xl shadow-[0_2px_0_#D9D9D9] overflow-hidden">
        <div className="flex justify-end pt-6 px-6">
          <button
            className="text-[#3C3C43B2]"
            onClick={onClose}
          >
            <CloseOutlined />
          </button>
        </div>
        <div className="flex flex-col gap-6 px-6 pb-6">
          <span className="rounded-full h-[72px] w-[72px] flex items-center justify-center bg-[#DEE9FC]">
            <PendingActionsOutlined sx={{ color: "#338BFF", fontSize: 40 }} />
          </span>

          <div className="text-start flex flex-col gap-2">
            <h3 className="font-semibold text-2xl">Xác nhận thanh toán</h3>
            <p className="text-[17px] font-normal">
              Vui lòng kiểm tra lại thông tin trước khi xác nhận thanh toán
            </p>
          </div>
        </div>

        <div className="bg-[#E1DFE2] p-6 flex justify-end gap-4">
          <button
            className="bg-[#338BFF] text-white text-[15px] font-medium px-6 py-2 rounded-lg hover:bg-[#66B2FF]"
            onClick={handleApply}
          >
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60">
  //     <div className="relative w-[621px] bg-white rounded-3xl shadow-[0_2px_0_#D9D9D9] overflow-hidden">
  //       <div className="flex flex-col justify-center items-center text-[24px] leading-[32px] font-semibold px-6 pt-6 pb-0">
  //         <PendingActionsOutlined style={{ fontSize: "64px", color: "#338BFF", marginBottom: "24px" }}/>
  //         Xác nhận thanh toán
  //       </div>

  //       <div className="p-6 flex flex-col gap-4">
  //         <div className="flex items-center">
  //           <span className="text-[17px] font-normal">
  //             Vui lòng kiểm tra lại thông tin trước khi xác nhận.
  //             {/* <br />
  //             Nhấn <strong>“Xác nhận”</strong> để hoàn tất thanh toán hoặc{" "}
  //             <strong>“Hủy”</strong> để quay lại. */}
  //           </span>
  //         </div>
  //       </div>

  //       <div className="bg-[#E1DFE2] p-6 flex justify-end gap-4">
  //         {/* <button
  //           className="bg-transparent px-6 py-2 text-[15px] text-lg rounded hover:bg-[#77777E1A] mr-20"
  //           onClick={onClose}
  //         >
  //           Hủy
  //         </button> */}
  //         <button
  //           className="bg-[#338BFF] text-white text-[15px] font-medium px-6 py-2 rounded-lg hover:bg-[#66B2FF]"
  //           onClick={handleApply}
  //         >
  //           Xác nhận thanh toán
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );


};

export default PopupPayment;