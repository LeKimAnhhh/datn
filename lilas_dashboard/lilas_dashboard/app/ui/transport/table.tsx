"use client";

import React, { useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import DetailTransport from "@/app/ui/transport/detail-transport";

import { DeliveryListResponse } from "@/app/lib/definitions";
import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from "@mui/icons-material";
import { SortOrder } from "antd/es/table/interface";
import StatusBadge from "../status";
import Image from 'next/image';
import NoData from "@/app/components/NoData";
import { Tooltip } from "react-tooltip";

interface TableTransportProps {
  data: DeliveryListResponse[];
}

export default function TableTransport({ data }: TableTransportProps) {
  const [selectedOrderCode, setSelectedOrderCode] = useState<string | null>(null);

  const customSortIcon = ({ sortOrder }: { sortOrder?: SortOrder }) =>
    sortOrder === "ascend" ? (
      <KeyboardArrowUpOutlined fontSize="small" />
    ) : sortOrder === "descend" ? (
      <KeyboardArrowDownOutlined fontSize="small" />
    ) : (
      <KeyboardArrowDownOutlined
        fontSize="small"
        className="text-[#3C3C43B2]"
      />
    );

  const columns: ColumnsType<DeliveryListResponse> = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: "4.12%",
      ellipsis: true,
    },
    {
      title: "Mã vận đơn",
      dataIndex: "order_code",
      key: "order_code",
      width: "16.5%",
      ellipsis: true,
    },
    {
      title: "Ngày tạo đơn",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      sortIcon: customSortIcon,
      render: (value: Date) => {
        return new Date(value).toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
      width: "16.7%",
      ellipsis: true,
    },
    {
      title: "Tên người nhận",
      dataIndex: "to_name",
      key: "to_name",
      width: "16.7%",
      ellipsis: true,
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <StatusBadge type="delivery_status" value={record.invoice?.status|| ""} />
      ),
      ellipsis: true,
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "payment_status",
      // sorter: (a, b) => a.payment_status.localeCompare(b.payment_status),
      render: (_, record) => (
        record.status === "cancel" ? null : <StatusBadge type="payment_status" value={record.payment_status} />),
      key: "payment_status",
      width: "16.7%",
      ellipsis: true,
    },
    {
      title: "Thu hộ COD",
      dataIndex: "cod_amount",
      key: "cod_amount",
      width: "16.7%",
      sorter: (a, b) => a.cod_amount - b.cod_amount,
      sortIcon: customSortIcon,
      render: (val: number) => val.toLocaleString("vi-VN"),
      ellipsis: true,
    },
  ];

  return (
    <div>
      <Table<DeliveryListResponse>
        columns={columns}
        dataSource={data.map((item) => ({
          ...item,
          key: item.order_code,
        }))}
        pagination={false}
        showSorterTooltip={false}
        locale={{
          emptyText: (
            // <div className="css-dev-only-do-not-override-142vneq ant-empty ant-empty-normal">
            //   <div className="flex flex-col justify-center items-center">
            //     <Image 
            //     src='/shopping_vol_1.svg'
            //     alt='Logo Shopping'
            //     width={180}
            //     height={148}
            //     />
            //   </div>
            //   <div className="text-[17px] leading-[22px] font-normal mt-[15px]">Hiện chưa có đơn hàng nào</div>
            // </div>
            <NoData message="Hiện chưa có đơn hàng nào" className="py-4"/>
          ),
        }}
        onRow={(record) => ({
          onClick: () => {
            setSelectedOrderCode(record.order_code);
          },
        })}
        rowClassName={(_, index) => (index % 2 === 0 ? "bg-white" : "bg-[#F8F6F8]")}
      />
      <Tooltip id="badge-tooltip" place="top-start" opacity={1.0} className='z-10'/>

      {selectedOrderCode && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          {/* <div className="bg-[#F2F2F7] rounded-3xl w-full 2xl:w-[80%] max-h-full 3xl:max-h-[90vh] overflow-auto scrollbar-hide"> */}
            <DetailTransport 
              orderCode={selectedOrderCode}
              onClose={() => setSelectedOrderCode(null)}
            />
          {/* </div> */}
        </div>
      )}
    </div>
  );
}