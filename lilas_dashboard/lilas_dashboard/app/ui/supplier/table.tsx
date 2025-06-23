"use client";

import React, { useState } from "react";
import { Table as AntTable } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import type { SortOrder } from "antd/es/table/interface";
import { KeyboardArrowUpOutlined, KeyboardArrowDownOutlined } from "@mui/icons-material";
import { Supplier } from "@/app/lib/definitions";
import PopupEditSupplier from "./edit-form";
import Image from 'next/image';
import NoData from "@/app/components/NoData";

interface SorterResult<T> {
  columnKey?: string;
  order?: SortOrder;
  field?: keyof T;
  column?: unknown;
}

interface TableSupplierProps {
  initialData: Supplier[];
}

export default function TableSupplier({ initialData }: TableSupplierProps) {
  const [sortedInfo, setSortedInfo] = useState<SorterResult<Supplier> | null>(
    null
  );
  const [supplierList, setSupplierList] = useState<Supplier[]>(initialData);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );

  const handleChange: TableProps<Supplier>["onChange"] = (_, __, sorter) => {
    if (!Array.isArray(sorter)) {
      setSortedInfo(sorter as SorterResult<Supplier>);
    }
  };

  const customSortIcon = ({ sortOrder }: { sortOrder?: SortOrder }) =>
    sortOrder === "ascend" ? (
      <KeyboardArrowUpOutlined fontSize="small" />
    ) : sortOrder === "descend" ? (
      <KeyboardArrowDownOutlined fontSize="small" />
    ) : (
      <KeyboardArrowDownOutlined fontSize="small" className="text-[#3C3C43B2]" />
    );

  const columns: TableColumnsType<Supplier> = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: "4.12%",
      ellipsis: true,
    },
    {
      title: "Tên nhà cung cấp",
      dataIndex: "contact_name",
      key: "contact_name",
      width: "19.95%",
      ellipsis: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: "11.3%",
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "16.44%",
      ellipsis: true,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: "16.44%",
      ellipsis: true,
    },
    {
      title: "Công nợ",
      dataIndex: "debt",
      key: "debt",
      width: "16.44%",
      ellipsis: true,
      sorter: (a, b) => a.debt - b.debt,
      sortIcon: customSortIcon,
      sortOrder: sortedInfo?.columnKey === "debt" ? sortedInfo?.order : null,
      render: (debt) =>
        debt != null ? `${debt.toLocaleString("en-US")}` : "0",
    },
    {
      title: "Hoạt động lần cuối",
      dataIndex: "updated_at",
      key: "updated_at",
      width: "15.3%",
      ellipsis: true,
      sortIcon: customSortIcon,
      sorter: (a, b) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
      sortOrder: sortedInfo?.columnKey === "updated_at" ? sortedInfo?.order : null,
      render: (date) => `${new Date(date).toLocaleDateString('vi-VN')}, ${new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}`,
    },
  ];

  const handleRowClick = (record: Supplier) => {
    setSelectedSupplierId(record.id);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedSupplierId(null);
    window.location.reload();
  };

  const handleSave = (updated: Supplier) => {
    setSupplierList((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  return (
    <div className="">
      <AntTable<Supplier>
        columns={columns}
        dataSource={supplierList.map((item) => ({
          ...item,
          key: item.id,
        }))}
        onChange={handleChange}
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
            //   <div className="text-[17px] leading-[22px] font-normal mt-[15px]">Hiện chưa có nhà cung cấp nào</div>
            // </div>
            <NoData message="Hiện chưa có nhà cung cấp nào" className="py-4"/>
          ),
        }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
      />

      {isEditOpen && selectedSupplierId && (
        <PopupEditSupplier
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          onSaved={handleSave}
          supplierId={selectedSupplierId}
        />
      )}
    </div>
  );
}
