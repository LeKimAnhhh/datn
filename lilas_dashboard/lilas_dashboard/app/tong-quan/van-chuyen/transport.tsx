"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { DeliveryListResponse } from "@/app/lib/definitions";
import { fetchDeliveries, fetchTotalRevenueByDelivery } from "@/app/lib/data";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import TableTransport from "@/app/ui/transport/table";
import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import RowsPerPage from "@/app/ui/rows-page";
import ErrorPage from "../404/page";
import SelectButton from "@/app/ui/select-button";
import CreateTransportButton from "@/app/ui/transport/create-shop-btn";
import {
  ArrowOutward,
  AssignmentTurnedInOutlined,
  Block,
  ContentPasteSearch,
  InboxOutlined,
  MopedOutlined,
  MoveToInboxOutlined,
  PendingActions,
} from "@mui/icons-material";
import ArrowDropDownOutlined from '@mui/icons-material/ArrowDropDownOutlined';
import Select from "@/app/ui/select";
import { Tooltip } from "react-tooltip";

export default function Page() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  const pathname = usePathname();
  const { replace } = useRouter();

  const currentPage = Number(searchParams.get("page")) || 1;
  const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 10;

  const [deliveries, setDeliveries] = useState<DeliveryListResponse[]>([]);
  const [totalDeliveries, setTotalDeliveries] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [transportDay, setTransportDay] = useState(1);

  // Counters
  const [pickingCount, setPickingCount] = useState(0);
  const [deliveringCount, setDeliveringCount] = useState(0);
  const [returingCount, setReturingCount] = useState(0);
  const [returnedCount, setReturnedCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [cancelCount, setCancelCount] = useState(0);

  // Tổng doanh thu theo trạng thái
  const [pickingSum, setPickingSum] = useState(0);
  const [deliveringSum, setDeliveringSum] = useState(0);
  const [returingSum, setReturingSum] = useState(0);
  const [returnedSum, setReturnedSum] = useState(0);
  const [deliveredSum, setDeliveredSum] = useState(0);
  const [cancelSum, setCanceldSum] = useState(0);

  const [deliveryStatus, setDeliveryStatus] = useState<string>("all");

  const handleSearch = (term: string) => {
    if (term === 'all') return replace(`${pathname}`);
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

  const handleDeliveryStatusSelect = (value: string) => {
    setDeliveryStatus(value);
    handleSearch(value);
  };


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
        const data = await fetchDeliveries(
          token,
          (currentPage - 1) * rowsPerPage,
          rowsPerPage,
          query
        );
        console.log("Deliveries:", data);
        setDeliveries(data.deliveries);
        setTotalDeliveries(data.total_deliveries);
      } catch (err: any) {
        console.error("Error fetching deliveries:", err);
        setError(err.message || "Error fetching deliveries");
      } finally {
        setLoading(false);
      }
    }

    async function loadRevenueData() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const revenueData = await fetchTotalRevenueByDelivery(token, transportDay);
        console.log("Revenue Data:", revenueData);

        const revenue = revenueData.total_revenue_by_group;
        const orders = revenueData.total_od_by_group;

        setPickingSum(revenue.picking || 0);
        setDeliveringSum(revenue.delivering || 0);
        setDeliveredSum(revenue.delivered || 0);
        setReturingSum(revenue.returning || 0);
        setReturnedSum(revenue.returned || 0);
        setCanceldSum(revenue.cancel || 0);

        setPickingCount(orders.picking || 0);
        setDeliveringCount(orders.delivering || 0);
        setDeliveredCount(orders.delivered || 0);
        setReturingCount(orders.returning || 0);
        setReturnedCount(orders.returned || 0);
        setCancelCount(orders.cancel || 0);
      } catch (err: any) {
        console.error("Error fetching revenue data:", err);
        setError(err.message || "Error fetching revenue data");
      }
    }

    loadData();
    loadRevenueData();
  }, [rowsPerPage, currentPage, query, transportDay]);

  const totalPages = Math.ceil(totalDeliveries / rowsPerPage);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="w-full p-4">
      <div className="flex w-full items-center justify-between mb-4">
        <h1 className="text-2xl md:text-2xl font-semibold">Vận chuyển</h1>
        <CreateTransportButton />
      </div>

      {/* GIAO HÀNG */}
      <div className="bg-white p-4 mb-4 rounded-2xl border boder-[#DFDCE0] shadow-[0_2px_0_#D9D9D9]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg">Trạng thái giao hàng</h2>
          <SelectButton
            onSelect={setTransportDay}
            selectedDays={transportDay}
            btnClassName="!bg-[#6464963D] !text-black font-semibold"
          />
        </div>

        <div className="grid grid-cols-7 gap-4">
          <TransPortCard type="picking" count={pickingCount} sum={pickingSum} />

          <TransPortCard
            type="delivering"
            count={deliveringCount}
            sum={deliveringSum}
          />

          <TransPortCard
            type="returning"
            count={returingCount}
            sum={returingSum}
          />

          <TransPortCard
            type="returned"
            count={returnedCount}
            sum={returnedSum}
          />

          <TransPortCard
            type="delivered"
            count={deliveredCount}
            sum={deliveredSum}
          />

          <TransPortCard type="cancel" count={cancelCount} sum={cancelSum} />

          <div className="p-4 border rounded-lg flex flex-col gap-6 justify-between text-[12px] 3xl:text-[15px]">
            <div className="flex flex-col gap-3">
              <ContentPasteSearch className="text-[#3C3C43B2]" />
              <p className="font-semibold line-clamp-2">Trạng thái đối soát</p>
            </div>

            <button
              data-tooltip-id="kiemtradoisoat-tooltip"
              data-tooltip-content="Kiểm tra đối soát"
              className="bg-[#338BFF] text-white rounded-md p-2 flex flex-row gap-1 justify-center items-center h-8 3xl:h-10"
              onClick={() => window.open("https://khachhang.ghn.vn/", "_blank")}
            >
              <span className="line-clamp-1">Kiểm tra đối soát</span>
              <ArrowOutward className="h-4 ml-2" />
            </button>
            <Tooltip id="kiemtradoisoat-tooltip" place="top-start" className='z-10'/>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border boder-[#DFDCE0] shadow-[0_2px_0_#D9D9D9]">
        <h2 className="font-semibold mb-2">Danh sách vận đơn</h2>
        <div className="flex items-center justify-between gap-2 mb-6">
          <Search placeholder="Tìm kiếm theo mã đơn, tên, số điện thoại..." />
        </div>

        <div className="relative inline-block mb-6">
          <Select
            options={[
              { value: "all", label: "Trạng thái đơn hàng" },
              { value: "picking", label: "Chờ lấy hàng" },
              { value: "returning", label: "Hủy giao chờ nhận" },
              { value: "returned", label: "Hủy giao đã nhận" },
              { value: "delivering", label: "Đang vận chuyển" },
              { value: "delivered", label: "Giao hàng thành công" },
              { value: "cancel", label: "Huỷ đơn" },
            ]}
            onSelect={handleDeliveryStatusSelect}
            btnClassName="!bg-[#6464963D] !text-black"
            defaultValue={deliveryStatus}
          //placeholder='Trạng thái đơn hàng'
          />
        </div>

        {loading ? (
          <InvoicesTableSkeleton />
        ) : (
          <TableTransport data={deliveries} />
        )}
        <div className="mt-5 flex justify-between">
          <RowsPerPage defaultValue={rowsPerPage} />
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}

