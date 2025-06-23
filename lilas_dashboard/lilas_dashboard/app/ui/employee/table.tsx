'use client';

import React, { useState } from "react";
import { Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import type { SortOrder } from "antd/es/table/interface";
import { Employee } from '@/app/lib/definitions';
import PopupEditEmployee from '@/app/ui/employee/edit-employee';
import { KeyboardArrowUpOutlined, KeyboardArrowDownOutlined } from "@mui/icons-material";
import NoData from "@/app/components/NoData";

interface SorterResult<T> {
  columnKey?: string;
  order?: SortOrder;
  field?: keyof T;
  column?: unknown;
}

interface TableEmployeeProps {
  initialData: Employee[];
}

// Định nghĩa role
const roleMapping: Record<number, string> = {
  1: "Quản lý",
  2: "Nhân viên",
  3: "Cộng tác viên",
};

export default function TableEmployee({ initialData }: TableEmployeeProps) {
  const [sortedInfo, setSortedInfo] = useState<SorterResult<Employee> | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleChange: TableProps<Employee>["onChange"] = (_, __, sorter) => {
    if (!Array.isArray(sorter)) {
      setSortedInfo(sorter as SorterResult<Employee>);
    }
  };

  const customSortIcon = ({ sortOrder }: { sortOrder?: SortOrder }) =>
    sortOrder === "ascend" ? (
      <KeyboardArrowUpOutlined fontSize="small"/>
    ) : sortOrder === "descend" ? (
      <KeyboardArrowDownOutlined fontSize="small"/>
    ) : (
      <KeyboardArrowDownOutlined fontSize="small" className="text-[#3C3C43B2]"/>
    );

  const handleRowClick = (record: Employee) => {
    setSelectedEmployeeId(record.id);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedEmployeeId(null);
  };

  const handleSaveEdit = (updatedData: Employee) => {
    console.log("Updated Employee Data:", updatedData);
    setIsEditOpen(false);
    setSelectedEmployeeId(null);
  };

  const columns: TableColumnsType<Employee> = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: "4.25%",
      ellipsis: true,
    },
    {
      title: "Tên nhân viên",
      dataIndex: "full_name",
      key: "full_name",
      // sortIcon: customSortIcon,
      // sorter: (a, b) => a.full_name.localeCompare(b.full_name),
      // sortOrder: sortedInfo?.columnKey === "full_name" ? sortedInfo?.order : null,
      width: "13.29%",
      ellipsis: true,
    },
    {
      title: "Chức vụ",
      dataIndex: "role",
      key: "role",
      // sortIcon: customSortIcon,
      // sorter: (a, b) => a.role - b.role,
      sortOrder: sortedInfo?.columnKey === "role" ? sortedInfo?.order : null,
      render: (role) => roleMapping[role] || "-",
      width: "11.43%",
      ellipsis: true,
    },
    {
      title: "Ca làm",
      dataIndex: "shift_work",
      key: "shift_work",
      // sortIcon: customSortIcon,
      // sorter: (a, b) => (a.shift_work ?? "").localeCompare(b.shift_work ?? ""),
      sortOrder: sortedInfo?.columnKey === "shift_work" ? sortedInfo?.order : null,
      render: (shift) => shift ?? "-",
      width: "7.97%",
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      // sortIcon: customSortIcon,
      // sorter: (a, b) => (a.email ?? "").localeCompare(b.email ?? ""),
      sortOrder: sortedInfo?.columnKey === "email" ? sortedInfo?.order : null,
      render: (email) => email ?? "-",
      width: "11.43%",
      ellipsis: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
      // sortIcon: customSortIcon,
      // sorter: (a, b) => a.phone_number.localeCompare(b.phone_number),
      sortOrder: sortedInfo?.columnKey === "phone_number" ? sortedInfo?.order : null,
      render: (phone) => phone || "-",
      width: "10.9%",
      ellipsis: true,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      // sortIcon: customSortIcon,
      // sorter: (a, b) => (a.address ?? "").localeCompare(b.address ?? ""),
      sortOrder: sortedInfo?.columnKey === "address" ? sortedInfo?.order : null,
      render: (address) => address ?? "-",
      width: "12.63%",
      ellipsis: true,
    },
    {
      title: "Tổng đơn",
      dataIndex: "total_orders",
      key: "total_orders",
      // sortIcon: customSortIcon,
      // sorter: (a, b) => (a.total_orders ?? 0) - (b.total_orders ?? 0),
      sortOrder: sortedInfo?.columnKey === "total_orders" ? sortedInfo?.order : null,
      render: (orders) => orders ?? "-",
      width: "8.11%",
      ellipsis: true,
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "total_revenue",
      key: "total_revenue",
      // sortIcon: customSortIcon,
      // sorter: (a, b) => (a.total_revenue ?? 0) - (b.total_revenue ?? 0),
      sortOrder: sortedInfo?.columnKey === "total_revenue" ? sortedInfo?.order : null,
      render: (revenue) =>
        revenue ? `${revenue.toLocaleString("en-US")}` : "0",
      width: "10.63%",
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      sortIcon: customSortIcon,
      // sorter: (a, b) =>
      //   new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      // sortOrder: sortedInfo?.columnKey === "created_at" ? sortedInfo?.order : null,
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
      width: "9.3%",
      ellipsis: true,
    },
  ];
  
  
  return (
    <div className="">
      <div className="md:pt-0">
        <Table<Employee>
          columns={columns}
          dataSource={initialData.map((item) => ({
            ...item,
            key: item.id,
          }))}
          // rowClassName={(record, index) =>
          //   index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F8F6F8]"
          // }
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: "pointer" },
          })}
          onChange={handleChange}
          pagination={false}
          showSorterTooltip={false}
          locale={{
            emptyText: (
              <NoData message="Hiện chưa có nhân viên nào" className="py-4" />
            ),
          }}
        />
      </div>

      {/* Popup Edit */}
      {isEditOpen && selectedEmployeeId && (
        <PopupEditEmployee
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
          employeeId={selectedEmployeeId}
        />
      )}
    </div>
  );
}