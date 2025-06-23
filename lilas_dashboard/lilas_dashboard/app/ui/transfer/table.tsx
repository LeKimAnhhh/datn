"use client";

import { Table as AntTable } from "antd";
import React, { useState } from "react";
import type { TableColumnsType, TableProps } from "antd";
import type { SortOrder, SorterResult } from "antd/es/table/interface";

import { TransactionTranferResponse } from "@/app/lib/definitions";
import PopupEditTransfer from "@/app/ui/transfer/edit-form";
import StatusBadge from "@/app/ui/status";

import {
  KeyboardArrowUpOutlined,
  KeyboardArrowDownOutlined,
} from "@mui/icons-material";
import NoData from "@/app/components/NoData";
import { Tooltip } from "react-tooltip";

interface TableTransferProps {
  initialData: TransactionTranferResponse[];
}

export default function TableTransfer({ initialData }: TableTransferProps) {
  const [transferList, setTransferList] = useState<TransactionTranferResponse[]>(initialData);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);

  const [sortedInfo, setSortedInfo] = useState<SorterResult<TransactionTranferResponse>>({});

  const handleTableChange: TableProps<TransactionTranferResponse>["onChange"] = (_, __, sorter) => {
    setSortedInfo(sorter as SorterResult<TransactionTranferResponse>);
  };

  const customSortIcon = ({ sortOrder }: { sortOrder?: SortOrder }) =>
    sortOrder === "ascend" ? (
      <KeyboardArrowUpOutlined fontSize="small" />
    ) : sortOrder === "descend" ? (
      <KeyboardArrowDownOutlined fontSize="small" />
    ) : (
      <KeyboardArrowDownOutlined fontSize="small" className="text-[#3C3C43B2]" />
    );
console.log("transferList", transferList);
  const columns: TableColumnsType<TransactionTranferResponse> = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: "7%",
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) =>
        new Date(date).toLocaleDateString("vi-VN") +
        " " +
        new Date(date).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }),
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      sortOrder:
        sortedInfo.columnKey === "created_at" ? sortedInfo.order : null,
      sortIcon: customSortIcon,
      width: "15%",
      ellipsis: true,
    },
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      width: "15%",
      ellipsis: true,
    },
    {
      title: "Chi nhánh chuyển",
      dataIndex: "from_warehouse",
      key: "from_warehouse",
      width: "15%",
      ellipsis: true,
    },
    {
      title: "Chi nhánh nhận",
      dataIndex: "to_warehouse",
      key: "to_warehouse",
      width: "15%",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (value) => <StatusBadge type="transfer_status" value={value} />,
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortOrder: sortedInfo.columnKey === "status" ? sortedInfo.order : null,
      sortIcon: customSortIcon,
      width: "15%",
      ellipsis: true,
    },
    {
      title: "Số lượng chuyển",
      dataIndex: "items",
      key: "items",
      render: (items: { quantity: number }[]) =>
        items
          .reduce(
            (acc: number, item: { quantity: number }) => acc + item.quantity,
            0
          )
          .toLocaleString("en-ES"),
      sorter: (a, b) => {
        const aTotal = a.items.reduce(
          (acc: number, item: { quantity: number }) => acc + item.quantity,
          0
        );
        const bTotal = b.items.reduce(
          (acc: number, item: { quantity: number }) => acc + item.quantity,
          0
        );
        return aTotal - bTotal;
      },
      sortOrder: sortedInfo.columnKey === "items" ? sortedInfo.order : null,
      sortIcon: customSortIcon,
      width: "15%",
      ellipsis: true,
    },
    {
      title: "Tổng giá trị chuyển",
      dataIndex: "items",
      key: "total_price",
      render: (items: { product?: {price_retail?: number}; quantity: number }[]) =>
        items
          .reduce(
            (acc: number, item: { product?: {price_retail?: number}; quantity: number }) =>
              acc + (item.product?.price_retail || 0) * item.quantity,
            0
          )
          .toLocaleString("en-ES"),
      sorter: (a, b) => {
        const aTotal = a.items.reduce(
          (acc: number, item: { product?: {price_retail?: number}; quantity: number }) =>
            acc + (item.product?.price_retail || 0) * item.quantity,
          0
        );
        const bTotal = b.items.reduce(
          (acc: number, item: { product?: {price_retail?: number}; quantity: number }) =>
            acc + (item.product?.price_retail || 0) * item.quantity,
          0
        );
        return aTotal - bTotal;
      },
      sortOrder: sortedInfo.columnKey === "total_price" ? sortedInfo.order : null,
      sortIcon: customSortIcon,
      ellipsis: true,
      width: "15%",
    },
  ];

  const handleRowClick = (record: TransactionTranferResponse) => {
    setSelectedTransferId(record.id.toString());
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedTransferId(null);
  };

  const handleSaved = (updated: TransactionTranferResponse) => {
    setTransferList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  return (
    <div>
      <AntTable<TransactionTranferResponse>
        columns={columns}
        dataSource={transferList.map((t) => ({ ...t, key: t.id }))}
        pagination={false}
        showSorterTooltip={false}
        locale={{
          emptyText: (
            <NoData message="Hiện chưa có phiếu chuyển nào" className="py-4" />
          ),
        }}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
      />

      <Tooltip id="badge-tooltip" place="top-start" opacity={1.0} className='z-[51]'/>

      {isEditOpen && selectedTransferId && (
        <PopupEditTransfer
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          transferId={selectedTransferId}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
