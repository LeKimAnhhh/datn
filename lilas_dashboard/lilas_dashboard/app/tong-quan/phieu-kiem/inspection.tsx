"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Search from "@/app/ui/search";
import Pagination from "@/app/ui/pagination";
import RowsPerPage from "@/app/ui/rows-page";
import CreateInspectionButton from "@/app/ui/inspection/button";

import { InspectionReport } from "@/app/lib/definitions"; 
import { fetchInspections } from "@/app/lib/data"; // Hàm gọi API
import TableInspection from "@/app/ui/inspection/table";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import ErrorPage from "../404/page";
import ArrowDropDownOutlined from '@mui/icons-material/ArrowDropDownOutlined';
import Select from "@/app/ui/select";

export default function InspectionPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const pathname = usePathname();
  const { replace } = useRouter();

  const currentPage = Number(searchParams.get("page")) || 1;
  const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 10;

  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [totalReports, setTotalReports] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [inspectionStatus, setInspectionStatus] = useState<string>("all");
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

  const handleInspectionStatusSelect = (value: string) => {
    setInspectionStatus(value);
    handleSearch(value);
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token") || "";
        const skip = (currentPage - 1) * rowsPerPage;
        const data = await fetchInspections(token, skip, rowsPerPage, query);
        // { total_reports, reports }
        setReports(data.reports);
        setTotalReports(data.total_reports);
      } catch (err: any) {
        setError(err.message || "Lỗi tải danh sách phiếu kiểm.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [query, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(totalReports / rowsPerPage);

   if (error) {
     return <ErrorPage />;
   }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Danh sách phiếu kiểm</h1>
        <CreateInspectionButton />
      </div>
      <div className="bg-white p-6 rounded-2xl mt-6 border boder-[#DFDCE0] shadow-[0_2px_0_#D9D9D9]">
        <div className="flex items-center justify-between gap-2 mb-6">
          <Search placeholder="Tìm kiếm phiếu kiểm..." />
        </div>

        {/* Danh sách phiếu kiểm  */}
        <div className="relative inline-block mb-6 mr-4">
          <Select
            options={[
              { value: "all", label: "Trạng thái phiếu kiểm" },
              { value: "checked", label: "Đã kiểm xong" },
              { value: "checking", label: "Đang kiểm" },
            ]}
            defaultValue={inspectionStatus}
            onSelect={handleInspectionStatusSelect}
            btnClassName="!bg-[#6464963D] !text-black"
          />
        </div>

        {loading && <InvoicesTableSkeleton />}
        {/* {error && <div className="text-red-500">{error}</div>} */}

        {!loading && !error && <TableInspection initialData={reports} />}

        {/* Chọn số dòng / pagination */}
        <div className="mt-5 flex w-full justify-between">
          <RowsPerPage defaultValue={rowsPerPage} />
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