interface TransPortCardProps {
  type:
  | "picking"
  | "delivering"
  | "returning"
  | "returned"
  | "delivered"
  | "cancel";
  count: number;
  sum: number;
}

function TransPortCard({ type, count, sum }: TransPortCardProps) {
  const details = {
    picking: { title: "Chờ lấy hàng", Icon: PendingActions },
    delivering: { title: "Đang vận chuyển", Icon: MopedOutlined },
    returning: { title: "Hủy giao chờ nhận", Icon: InboxOutlined },
    returned: { title: "Hủy giao đã nhận", Icon: MoveToInboxOutlined },
    delivered: { title: "Giao hàng thành công", Icon: AssignmentTurnedInOutlined },
    cancel: { title: "Huỷ đơn", Icon: Block },
  };
  const { title, Icon } = details[type];

  return (
    <div className="p-4 border rounded-lg flex flex-col gap-6 justify-between text-[12px] 3xl:text-[15px]">
      <div className="flex flex-col gap-3">
        <Icon className="text-[#3C3C43B2]" />
        <p className="font-semibold line-clamp-2">{title}</p>
      </div>

      <div className="flex flex-col gap-3">
        <p
          data-tooltip-id="transport-card-tooltip"
          data-tooltip-content={sum.toLocaleString("en-ES")}
          className="text-blue-500 text-2xl font-bold line-clamp-1 break-all w-fit cursor-default"
        >
          {sum.toLocaleString("en-ES")}
        </p>
        <p className="font-semibold">{count} đơn</p>
      </div>
      <Tooltip id="transport-card-tooltip" place="top-start" className='z-10'/>
    </div>
  );
}
