'use client';

import { useState, useEffect, useRef } from 'react';
import Pagination from '@/app/ui/pagination';
import Search from '@/app/ui/search';
import { CreateProduct } from '@/app/ui/product/buttons';
import RowsPerPage from '@/app/ui/rows-page';
import TableProduct from '@/app/ui/product/table-product';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Product } from '@/app/lib/definitions';
import { fetchProducts } from "@/app/lib/data";
import ErrorPage from '../404/page';
import ArrowDropDownOutlined from '@mui/icons-material/ArrowDropDownOutlined';
import Select from "@/app/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from '@/app/auth-context';

export default function Page() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const { user } = useAuth();
  const userRole = user?.role?.toString();

  const pathname = usePathname();
  const { replace } = useRouter();

  const currentPage = Number(searchParams.get('page')) || 1;
  const rowsPerPage = Number(searchParams.get('rowsPerPage')) || 10;

  const [data, setData] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [productStatus, setProductStatus] = useState<string>("all");

  const selectRef = useRef<HTMLSelectElement>(null);
      const textRef = useRef<HTMLSpanElement>(null);
      const [sortBy, setSortBy] = useState<string>("all");
      const [width, setWidth] = useState("auto");
    
      useEffect(() => {
        updateWidth(sortBy);
      }, [sortBy]);
    
      const updateWidth = (value: string) => {
        if (textRef.current) {
          textRef.current.textContent = document.querySelector(
            `option[value="${value}"]`
          )?.textContent || "";
          setWidth(`${textRef.current.offsetWidth + 32}px`); // Thêm padding
        }
      };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("access_token") || "";
        const skip = (currentPage - 1) * rowsPerPage;
        const limit = rowsPerPage;

        const res = await fetchProducts(token, skip, limit, query);
        setTotalProducts(res.total_products);
        setData(res.products);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Lỗi load danh sách sản phẩm");
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [query, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(totalProducts / rowsPerPage);

  if(error) {
    return <ErrorPage  />
  }

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

  const handleProductStatusSelect = (value: string) => {
    setProductStatus(value);
    handleSearch(value);
  };

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Danh sách sản phẩm</h1>
        <CreateProduct />
      </div>
      <div className='bg-white p-6 rounded-2xl mt-6 border boder-[#DFDCE0] shadow-[0_2px_0_#D9D9D9]'>
        <div className="flex items-center justify-between gap-2 mb-6">
          <Search placeholder="Tìm kiếm theo mã sản phẩm, tên sản phẩm..." />        
        </div>

        {/* Danh sách sản phẩm  */}
        <div className="relative inline-block mb-6">
          <Select
            options={[
              { value: "all", label: "Trạng thái" },
              { value: "có thể bán", label: "Đang giao dịch" },
              { value: "ngừng bán", label: "Ngừng giao dịch" },
            ]}
            onSelect={handleProductStatusSelect}
            defaultValue={productStatus}
            btnClassName="!bg-[#6464963D] !text-black flex justify-between text-center text-[15px]"
          />
        </div>
        {loading ? (
          <InvoicesTableSkeleton />
        ) : (
          <TableProduct data={data} userRole={userRole} />
        )}
        <div className="mt-5 flex w-full justify-between">
          <RowsPerPage defaultValue={rowsPerPage} />
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}

