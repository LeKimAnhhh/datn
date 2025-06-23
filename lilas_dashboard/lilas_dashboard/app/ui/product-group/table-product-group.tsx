"use client";

import React, { useState } from "react";
import { Table } from "antd";
import type { TableColumnsType } from "antd";
import type { SortOrder } from "antd/es/table/interface";
import { ProductGroupResponse } from "@/app/lib/definitions";
import DetailProductGroupPopup from "@/app/ui/product-group/detail-product-group";
import { KeyboardArrowUpOutlined, KeyboardArrowDownOutlined } from "@mui/icons-material";
import Image from 'next/image';
import NoData from "@/app/components/NoData";

interface TableProductGroupProps {
  data: ProductGroupResponse[];
}

export default function TableProductGroup({ data }: TableProductGroupProps) {
  const [selectedGroup, setSelectedGroup] = useState<ProductGroupResponse | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const customSortIcon = ({ sortOrder }: { sortOrder?: SortOrder }) =>
      sortOrder === "ascend" ? (
        <KeyboardArrowUpOutlined fontSize="small"/>
      ) : sortOrder === "descend" ? (
        <KeyboardArrowDownOutlined fontSize="small"/>
      ) : (
        <KeyboardArrowDownOutlined fontSize="small" className="text-[#3C3C43B2]"/>
      );

  const columns: TableColumnsType<ProductGroupResponse> = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: "4.25%",
      ellipsis: true,
    },
    {
      title: "Tên loại sản phẩm",
      dataIndex: "name",
      key: "name",
      width: "25.93%",
      ellipsis: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
      key: "description",
      width: "57.18%",
      ellipsis: true,
    },    
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: "12.63%",
      ellipsis: true,
      sortIcon: customSortIcon,
      sorter: (a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateA - dateB; 
      },
      render: (val) =>
        val ? new Date(val).toLocaleDateString("vi-VN") : "-",
    },
  ];

  const handleRowClick = (record: ProductGroupResponse) => {
    setSelectedGroup(record);
    setShowPopup(true);
  };

  return (
    <>
      <Table<ProductGroupResponse>
        columns={columns}
        dataSource={data.map((item) => ({ ...item, key: item.name }))}
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
            //   <div className="text-[17px] leading-[22px] font-normal mt-[15px]">Hiện chưa có sản phẩm nào</div>
            // </div>
            <NoData message="Hiện chưa có loại sản phẩm nào" className="py-4 h-full"/>
          ),
        }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        rowClassName={() => `hover:cursor-pointer`}
      />  

      {showPopup && selectedGroup && (
        <DetailProductGroupPopup
          isOpen={showPopup}          
          onClose={() => setShowPopup(false)}
          group={selectedGroup}
        />
      )}
    </>
  );
}
