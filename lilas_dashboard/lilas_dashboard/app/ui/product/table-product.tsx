'use client';

import React, { useState, useEffect } from "react";
import { Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import type { SortOrder } from "antd/es/table/interface";
import Image from 'next/image';
import { Product, ProductResponse } from '@/app/lib/definitions';
import { fetchProductDetail, deleteProductAPI } from "@/app/lib/data";
import DetailProductPopup from "@/app/ui/product/detail-product";
import { getApiUrl } from '@/app/lib/utils';
import { Tooltip } from "react-tooltip";
import { 
  KeyboardArrowUpOutlined, 
  KeyboardArrowDownOutlined, 
  CheckCircleOutlined, 
  ReportGmailerrorred, 
  CloseOutlined } from "@mui/icons-material";
import NoData from "@/app/components/NoData";

interface SorterResult<T> {
  columnKey?: string;
  order?: SortOrder;
  field?: keyof T;
  column?: unknown;
}

interface TableProductProps {
  data: Product[];
  userRole?: string;
}

const TableProduct: React.FC<TableProductProps> = ({ data, userRole }) => {
  const [sortedInfo, setSortedInfo] = useState<SorterResult<Product> | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  
  const handleRowClick = async (record: Product) => {
    try {
      const token = localStorage.getItem("access_token") || "";
      const detail = await fetchProductDetail(token, record.id);
      setSelectedProduct(detail);
      setIsPopupOpen(true);
    } catch (error: any) {
      setMessage(error.message || "Lỗi khi tải thông tin sản phẩm");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  const customSortIcon = ({ sortOrder }: { sortOrder?: SortOrder }) =>
    sortOrder === "ascend" ? (
      <KeyboardArrowUpOutlined fontSize="small" />
    ) : sortOrder === "descend" ? (
      <KeyboardArrowDownOutlined fontSize="small"/>
    ) : (
      <KeyboardArrowDownOutlined fontSize="small" className="text-[#3C3C43B2]"/>
    );

  const handleChange: TableProps<Product>["onChange"] = (_, __, sorter) => {
    if (!Array.isArray(sorter)) {
      setSortedInfo(sorter as SorterResult<Product>);
    }
  };

  const columns: TableColumnsType<Product> = [
    {
      title: <div className="truncate w-full text-center" title="STT">STT</div>,
      key: "stt",
      render: (_, __, index) => {
        return <div className="text-center">{index + 1}</div>;
      },
      width: "4.25%",
      ellipsis: true,
    },
    {
      title: <div className="truncate w-full text-center" title="Ảnh">Ảnh</div>,
      dataIndex: "images",
      key: "images",
      render: (images) => {
        const imageSrc =
          images && images.length > 0
            ? getApiUrl(images[0].url.slice(1))
            : "/customers/amy-burns.png";
        return (
          <div className="h-8 flex items-center justify-center relative group z-[5]">
            <Image
              src={imageSrc}
              alt="product image"
              width={256}
              height={256}
              //unoptimized
              className="object-cover w-8 h-8 rounded-md transition-all duration-300 transform group-hover:scale-[5] group-hover:translate-x-[100px]"
            />
          </div>
        );
      },
      width: "4.12%",
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      // ellipsis: true,
      width: "21.54%",
      render: (text) => (
        <div
          data-tooltip-id="product-tooltip" 
          data-tooltip-content={text}
          className="product-cell"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {text}
        </div>
      ),
    },    

    {
      title: "Loại",
      dataIndex: "group_name",
      key: "group_name",
      // ellipsis: true,
      width: "8%",
      render: (group_name) => (
        <div
          data-tooltip-id="product-tooltip" 
          data-tooltip-content={group_name || "-"}
          className="product-cell"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {group_name || "-"}
        </div>
      ),
    },
    {
      title: "Nhãn hiệu",
      dataIndex: "brand",
      key: "brand",
      // ellipsis: true,
      width: "7.9%",
      render: (brand) => (
        <div
          data-tooltip-id="product-tooltip"
          data-tooltip-content={brand || "-"}
          className="product-cell"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {brand || "-"}
        </div>
      ),
    },
    {
      title: "Có thể bán",
      dataIndex: "can_sell",
      ellipsis: true,
      key: "can_sell",
      sorter: (a, b) => 
        ((a.terra_can_sell ?? 0) + (a.thonhuom_can_sell ?? 0)) - 
        ((b.terra_can_sell ?? 0) + (b.thonhuom_can_sell ?? 0)),
      sortOrder: sortedInfo?.columnKey === "can_sell" ? sortedInfo?.order : null,
      width: "8.77%",
      sortIcon: customSortIcon,
      render: (_, record) => (record.terra_can_sell ?? 0) + (record.thonhuom_can_sell ?? 0)
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      ellipsis: true,
      key: "stock",
      sorter: (a, b) =>
        ((a.terra_stock ?? 0) + (a.thonhuom_stock ?? 0)) - 
        ((b.terra_stock ?? 0) + (b.thonhuom_stock ?? 0)),
      sortOrder: sortedInfo?.columnKey === "stock" ? sortedInfo?.order : null,
      width: "8.77%",
      sortIcon: customSortIcon,
      render: (_, record) => (record.terra_stock ?? 0) + (record.thonhuom_stock ?? 0)
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expiration_date",
      key: "expiration_date",
      sorter: (a, b) =>
        new Date(a.expiration_date || "").getTime() -
        new Date(b.expiration_date || "").getTime(),
      sortOrder: sortedInfo?.columnKey === "expiration_date" ? sortedInfo?.order : null,
      render: (exp) => {
        if (!exp) return "-";
        const date = new Date(exp);
        const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(
          date.getMonth() + 1
        ).padStart(2, "0")}/${String(date.getFullYear()).slice(-2)}`;
        return formattedDate;
      },
      width: "10.24%",
      sortIcon: customSortIcon,
      ellipsis: true,
    },
    {
      title: "Giá bán",
      dataIndex: "price_retail",
      key: "price_retail",
      sorter: (a, b) => a.price_retail - b.price_retail,
      sortOrder: sortedInfo?.columnKey === "price_retail" ? sortedInfo?.order : null,
      render: (price) => price?.toLocaleString("en-ES") || "-",
      width: "8.77%",
      sortIcon: customSortIcon,
      ellipsis: true,
    },
    // {
    //   title: "Giá nhập",
    //   dataIndex: "price_import",
    //   key: "price_import",
    //   sorter: (a, b) => a.price_import - b.price_import,
    //   sortOrder: sortedInfo?.columnKey === "price_import" ? sortedInfo?.order : null,
    //   render: (price) => price?.toLocaleString("en-ES") || "-",
    //   width: "8.77%",
    //   sortIcon: customSortIcon,
    //   ellipsis: true,
    // },
    // {
    //   title: "Giá buôn",
    //   dataIndex: "price_wholesale",
    //   key: "price_wholesale",
    //   sorter: (a, b) => a.price_wholesale - b.price_wholesale,
    //   sortOrder: sortedInfo?.columnKey === "price_wholesale" ? sortedInfo?.order : null,
    //   render: (price) => price?.toLocaleString("en-ES") || "-",
    //   width: "8.77%",
    //   sortIcon: customSortIcon,
    //   ellipsis: true,
    // },
  ];

  const tableData = data.map((item) => ({
    ...item,
    key: item.id.toString(),
  }));

  return (
    <div className="">
      {message && (
        <div
          className={`toast-message ${
            messageType === "success"
              ? "success"
              : messageType === "error"
              ? "error"
              : ""
          }`}
        >
          {messageType === "success" ? (
            <CheckCircleOutlined style={{ color: "#1A73E8", fontSize: 20 }} />
          ) : (
            <ReportGmailerrorred style={{ color: "#D93025", fontSize: 20 }} />
          )}
          <span>{message}</span>
          <CloseOutlined
            className="close-btn"
            style={{ fontSize: 16, cursor: "pointer", color: "#5F6368" }}
            onClick={() => setMessage("")}
          />
        </div>
      )}

      <Table<Product>
        columns={columns}
        dataSource={tableData}
        rowClassName={() => `hover:cursor-pointer`}
        onChange={handleChange}
        tableLayout="fixed"
        pagination={false}
        showSorterTooltip={false}
        locale={{
          emptyText: (
            <NoData message="Hiện chưa có sản phẩm nào" className="py-4"/>
          ),
        }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
      />
      <Tooltip id="product-tooltip" place="top-start"/>

      {selectedProduct && (
        <DetailProductPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          product={selectedProduct}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default TableProduct;

