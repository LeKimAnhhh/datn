'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/app/ui/pagination';
import Search from '@/app/ui/search';
import TableEmployee from '@/app/ui/employee/table';
import CreateEmployeeButton from '@/app/ui/employee/buttons';
import RowsPerPage from '@/app/ui/rows-page';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { fetchEmployeeData } from '@/app/lib/data';
import { Employee } from '@/app/lib/definitions';
import ErrorPage from '../404/page';
import ArrowDropDownOutlined from '@mui/icons-material/ArrowDropDownOutlined';
import Select from '@/app/ui/select';

export default function Page() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  const pathname = usePathname();
  const { replace } = useRouter();

  const currentPage = Number(searchParams.get('page')) || 1;
  const rowsPerPage = Number(searchParams.get('rowsPerPage')) || 10;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [position, setPosition] = useState<string>("all");
  const [shift, setShift] = useState<string>("all");

  const handleSearch = (term: string) => {
    if (term === "all") return replace(`${pathname}`);
    console.log(`Searching... ${term}`);

    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handlePositionSelect = (value: string) => {
    setPosition(value);
    handleSearch(value);
  };

  const handleShiftSelect = (value: string) => {
    setShift(value);
    handleSearch(value);
  };

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

        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No access token found');
          setLoading(false);
          return;
        }

        const data = await fetchEmployeeData(token, rowsPerPage, currentPage, query);
        setEmployees(data.users);
        setTotalUsers(data.total_users);
      } catch (err: any) {
        console.error('Error fetching employees:', err);
        setError(err.message || 'Error fetching employees');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [rowsPerPage, currentPage, query]);

  const totalPages = Math.ceil(totalUsers / rowsPerPage);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Nhân viên</h1>
        <CreateEmployeeButton />
      </div>
      <div className="bg-white p-6 rounded-2xl mt-6 border boder-[#DFDCE0] shadow-[0_2px_0_#D9D9D9]">
        <div className="flex items-center justify-between gap-2 mb-6">
          <Search placeholder="Tìm kiếm theo tên nhân viên, số điện thoại, chức vụ..." />
        </div>

        {/* Ca làm  */}
        <div className="relative flex items-center text-center gap-4 mb-6">
          <Select
            options={[
              { value: "all", label: "Chức vụ" },
              { value: "1", label: "Quản lý" },
              { value: "2", label: "Nhân viên" },
              { value: "3", label: "Cộng tác viên" },
            ]}
            defaultValue={position}
            onSelect={handlePositionSelect}
            btnClassName="!bg-[#6464963D] !text-black text-[15px]"
            wrapperClassName="!min-w-40"
          />

          <Select
            options={[
              { value: "all", label: "Ca làm" },
              { value: "sáng", label: "Ca sáng" },
              { value: "chiều", label: "Ca chiều" },
              { value: "tối", label: "Ca tối" },
              { value: "cả ngày", label: "Cả ngày" },
            ]}
            defaultValue={shift}
            onSelect={handleShiftSelect}
            btnClassName="!bg-[#6464963D] !text-black text-[15px]"
            wrapperClassName="!min-w-40"
          />
        </div>

        {loading && <InvoicesTableSkeleton />}
        {/* {error && (
          <div className="mt-6 text-center text-red-500">
            <p>{error}</p>
          </div>
        )} */}

        {!loading && !error && <TableEmployee initialData={employees} />}

        <div className="mt-5 flex w-full justify-between">
          <RowsPerPage defaultValue={rowsPerPage} />
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
