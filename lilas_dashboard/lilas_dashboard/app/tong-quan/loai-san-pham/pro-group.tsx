"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Search from "@/app/ui/search";
import Pagination from "@/app/ui/pagination";
import RowsPerPage from "@/app/ui/rows-page";
import { ProductGroupResponse } from "@/app/lib/definitions";
import { fetchProductGroups } from "@/app/lib/data";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import TableProductGroup from "@/app/ui/product-group/table-product-group";
import CreateProductGroupButton from "@/app/ui/product-group/button";
import ErrorPage from "../404/page";

export default function Page() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const currentPage = Number(searchParams.get("page")) || 1;
  const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 10;

  const [groups, setGroups] = useState<ProductGroupResponse[]>([]);
  const [totalGroups, setTotalGroups] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGroups() {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token") || "";
        const skip = (currentPage - 1) * rowsPerPage;
        const limit = rowsPerPage;

        const res = await fetchProductGroups(token, skip, limit, query);
        setGroups(res.groups);
        setTotalGroups(res.total_groups);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadGroups();
  }, [query, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(totalGroups / rowsPerPage);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Danh sách loại sản phẩm</h1>
        <CreateProductGroupButton />
      </div>
      <div className='bg-white p-6 rounded-2xl mt-6 border boder-[#DFDCE0] shadow-[0_2px_0_#D9D9D9]'>
        <div className="flex items-center justify-between gap-2 mb-6">
          <Search placeholder="Tìm kiếm loại sản phẩm..." />
        </div>

        {loading ? (
          <InvoicesTableSkeleton />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <TableProductGroup data={groups} />
        )}

        <div className="mt-5 flex w-full justify-between">
          <RowsPerPage defaultValue={rowsPerPage} />
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
