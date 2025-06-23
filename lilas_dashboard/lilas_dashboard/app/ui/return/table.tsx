"use client";

import { Table as AntTable } from "antd";
import React, { useState } from "react";
import type { TableColumnsType, TableProps } from "antd";
import type { SortOrder, SorterResult } from "antd/es/table/interface";

import { ReturnBill } from "@/app/lib/definitions";
import PopupEditReturn from "@/app/ui/return/edit-form";
import StatusBadge from "@/app/ui/status";

import {
  KeyboardArrowUpOutlined,
  KeyboardArrowDownOutlined,
} from "@mui/icons-material";
import NoData from "@/app/components/NoData";
import { Tooltip } from "react-tooltip";

interface TableReturnProps {
  initialData: ReturnBill[];
}

export default function TableReturn({ initialData }: TableReturnProps) {
  const [returnList, setReturnList] = useState<ReturnBill[]>(initialData);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);

  const [sortedInfo, setSortedInfo] = useState<SorterResult<ReturnBill>>({});

  const handleTableChange: TableProps<ReturnBill>["onChange"] = (_, __, sorter) => {
    setSortedInfo(sorter as SorterResult<ReturnBill>);
  };

  const customSortIcon = ({ sortOrder }: { sortOrder?: SortOrder }) =>
    sortOrder === "ascend" ? (
      <KeyboardArrowUpOutlined fontSize="small" />
    ) : sortOrder === "descend" ? (
      <KeyboardArrowDownOutlined fontSize="small" />
    ) : (
      <KeyboardArrowDownOutlined fontSize="small" className="text-[#3C3C43B2]" />
    );

  const columns: TableColumnsType<ReturnBill> = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: "5%",
      ellipsis: true,
    },
    {
      title: "Mã phiếu trả",
      dataIndex: "id",
      key: "id",
      width: "15%",
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
      sortOrder: sortedInfo.columnKey === "created_at" ? sortedInfo.order : null,
      sortIcon: customSortIcon,
      width: "20%",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (value) => <StatusBadge type="retunr_status" value={value} />,
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortOrder: sortedInfo.columnKey === "status" ? sortedInfo.order : null,
      sortIcon: customSortIcon,
      width: "15%",
      ellipsis: true,
    },
    {
      title: "Chi nhánh",
      dataIndex: "branch",
      key: "branch",
      width: "15%",
      ellipsis: true,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: ["supplier", "contact_name"],
      key: "supplier_name",
      render: (_, record) => record.supplier?.contact_name || "N/A",
      width: "15%",
      ellipsis: true,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_value",
      key: "total_value",
      render: (value) => value.toLocaleString("en-ES"),
      sorter: (a, b) => a.total_value - b.total_value,
      sortOrder: sortedInfo.columnKey === "total_value" ? sortedInfo.order : null,
      sortIcon: customSortIcon,
      width: "15%",
      ellipsis: true,
    },
  ];

  const handleRowClick = (record: ReturnBill) => {
    setSelectedReturnId(record.id);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedReturnId(null);
  };

  const handleSaved = (updated: ReturnBill) => {
    // Cập nhật list hiển thị
    setReturnList((prev) => prev.map((rb) => (rb.id === updated.id ? updated : rb)));
  };

  return (
    <div>
      <AntTable<ReturnBill>
        columns={columns}
        dataSource={returnList.map((rb) => ({ ...rb, key: rb.id }))}
        pagination={false}
        showSorterTooltip={false}
        locale={{
          emptyText: (
            // <div className="css-dev-only-do-not-override-142vneq ant-empty ant-empty-normal">
            //   <div className="ant-empty-image flex justify-center">
            //     <svg
            //       width="64"
            //       height="41"
            //       viewBox="0 0 64 41"
            //       xmlns="http://www.w3.org/2000/svg"
            //     >
            //       <title>No data</title>
            //       <g transform="translate(0 1)" fill="none" fillRule="evenodd">
            //         <ellipse fill="#f5f5f5" cx="32" cy="33" rx="32" ry="7"></ellipse>
            //         <g fillRule="nonzero" stroke="#d9d9d9">
            //           <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
            //           <path
            //             d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
            //             fill="#fafafa"
            //           ></path>
            //         </g>
            //       </g>
            //     </svg>
            //   </div>
            //   <div className="ant-empty-description">Không có dữ liệu</div>
            // </div>
            <NoData message="Hiện chưa có phiếu trả nào" className="py-4" />
          ),
        }}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
      />

      <Tooltip id="badge-tooltip" place="top-start" opacity={1.0} className='z-10'/>

      {isEditOpen && selectedReturnId && (
        <PopupEditReturn
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          returnId={selectedReturnId}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
