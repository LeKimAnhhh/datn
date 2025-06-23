"use client";

import React, { useState, useEffect, useRef } from "react";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import { cn } from "../lib/utils";

interface SelectProps {
  onSelect: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  btnClassName?: string;
  wrapperClassName?: string;
  itemClassName?:string;
  iconSize?: number;
  disabled?: boolean;
  options: { label: string; value: string }[];
}

const Select: React.FC<SelectProps> = ({
  onSelect,
  defaultValue,
  placeholder,
  btnClassName,
  wrapperClassName,
  itemClassName,
  iconSize = 20,
  options,
  disabled = false,
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((opt) => opt.value === selected)?.label;

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
    <div
      ref={dropdownRef}
      className={cn("relative inline-block min-w-48", wrapperClassName)}
    >
      <button
        className={cn(
          "w-full bg-[#338BFF] text-white text-sm flex justify-between items-center py-1 px-[10px] rounded-md border border-transparent hover:border-[#66B2FF] cursor-pointer",
          btnClassName,
          disabled && "cursor-not-allowed hover:border-inherit"
        )}
        onClick={() => setDropdownOpen(!isDropdownOpen)}
      >
        <span className={cn(placeholder && "text-[#3C3C4366]", selectedLabel && "text-inherit")}>
          {selectedLabel || placeholder}
        </span>
        {!disabled && <ArrowDropDown className={cn(placeholder && "text-[#3C3C43B2]", selectedLabel && "text-inherit")} fontSize="small" sx={{ fontSize: iconSize }} />}
      </button>

      {isDropdownOpen && !disabled && (
        <ul className="absolute w-full bg-white border border-gray-300 rounded mt-1 shadow z-10">
          {options.map((option) => (
            <li
              key={option.value}
              className={cn(
                "px-[10px] py-1 text-sm text-black hover:bg-[#338BFF26] hover:cursor-pointer",
                itemClassName
              )}
              onClick={() => {
                setSelected(option.value);
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

export default Select;
