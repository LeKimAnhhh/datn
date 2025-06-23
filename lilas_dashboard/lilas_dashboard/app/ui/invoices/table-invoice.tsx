'use client';
import React, { useState } from 'react';
import { Table } from 'antd';
import type { TableColumnsType, TableProps } from "antd";
import type { SortOrder } from "antd/es/table/interface";
import { Invoice } from "@/app/lib/definitions";
import StatusBadge from '@/app/ui/status';
import InvoiceDetailPopup from '@/app/ui/invoices/InvoiceDetailPopup';
import { KeyboardArrowUpOutlined, KeyboardArrowDownOutlined } from "@mui/icons-material";
import Image from 'next/image';
import NoData from '@/app/components/NoData';
import { Tooltip } from 'react-tooltip';

interface Props {
  data: Invoice[];
}

interface SorterResult<T> {
  columnKey?: string;
  order?: SortOrder;
  field?: keyof T;
  column?: unknown;
}

export default function TableCMS({ data }: Props) {
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [sortedInfo, setSortedInfo] = useState<SorterResult<Invoice> | null>(null);

  const handleChange: TableProps<Invoice>["onChange"] = (_, __, sorter) => {
    if (!Array.isArray(sorter)) {
      setSortedInfo(sorter as SorterResult<Invoice>);
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

  const columns: TableColumnsType<Invoice> = [
    {
      title: 'STT',
      key: 'stt',
      render: (_, __, index) => index + 1,
      width: "5.89%",
      ellipsis: true,
    },
    // {
    //   title: 'Mã đơn hàng',
    //   dataIndex: 'id',
    //   key: 'id',
    //   width: "12.68%",
    //   ellipsis: true,
    // },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      width: "12.68%",
      ellipsis: true,
      render: (text, record) => {
        const hasExtraCost = record.extraCost != null && record.extraCost > 0;
        const itemHasDiscount = record.discount > 0 || record.items.some(item => item.discount > 0);

        let labelSrc = null;
        if (hasExtraCost) {
          labelSrc = '/Label_2.svg';
        } else if (itemHasDiscount) {
          labelSrc = '/Label.svg';
        }

        return (
          <div 
            className='flex items-center gap-2 w-[80%]'
            // style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '80%' }}
            >
            <span>{text}</span>
            {labelSrc && (
              <Image
                src={labelSrc}
                alt='label'
                width={24}
                height={24}
                //unoptimized
              />
            )}
          </div>
        );
      },
    },
    {
      title: 'Ngày tạo đơn',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      sortOrder: sortedInfo?.columnKey === 'created_at' ? sortedInfo?.order : null,
      width: "12.68%",
      ellipsis: true,
      sortIcon: customSortIcon,
      render: (date) => `${new Date(date).toLocaleDateString('vi-VN')}, ${new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}`
    },
    {
      title: 'Chi nhánh',
      key: 'branch',
      render: (_, record) => record.branch || '-',
      // sorter: (a, b) => (a.branch || '').localeCompare(b.branch || ''),
      // sortOrder: sortedInfo?.columnKey === 'branch' ? sortedInfo?.order : null,
      width: "12.68%",
      ellipsis: true,
      // sortIcon: customSortIcon,
    },
    {
      title: 'Tên khách hàng',
      key: 'customer_name',
      // render: (_, record) => record.customer?.full_name || '-',
      render: (_, record) => record.customer?.id === 'KH1' ? "-" : record.customer?.full_name || '-',
      // sorter: (a, b) => (a.customer?.full_name || '').localeCompare(b.customer?.full_name || ''),
      // sortOrder: sortedInfo?.columnKey === 'customer_name' ? sortedInfo?.order : null,
      width: "12.68%",
      ellipsis: true,
      // sortIcon: customSortIcon,
    },
    {
      title: 'Trạng thái đơn',
      key: 'status',
      render: (_, record) => <StatusBadge type="invoice_status" value={record.status} />,
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortOrder: sortedInfo?.columnKey === 'status' ? sortedInfo?.order : null,
      width: "12.68%",
      ellipsis: true,
      sortIcon: customSortIcon,
    },
    {
      title: 'Trạng thái thanh toán',
      key: 'payment_status',
      render: (_, record) =>
        record.status === "cancel" ? null : <StatusBadge type="payment_status" value={record.payment_status} />,
      sorter: (a, b) => a.payment_status.localeCompare(b.payment_status),
      sortOrder: sortedInfo?.columnKey === 'payment_status' ? sortedInfo?.order : null,
      width: "12.68%",
      ellipsis: true,
      sortIcon: customSortIcon,
    },
    {
      title: 'Tổng hóa đơn',
      dataIndex: 'total_value',
      key: 'total_value',
      sorter: (a, b) => a.total_value - b.total_value,
      sortOrder: sortedInfo?.columnKey === 'total_value' ? sortedInfo?.order : null,
      width: "12.68%",
      ellipsis: true,
      sortIcon: customSortIcon,
      render: (total_value) => total_value?.toLocaleString("en-ES") || "-",
    },
  ];


  const rowClassName = (record: Invoice, index: number) => {
    //"bg-[#B2E5EE]" service_items
    const hasService = record.service_items?.length > 0;
    // "bg-[#EDE69B]" discount > 0
    const itemHasDiscount = record.discount > 0 ||
      record.items.some(i => i.discount > 0);

    if (itemHasDiscount && hasService) return 'bg-white';
    if (hasService) return 'bg-white';
    if (itemHasDiscount) return 'bg-white';
    return "bg-white";
  };

  return (
    <div className="">
      <Table<Invoice>
        columns={columns}
        dataSource={data.map((inv) => ({ ...inv, key: inv.id }))}
        rowClassName={rowClassName}
        onChange={handleChange}
        pagination={false}
        showSorterTooltip={false}
        locale={{
          emptyText: (
            <div className="css-dev-only-do-not-override-142vneq ant-empty ant-empty-normal">
              <NoData message="Hiện chưa có đơn hàng nào" className="py-4"/>
            </div>
          ),
        }}        
        onRow={(record) => ({
          onClick: () => {
            setSelectedInvoiceId(record.id);
            setIsOpenDetail(true);
          },
        })}
      />
      <Tooltip id="badge-tooltip" place="top-start" opacity={1.0} className='z-10'/>
      {isOpenDetail && selectedInvoiceId && (
        <InvoiceDetailPopup
          isOpen={isOpenDetail}
          onClose={() => setIsOpenDetail(false)}
          invoiceId={selectedInvoiceId}
        />
      )}
    </div>
  );
}
