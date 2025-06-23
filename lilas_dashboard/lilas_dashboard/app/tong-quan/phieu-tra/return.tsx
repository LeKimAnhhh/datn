"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import RowsPerPage from "@/app/ui/rows-page";
import { ReturnBill } from "@/app/lib/definitions";
import ErrorPage from "@/app/tong-quan/404/page";
import { fetchReturnBills } from "@/app/lib/data";

import CreateReturnButton from "@/app/ui/return/button";
import TableReturn from "@/app/ui/return/table";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";

export default function ReturnPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const pathname = usePathname();
  const { replace } = useRouter();

  // Pagination
  const currentPage = Number(searchParams.get("page")) || 1;
  const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 10;
  const [totalReturns, setTotalReturns] = useState<number>(0);

  const [returns, setReturns] = useState<ReturnBill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // search
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("access_token") || "";
        if (!token) {
          setError("No access token found");
          setLoading(false);
          return;
        }
        const skip = (currentPage - 1) * rowsPerPage;

        // Gọi API lấy danh sách ReturnBill
        const data = await fetchReturnBills(token, skip, rowsPerPage, query);
        // data: { total_return_bills, return_bills }

        setReturns(data.return_bills);
        setTotalReturns(data.total_return_bills);
      } catch (err: any) {
        setError(err.message || "Error fetching return bills");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [query, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(totalReturns / rowsPerPage);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Danh sách phiếu trả</h1>
        <CreateReturnButton />
      </div>

      <div className="bg-white p-6 rounded-2xl mt-6 border boder-[#DFDCE0] shadow-[0_2px_0_#D9D9D9]">
        <div className="flex items-center justify-between gap-2 mb-6">
          <Search
            placeholder="Tìm kiếm theo nhà cung cấp, chi nhánh, ghi chú..."
            // onSearch={handleSearch}
          />
        </div>

        {loading && <InvoicesTableSkeleton />}
        {!loading && !error && <TableReturn initialData={returns} />}

        <div className="mt-5 flex w-full justify-between">
          <RowsPerPage defaultValue={rowsPerPage} />
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
