"use client";

import React, { useState, useEffect, useRef } from "react";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import { cn } from "../lib/utils";

interface SelectButtonProps {
  onSelect: (value: number) => void;
  selectedDays: number;
  btnClassName?: string;
}

const SelectButton: React.FC<SelectButtonProps> = ({
  onSelect,
  selectedDays,
  btnClassName,
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { label: "1 ngày qua", value: 1 },
    { label: "7 ngày qua", value: 7 },
    { label: "30 ngày qua", value: 30 },
    { label: "1 năm qua", value: 365 },
  ];
  const selectedLabel = options.find(
    (opt) => opt.value === selectedDays
  )?.label;

  // close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block min-w-32">
      <button
        className={cn(
          "w-full bg-[#338BFF] text-white text-sm flex justify-between items-center py-1 px-[10px] rounded-md border border-transparent hover:border-[#66B2FF] cursor-pointer",
          btnClassName
        )}
        onClick={() => setDropdownOpen(!isDropdownOpen)}
      >
        <span>{selectedLabel}</span>
        <ArrowDropDown fontSize="small" />
      </button>

      {isDropdownOpen && (
        <ul className="absolute w-full bg-white border border-gray-300 rounded mt-1 shadow z-10">
          {options.map((option) => (
            <li
              key={option.value}
              className="px-[10px] py-1 text-sm text-black hover:bg-[#338BFF26] hover:cursor-pointer"
              onClick={() => {
                onSelect(option.value);
                setDropdownOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelectButton;
