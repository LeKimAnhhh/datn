'use client';

import React, { useState } from "react";
import { Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import type { SortOrder } from "antd/es/table/interface";
import { Account } from '@/app/lib/definitions';
import PopupEditAccount from './edit-account';
import PopupChangePassword from './change-password';
import { KeyboardArrowUpOutlined, KeyboardArrowDownOutlined } from "@mui/icons-material";
import NoData from "@/app/components/NoData";

interface SorterResult<T> {
  columnKey?: string;
  order?: SortOrder;
  field?: keyof T;
  column?: unknown;
}

interface TableAccountProps {
  initialData: Account[];
}

const roleMapping: Record<number, string> = {
  1: "Quản lý",
  2: "Nhân viên bán hàng",
  4: "Nhân viên kho",
  3: "Cộng tác viên",
};

export default function TableAccount({ initialData }: TableAccountProps) {
  const [accounts, setAccounts] = useState<Account[]>(initialData);
  const [sortedInfo, setSortedInfo] = useState<SorterResult<Account> | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const handleChange: TableProps<Account>["onChange"] = (_, __, sorter) => {
    if (!Array.isArray(sorter)) {
      setSortedInfo(sorter as SorterResult<Account>);
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

  const handleRowClick = (record: Account) => {
    setSelectedAccountId(record.id);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedAccountId(null);
  };

  const handleOpenChangePassword = () => {
    setIsEditOpen(false);
    setIsChangePassOpen(true);
  };

  const handleCloseChangePassword = () => {
    setIsChangePassOpen(false);
  };

  const columns: TableColumnsType<Account> = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: "4.25%",
      ellipsis: true,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      // sortIcon: customSortIcon,
      // sorter: (a, b) => a.username.localeCompare(b.username),
      // sortOrder: sortedInfo?.columnKey === "username" ? sortedInfo?.order : null,
      width: "40.55%",
      ellipsis: true,
    },
    {
      title: "Chức vụ",
      dataIndex: "role",
      key: "role",
      // sortIcon: customSortIcon,
      // sorter: (a, b) => a.role - b.role,
      // sortOrder: sortedInfo?.columnKey === "role" ? sortedInfo?.order : null,
      render: (role) => roleMapping[role] || "-",
      width: "40.55%",
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      sortIcon: customSortIcon,
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      sortOrder: sortedInfo?.columnKey === "created_at" ? sortedInfo?.order : null,
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
      width: "14.627%",
      ellipsis: true,
    },
  ];

  return (
    <div className="">
      <Table<Account>
        columns={columns}
        dataSource={accounts.map((item) => ({
          ...item,
          key: item.id.toString(),
        }))}
        // rowClassName={(_, index) =>
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
            <NoData
              message="Hiện chưa có tài khoản bán hàng nào"
              className="py-4"
            />
          ),
        }}
      />

      {isEditOpen && selectedAccountId && (
        <PopupEditAccount
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          onOpenChangePassword={handleOpenChangePassword}
          accountId={selectedAccountId}
        />
      )}

      {isChangePassOpen && (
        <PopupChangePassword
          isOpen={isChangePassOpen}
          onClose={handleCloseChangePassword}
        />
      )}
    </div>
  );
}
