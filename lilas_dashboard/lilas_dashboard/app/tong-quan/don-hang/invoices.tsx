'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import TableCMS from '@/app/ui/invoices/table-invoice';
import { fetchInvoices } from '@/app/lib/data';
import Pagination from '@/app/ui/pagination';
import Search from '@/app/ui/search';
import RowsPerPage from '@/app/ui/rows-page';
import { InvoiceListResponse, Invoice } from '@/app/lib/definitions';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import ErrorPage from '../404/page';
import Select from '@/app/ui/select';
import Image from 'next/image';

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  const pathname = usePathname();
  const { replace } = useRouter();
  
  const currentPage = Number(searchParams.get('page')) || 1;
  const rowsPerPage = Number(searchParams.get('rowsPerPage')) || 10;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalInvoices, setTotalInvoices] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
 
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [orderStatus, setOrderStatus] = useState<string>("all");

  const handleSearch = (term: string) => {
    if(term === 'all') return replace(`${pathname}`);
    console.log(`Searching... ${term}`);

    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleOrderStatusSelect = (value: string) => {
    setOrderStatus(value);
    handleSearch(value);
  };

  const handlePaymentStatusSelect = (value: string) => {
    setPaymentStatus(value);
    handleSearch(value);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token') || '';
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const data: InvoiceListResponse = await fetchInvoices(token, rowsPerPage, currentPage, query, query.split(","));
        setInvoices(data.invoices);
        setTotalInvoices(data.total_invoices);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [query, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(totalInvoices / rowsPerPage);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="w-full p-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Danh sách đơn hàng</h1>
        <CreateInvoice />
      </div>
      <div className="bg-white p-6 max-lg-padding  rounded-2xl mt-6 border boder-[#DFDCE0] shadow-[0_2px_0_#D9D9D9]">
        <div className="flex items-center justify-between gap-2 mb-6">
          <Search placeholder="Tìm kiếm theo mã đơn, chi nhánh, ghi chú..." />
        </div>

        <div className='flex justify-between gap-2 mb-6'>
          <div className='flex flex-wrap gap-4'>
            <Select
              options={[
                { value: "all", label: "Trạng thái đơn hàng" },
                { value: "cancel", label: "Đã hủy" },
                { value: "delivering", label: "Đang vận chuyển" },
                { value: "delivered", label: "Đã hoàn thành" },
                { value: "returning", label: "Trả hàng chờ nhận" },
                { value: "picking,ready_to_pick", label: "Đang giao dịch" },
                { value: "returned", label: "Trả hàng đã nhận" },
              ]}
              onSelect={handleOrderStatusSelect}
              btnClassName="!bg-[#6464963D] !text-black"
              defaultValue={orderStatus}
              // placeholder='Trạng thái đơn hàng'
            />

            <Select
              options={[
                { value: "all", label: "Trạng thái thanh toán" },
                { value: "paid", label: "Đã thanh toán" },
                { value: "partial_payment", label: "Thanh toán 1 phần" },
                { value: "unpaid", label: "Chưa thanh toán" },
              ]}
              onSelect={handlePaymentStatusSelect}
              btnClassName="!bg-[#6464963D] !text-black"
              defaultValue={paymentStatus}
              // placeholder='Trạng thái thanh toán'
            />
          </div>
          <div className='flex gap-12'>
            <div className='flex items-center text-center gap-2'>
              <Image 
                src="/Label.svg" 
                alt="label" 
                width={24} 
                height={24} 
                className="w-6 h-6"
              />
              <span className='text-center font-normal text-[15px] leading-5'>Đơn có chiết khấu</span>
            </div>
            <div className='flex items-center text-center gap-2'>
              <Image 
                src="/Label_2.svg" 
                alt="label" 
                width={24} 
                height={24} 
                className="w-6 h-6"
              />
              <span className='text-center font-normal text-[15px] leading-5'>Đơn thêm chi phí</span>
            </div>
          </div>
        </div>

        {loading && <p>Đang tải dữ liệu...</p>}
        {/* {error && <p className="text-red-500">{error}</p>} */}
        {!loading && !error && <TableCMS data={invoices} />}
        <div className="mt-5 flex w-full justify-between">
          <RowsPerPage defaultValue={rowsPerPage} />
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}

