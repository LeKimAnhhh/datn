"use client";

import React, { useRef, useEffect } from "react";
import { Invoice } from "@/app/lib/definitions";

interface PopupInvoiceProps {
  invoices?: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onClose: () => void;
}

export default function PopupInvoice({
  invoices,
  onSelectInvoice,
  onClose
}: PopupInvoiceProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Đóng popup khi click bên ngoài
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

  const handleSelect = (invoice: Invoice) => {
    onSelectInvoice(invoice);
    onClose();
  };

  return (
    <div
      ref={popupRef}
      className="absolute w-full bg-white border border-gray-300 rounded-md shadow-md max-h-80 overflow-auto p-2 z-50"
    >
      {(invoices || []).length === 0 && (
        <div className="p-2 text-center text-gray-500">Không tìm thấy địa chỉ</div>
      )}

      {(invoices || []).map((invoice) => (
        <div
          key={invoice.id}
          className="flex flex-col p-2 hover:bg-gray-100 cursor-pointer border-b"
          onClick={() => handleSelect(invoice)}
        >
          <div className="text-black">{invoice.branch}</div>
        </div>
      ))}
    </div>
  );
}
