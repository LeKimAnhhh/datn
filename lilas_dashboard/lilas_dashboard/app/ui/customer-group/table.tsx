'use client';

import React, { useState } from 'react';
import { Table as AntTable } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import { CustomerGroup } from '@/app/lib/definitions';
import PopupEditCustomerGroup from './edit-customer-group';
import { KeyboardArrowUpOutlined, KeyboardArrowDownOutlined } from "@mui/icons-material";
import NoData from '@/app/components/NoData';

interface SorterResult<T> {
  columnKey?: string;
  order?: SortOrder;
  field?: keyof T;
  column?: unknown;
}

interface TableCustomerGroupProps {
  initialData: CustomerGroup[];
}

export default function TableCustomerGroup({ initialData }: TableCustomerGroupProps) {
  const [sortedInfo, setSortedInfo] = useState<SorterResult<CustomerGroup> | null>(null);
  const [groups, setGroups] = useState<CustomerGroup[]>(initialData);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleChange: TableProps<CustomerGroup>['onChange'] = (_, __, sorter) => {
    if (!Array.isArray(sorter)) {
      setSortedInfo(sorter as SorterResult<CustomerGroup>);
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

    const columns: TableColumnsType<CustomerGroup> = [
      {
        title: "STT",
        key: "stt",
        render: (_, __, index) => index + 1,
        width: "4.12%",
        ellipsis: true,
      },
      {
        title: "Tên nhóm",
        dataIndex: "name",
        key: "name",
        // sortIcon: customSortIcon,
        // sorter: (a, b) => a.name.localeCompare(b.name),
        // sortOrder: sortedInfo?.columnKey === "name" ? sortedInfo?.order : null,
        width: "15.98%",
        ellipsis: true,
      },
      {
        title: "Chiết khấu",
        dataIndex: "discount",
        key: "discount",
        sortIcon: customSortIcon,
        sorter: (a, b) => a.discount - b.discount,
        render: (discount, record) => {
          if (record.discount_type === "percent") {
            return `${discount}%`;
          } else {
            return `${discount.toLocaleString("en-US")} VNĐ`;
          }
        },
        width: "15.98%",
        ellipsis: true,
      },
      {
        title: "Số lượng khách hàng",
        dataIndex: "total_customers",
        key: "total_customers",
        sortIcon: customSortIcon,
        sorter: (a, b) => a.total_customers - b.total_customers,
        render: (val) => val?.toLocaleString() || "0",
        width: "15.98%",
        ellipsis: true,
      },
      {
        title: "Tổng chi tiêu",
        dataIndex: "total_spending",
        key: "total_spending",
        sortIcon: customSortIcon,
        sorter: (a, b) => a.total_spending - b.total_spending,
        render: (val) => `${val?.toLocaleString() || "0"}`,
        width: "15.98%",
        ellipsis: true,
      },
      {
        title: "Tổng SL đơn hàng",
        dataIndex: "total_order",
        key: "total_order",
        sortIcon: customSortIcon,
        sorter: (a, b) => a.total_order - b.total_order,
        render: (val) => val?.toLocaleString() || "0",
        width: "15.98%",
        ellipsis: true,
      },
      {
        title: "Ngày tạo",
        dataIndex: "created_at",
        key: "created_at",
        sortIcon: customSortIcon,
        sorter: (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        render: (date) => (date ? new Date(date).toLocaleDateString("vi-VN") : "-"),
        width: "15.98%",
        ellipsis: true,
      },
    ];
    

  const handleRowClick = (record: CustomerGroup) => {
    setSelectedGroupId(record.id);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedGroupId(null);
  };

  const handleSaved = (updated: CustomerGroup) => {
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  return (
    <div className="">
      <AntTable<CustomerGroup>
        columns={columns}
        dataSource={groups.map((item) => ({
          ...item,
          key: item.id,
        }))}
        // rowClassName={(_, index) =>
        //   index % 2 === 0 ? 'bg-white' : 'bg-[#F8F6F8]'
        // }
        onChange={handleChange}
        pagination={false}
        showSorterTooltip={false}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' },
        })}
        locale={{
          emptyText: (
            <NoData message="Hiện chưa có nhóm khách hàng nào" className='py-4' />
          ),
        }}
      />

      {isEditOpen && selectedGroupId && (
        <PopupEditCustomerGroup
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          groupId={selectedGroupId}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
