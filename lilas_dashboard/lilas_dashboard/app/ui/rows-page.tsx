'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowDropDownOutlined } from '@mui/icons-material';

interface RowsPerPageProps {
  options?: number[];
  defaultValue?: number;
}

const RowsPerPage: React.FC<RowsPerPageProps> = ({
  options = [10, 20, 50, 100],
  defaultValue = 10,
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleChange = (value: number) => {
    setSelectedValue(value);
    setDropdownOpen(false);
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    params.set('rowsPerPage', value.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-[241px]">
      <div 
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center w-full rounded-[4px] border border-[#D9D9D9] bg-white py-[7px] px-4 text-sm text-black cursor-pointer"
      >
        <span className="flex-1">Hiển thị {selectedValue} dòng mỗi trang</span>
      </div>
      <div 
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="absolute top-0 right-0 h-full flex items-center justify-center bg-[#73738721] w-8 rounded-tr-[4px] rounded-br-[4px]">
        <ArrowDropDownOutlined className="text-black w-4 h-4" />
      </div>

      {isDropdownOpen  && (
        <div className="absolute z-10 mt-1 w-full rounded-[4px] border border-[#D9D9D9] bg-white">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleChange(option)}
              className="py-[7px] px-4 text-sm text-black hover:bg-[#338BFF26] cursor-pointer"
            >
              <span className='text-ellipsis'>Hiển thị {option} hóa đơn mỗi trang</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RowsPerPage;
