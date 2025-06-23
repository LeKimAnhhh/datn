'use client';

import React, { useState } from 'react';
import { Table as AntTable } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import { Customer } from '@/app/lib/definitions';
import PopupEditCustomer from './edit-customer';
import { KeyboardArrowUpOutlined, KeyboardArrowDownOutlined } from "@mui/icons-material";
import NoData from '@/app/components/NoData';

interface SorterResult<T> {
  columnKey?: string;
  order?: SortOrder;
  field?: keyof T;
  column?: unknown;
}

interface TableCustomerProps {
  initialData: Customer[];
}

export default function TableCustomer({ initialData }: TableCustomerProps) {
  const [sortedInfo, setSortedInfo] = useState<SorterResult<Customer> | null>(null);
  const [customers, setCustomers] = useState<Customer[]>(initialData);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const handleChange: TableProps<Customer>['onChange'] = (_, __, sorter) => {
    if (!Array.isArray(sorter)) {
      setSortedInfo(sorter as SorterResult<Customer>);
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

  const columns: TableColumnsType<Customer> = [
    {
      title: 'STT',
      key: 'stt',
      render: (_, __, index) => index + 1,
      width: "4.12%",
      ellipsis: true,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'full_name',
      key: 'full_name',
      sortIcon: customSortIcon,
      // sorter: (a, b) => a.full_name.localeCompare(b.full_name),
      // sortOrder: sortedInfo?.columnKey === 'full_name' ? sortedInfo?.order : null,
      width: "15.97%",
      ellipsis: true,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      // sortIcon: customSortIcon,
      // sorter: (a, b) => (a.phone || '').localeCompare(b.phone || ''),
      // sortOrder: sortedInfo?.columnKey === 'phone' ? sortedInfo?.order : null,
      width: "15.97%",
      ellipsis: true,
    },
    {
      title: 'Nhóm khách hàng',
      dataIndex: 'group_name',
      key: 'group_name',
      sortIcon: customSortIcon,
      sorter: (a, b) => (a.group_name || '').localeCompare(b.group_name || ''),
      sortOrder: sortedInfo?.columnKey === 'group_name' ? sortedInfo?.order : null,
      render: (_, record) => record.group?.name || record.group_name || '-',
      width: "15.97%",
      ellipsis: true,
    },
    {
      title: 'Công nợ hiện tại',
      dataIndex: 'debt',
      key: 'debt',
      sortIcon: customSortIcon,
      sorter: (a, b) => a.debt - b.debt,
      sortOrder: sortedInfo?.columnKey === 'debt' ? sortedInfo?.order : null,
      render: (debt) => (debt != null ? `${debt.toLocaleString("en-US")}` : '0'),
      width: "15.97%",
      ellipsis: true,
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'total_spending',
      key: 'total_spending',
      sortIcon: customSortIcon,
      sorter: (a, b) => a.total_spending - b.total_spending,
      sortOrder: sortedInfo?.columnKey === 'total_spending' ? sortedInfo?.order : null,
      render: (spent) => `${spent.toLocaleString("en-US")}`,
      width: "15.97%",
      ellipsis: true,
    },
    {
      title: 'Tổng số lượng đơn hàng',
      dataIndex: 'total_order',
      key: 'total_order',
      sortIcon: customSortIcon,
      sorter: (a, b) => a.total_order - b.total_order,
      sortOrder: sortedInfo?.columnKey === 'total_order' ? sortedInfo?.order : null,
      width: "15.97%",
      ellipsis: true,
    },
  ];
  

  const handleRowClick = (record: Customer) => {
    setSelectedCustomerId(record.id);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedCustomerId(null);
    // window.location.reload();
  };

  const handleSave = (updated: Customer) => {
    // Cập nhật list
    setCustomers((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  return (
    <div className="">
      <AntTable<Customer>
        columns={columns}
        // dataSource={customers.map((item) => ({
        //   ...item,
        //   key: item.id,
        // }))}
        dataSource={
          customers.length > 0
            ? customers.map((item) => ({
                ...item,
                key: item.id,
              }))
            : []
        }
        // rowClassName={(_, index) =>
        //   index % 2 === 0 ? 'bg-white' : 'bg-[#F8F6F8]'
        // }
        onChange={handleChange}
        pagination={false}
        showSorterTooltip={false}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
        locale={{
          emptyText: (
            <NoData
              message="Hiện chưa có khách hàng nào"
              className="py-4"
            />
          ),
        }}
      />

      {isEditOpen && selectedCustomerId && (
        <PopupEditCustomer
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          onSaved={handleSave}
          customerId={selectedCustomerId}
        />
      )}
    </div>
  );
}
