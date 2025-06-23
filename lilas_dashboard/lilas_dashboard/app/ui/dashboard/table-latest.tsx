'use client';

import React, { useEffect, useState } from "react";
import TableCMS from '@/app/ui/table';
import { fetchInvoices } from '@/app/lib/data';
import { Invoice } from '@/app/lib/definitions';
import { Tooltip } from "react-tooltip";
import Image from "next/image";

const TableLatestPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);  
  
  useEffect(() => {
    const fetchLatestInvoices = async () => {
      try {
        const token = localStorage.getItem('access_token') || '';
        const response = await fetchInvoices(token, 5, 1); 
        console.log("response", response);
        setInvoices(response.invoices);
      } catch (error) {
        console.error("Error fetching latest invoices:", error);
      }      
    };

    fetchLatestInvoices();
  }, []);

  return (
    <div className="flex w-full flex-col md:col-span-1 bg-white rounded-2xl border boder-[#DFDCE0] shadow-[0_2px_0_#D9D9D9]">
      <div className="flex justify-between items-center text-center px-6 pt-6">
        <h2 className="text-xl font-semibold">Đơn hàng gần đây</h2>
        <div className="flex gap-12">
          <div className="flex flex-wrap text-center">
            <Image 
              src="/Label.svg" 
              alt="label" 
              width={24} 
              height={24} 
              className="w-6 h-6 mr-2"
            />
            <span className='font-normal text-[15px] leading-5 mt-0.5'>Đơn có chiết khấu</span>
          </div>
          <div className="flex justify-center">
            <Image 
              src="/Label_2.svg" 
              alt="label" 
              width={24} 
              height={24} 
              className="w-6 h-6 mr-2"
            />
            <span className='font-normal text-[15px] leading-5 mt-0.5'>Đơn thêm chi phí</span>
          </div>
        </div>
      </div>
      <TableCMS data={invoices} />
    </div>
  );
};

export default TableLatestPage;
