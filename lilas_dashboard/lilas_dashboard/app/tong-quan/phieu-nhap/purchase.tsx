"use client";

import { useEffect, useState , useRef} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import CreatePurchaseButton from "@/app/ui/purchase/button";
import TablePurchase from "@/app/ui/purchase/table";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import RowsPerPage from "@/app/ui/rows-page";

import { Purchase } from "@/app/lib/definitions"; 
import { fetchPurchases } from "@/app/lib/data";
import ErrorPage from "../404/page";
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import Select from "@/app/ui/select";

export default function PurchasePage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const pathname = usePathname();
  const { replace } = useRouter();

  const currentPage = Number(searchParams.get("page")) || 1;
  const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 10;

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [totalPurchases, setTotalPurchases] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [purchaseStatus, setPurchaseStatus] = useState<string>("all");

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

  const handlePurchaseStatusSelect = (value: string) => {
    setPurchaseStatus(value);
    handleSearch(value);
  };

  // const filteredPurchases = sortBy === "all" 
  // ? purchases 
  // : purchases.filter(purchase => purchase.status === sortBy);
  // console.log("🚀 ~ PurchasePage ~ filteredPurchases:", filteredPurchases);


  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("No access token found");
          setLoading(false);
          return;
        }
        const skip = (currentPage - 1) * rowsPerPage;
        const data = await fetchPurchases(token, skip, rowsPerPage, query);
        // { total_import_bills, import_bills }
        setPurchases(data.import_bills);
        setTotalPurchases(data.total_import_bills);
      } catch (err: any) {
        setError(err.message || "Error fetching purchase data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [query, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(totalPurchases / rowsPerPage);

   if (error) {
     return <ErrorPage />;
   }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Danh sách phiếu nhập</h1>
        <CreatePurchaseButton />
      </div>
      <div className="bg-white p-6 rounded-2xl mt-6 border boder-[#DFDCE0] shadow-[0_2px_0_#D9D9D9]">
        <div className="flex items-center justify-between gap-2 mb-6">
          <Search placeholder="Tìm kiếm theo nhà cung cấp, chi nhánh, ghi chú..." />
        </div>

        <div className="relative inline-block mb-6">
          <Select
            options={[
              { value: "all", label: "Trạng thái nhập" },
              { value: "received_unpaid", label: "Đã nhập chưa thanh toán" },
              { value: "received_paid", label: "Đã nhập đã thanh toán" },
              { value: "pending", label: "Đang giao dịch" },
              { value: "canceled", label: "Đã huỷ" },
            ]}
            onSelect={handlePurchaseStatusSelect}
            defaultValue={purchaseStatus}
            btnClassName="!bg-[#6464963D] !text-black"
          />
        </div>

        {loading && <InvoicesTableSkeleton />}
        {/* {error && <div className="text-red-500">{error}</div>} */}

        {!loading && !error && <TablePurchase initialData={purchases} />}

        <div className="mt-5 flex w-full justify-between">
          <RowsPerPage defaultValue={rowsPerPage} />
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
