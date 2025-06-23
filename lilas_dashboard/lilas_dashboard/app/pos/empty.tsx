"use client";

import React from "react";
import Image from "next/image";
import NoData from "../components/NoData";

interface EmptyStateProps {
  onAddProdcut: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddProdcut }) => {
  return (
    <div className="flex-1 overflow-auto px-6 flex">
      <div className="flex flex-col items-center justify-center flex-1 text-[#A08DA5]">
        {/* <Image
          src="/2.svg"
          alt="Empty state"
          width={180}
          height={148}
          className=""
        />
        <p className="text-[17px] font-normal leading-[22px] mt-[8px] text-[#3C3C43] text-opacity-70">
          Hiện tại chưa có sản phẩm nào
        </p> */}
        <NoData message="Hiện tại chưa có sản phẩm nào"/>
        <button
          className="bg-[#338BFF] mt-6 text-white px-4 py-[10px] rounded-lg hover:opacity-80 text-[14px] font-semibold"
          onClick={onAddProdcut}
        >
          Thêm sản phẩm mới ngay
        </button>

      </div>
    </div>
  );
};

export default EmptyState;
