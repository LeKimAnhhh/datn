"use client";

import { Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import React, { useState, useEffect } from "react";
import type { SortOrder, SorterResult } from "antd/es/table/interface";
import PopupEditInspection from "@/app/ui/inspection/edit-form";
import { KeyboardArrowUpOutlined, KeyboardArrowDownOutlined } from "@mui/icons-material";
import StatusBadge from "@/app/ui/status";
import { InspectionReport } from "@/app/lib/definitions";
import Image from 'next/image';
import NoData from "@/app/components/NoData";
import { Tooltip } from "react-tooltip";

interface TableInspectionProps {
  initialData: InspectionReport[];
}

export default function TableInspection({ initialData }: TableInspectionProps) {
  const [data, setData] = useState<InspectionReport[]>(initialData);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortedInfo, setSortedInfo] = useState<SorterResult<InspectionReport>>({});

  const handleTableChange: TableProps<InspectionReport>["onChange"] = (_, __, sorter) => {
    setSortedInfo(sorter as SorterResult<InspectionReport>);
  };

  const customSortIcon = ({ sortOrder }: { sortOrder?: SortOrder }) =>
    sortOrder === "ascend" ? (
      <KeyboardArrowUpOutlined fontSize="small" />
    ) : sortOrder === "descend" ? (
      <KeyboardArrowDownOutlined fontSize="small" />
    ) : (
      <KeyboardArrowDownOutlined fontSize="small" className="text-[#3C3C43B2]" />
    );

  useEffect(() => {
    console.log("Initial data loaded:", initialData);
  }, [initialData]);

  const columns: TableColumnsType<InspectionReport> = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: "4.12%",
      ellipsis: true,
    },
    {
      title: "Mã phiếu kiểm",
      dataIndex: "id",
      key: "id",
      width: "11.3%",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (value) => <StatusBadge type="inspection_status" value={value} />,
      // sorter: (a, b) => a.status.localeCompare(b.status),
      // sortOrder: sortedInfo.columnKey === "status" ? sortedInfo.order : null,
      // sortIcon: customSortIcon,
      width: "14.63%",
      ellipsis: true,

    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (date ? new Date(date).toLocaleDateString("vi-VN") : "-"),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      sortOrder: sortedInfo.columnKey === "created_at" ? sortedInfo.order : null,
      sortIcon: customSortIcon,
      width: "14.23%",
      ellipsis: true,
    },
    {
      title: "Nhân viên kiểm",
      dataIndex: ["user", "full_name"],
      key: "user_full_name",
      render: (_, record) => record.user?.full_name || "-",
      width: "16.95%",
      ellipsis: true,
    },
    {
      title: "Chi nhánh",
      dataIndex: "branch",
      key: "branch",
      render: (val) => val || "-",
      width: "11.97%",
      ellipsis: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (val) => val || "-",
      width: "26.8%",
      ellipsis: true,
    },
  ];

  const handleRowClick = (record: InspectionReport) => {
    setSelectedId(record.id);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setSelectedId(null);
    setIsEditOpen(false);
  };

  const handleSaved = (updated: InspectionReport) => {
    setData((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
  };

  return (
    <div>
      <Table<InspectionReport>
        columns={columns}
        dataSource={data.map((item) => ({ ...item, key: item.id }))}
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
            //   <div className="text-[17px] leading-[22px] font-normal mt-[15px]">Hiện chưa có phiếu kiểm nào</div>
            // </div>

            <NoData message="Hiện chưa có phiếu kiểm nào" className="py-4" />
          ),
        }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
        onChange={handleTableChange}
      />
      <Tooltip id="badge-tooltip" place="top-start" opacity={1.0} className='z-10'/>

      {isEditOpen && selectedId && (
        <PopupEditInspection
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          reportId={selectedId}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
