"use client";

import React, { useRef, useEffect } from "react";
import { Employee } from "@/app/lib/definitions";

interface PopupEmployeesProps {
  employees?: Employee[];
  onSelectEmployee: (employee: Employee) => void;
  onClose: () => void;
}

export default function PopupEmployees({
  employees,
  onSelectEmployee,
  onClose
}: PopupEmployeesProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // click ngoài -> đóng
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

  const handleSelect = (emp: Employee) => {
    onSelectEmployee(emp);
    onClose();
  };

  return (
    <div
      ref={popupRef}
      className="absolute w-full bg-white border border-gray-300 rounded-md max-h-80 overflow-auto p-2 z-50"
    >
      {(employees || []).length === 0 && (
        <div className="p-2 text-center text-gray-500">Không tìm thấy nhân viên</div>
      )}

      {(employees || []).map((emp) => (
          <div
            key={emp.id}
            className="flex flex-col p-2 hover:bg-gray-100 cursor-pointer border-b"
            onClick={() => handleSelect(emp)}
          >
            <div className="text-black">{emp.full_name}</div>
            <div className="text-[#3C3C4359]">{emp.phone_number || "-"}</div>
          </div>
        ))}
    </div>
  );
}
