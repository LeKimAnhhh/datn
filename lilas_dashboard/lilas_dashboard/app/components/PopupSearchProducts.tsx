"use client";

import React, { useEffect, useRef } from "react";
import { Product } from "@/app/lib/definitions";
import { getApiUrl } from "@/app/lib/utils";
import Image from 'next/image';

interface PopupSearchProductsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
}

export default function PopupSearchProducts({
  products,
  onSelectProduct,
  onClose,
}: PopupSearchProductsProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Click ngoài -> đóng
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={popupRef}
      className="relative bg-white border border-gray-300 rounded-md max-h-80 overflow-auto p-2 z-20"
    >
      {products.length === 0 && (
        <div className="p-2 text-center text-gray-500">Không tìm thấy sản phẩm</div>
      )}

      {products.map((prod) => {
        const imageSource = prod.image_url
          ? getApiUrl(prod.image_url.slice(1))
          : prod.images?.[0]?.url
          ? getApiUrl(prod.images[0].url.slice(1))
          : "/customers/amy-burns.png";
          
        return (
          <div
            key={prod.id}
            className="p-2 hover:bg-gray-100 cursor-pointer border-b flex items-center justify-between gap-2"
            onClick={() => onSelectProduct(prod)}
          >
            {/* <div className="flex items-center gap-2">
              <Image
                src={imageSource}
                alt={prod.name}
                width={48}
                height={48}
                className="w-8 h-8 object-cover rounded"
                //unoptimized
              />
              <span>
                {prod.name} - {prod.price_import.toLocaleString("en-ES")}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Kho thợ nhuộm: {prod.thonhuom_can_sell.toLocaleString("en-ES")} -
              Kho terra: {prod.terra_can_sell.toLocaleString("en-ES")}
            </span> */}
            <Image
              src={imageSource}
              alt={prod.name}
              width={48}
              height={48}
              className="w-12 h-12 object-cover rounded"
              //unoptimized
            />
            <div className="flex flex-col gap-1 w-full">
              <div className="flex justify-between">
                <span className="text-[17px] line-clamp-1">{prod.name}</span>
                <span className="text-[17px] font-semibold">
                  {prod.price_import.toLocaleString("en-ES")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-[#3C3C43B2]">{prod.id}</span>
                <p className="text-sm text-[#3C3C43B2]">
                  Kho thợ nhuộm:{" "}
                  <span className="font-semibold text-black">
                    {prod.thonhuom_can_sell.toLocaleString("en-ES")}
                  </span>{" "}
                  | Kho terra:{" "}
                  <span className="font-semibold text-black">
                    {prod.terra_can_sell.toLocaleString("en-ES")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
