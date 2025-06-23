"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import RowsPerPage from "@/app/ui/rows-page";
import { TransactionTranferResponse } from "@/app/lib/definitions";
import ErrorPage from "@/app/tong-quan/404/page";
import { fetchTransferStocks } from "@/app/lib/data";
import CreateTransferButton from "@/app/ui/transfer/button";
import TableTransfer from "@/app/ui/transfer/table";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";

export default function TransferPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  // Pagination
  const currentPage = Number(searchParams.get("page")) || 1;
  const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 10;
  const [totalTransfers, setTotalTransfers] = useState<number>(0);

  const [transfers, setTransfers] = useState<TransactionTranferResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        const skip = Math.max(0, (currentPage - 1) * rowsPerPage);
        const data = await fetchTransferStocks(token, skip, rowsPerPage, query);
        setTransfers(data.transactions);
        setTotalTransfers(data.total_transactions);
      } catch (err: any) {
        setError(err.message || "Error fetching transfer bills");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [query, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(totalTransfers / rowsPerPage);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Danh sách phiếu chuyển</h1>
        <CreateTransferButton />
      </div>

      <div className="bg-white p-6 rounded-2xl mt-6 border boder-[#DFDCE0] shadow-[0_2px_0_#D9D9D9]">
        <div className="flex items-center justify-between gap-2 mb-6">
          <Search
            placeholder="Tìm kiếm theo mã phiếu, chi nhánh, nhân viên..."
          />
        </div>

        {loading && <InvoicesTableSkeleton />}
        {!loading && !error && <TableTransfer initialData={transfers} />}

        <div className="mt-5 flex w-full justify-between">
          <RowsPerPage defaultValue={rowsPerPage} />
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
