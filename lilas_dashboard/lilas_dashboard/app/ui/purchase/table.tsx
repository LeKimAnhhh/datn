import { Table as AntTable } from "antd";
import React, { useState } from "react";
import type { TableColumnsType, TableProps } from "antd";
import type { SortOrder, SorterResult } from "antd/es/table/interface";
import { Purchase } from "@/app/lib/definitions";
import PopupEditPurchase from "@/app/ui/purchase/edit-form";
import {
  KeyboardArrowUpOutlined,
  KeyboardArrowDownOutlined,
  ContentPasteSearchOutlined,
} from "@mui/icons-material";
import StatusBadge from "@/app/ui/status";
import PopupCreateInspection from "../inspection/create-form";
import Image from 'next/image';
import NoData from "@/app/components/NoData";
import { Tooltip } from "react-tooltip";

interface TablePurchaseProps {
  initialData: Purchase[];
}

export default function TablePurchase({ initialData }: TablePurchaseProps) {
  const [purchaseList, setPurchaseList] = useState<Purchase[]>(initialData);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(
    null
  );
  const [sortedInfo, setSortedInfo] = useState<SorterResult<Purchase>>({});

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [createId, setCreateId] = useState<string>();

  const handleTableChange: TableProps<Purchase>["onChange"] = (
    _,
    __,
    sorter
  ) => {
    setSortedInfo(sorter as SorterResult<Purchase>);
  };

  const customSortIcon = ({ sortOrder }: { sortOrder?: SortOrder }) =>
    sortOrder === "ascend" ? (
      <KeyboardArrowUpOutlined fontSize="small" />
    ) : sortOrder === "descend" ? (
      <KeyboardArrowDownOutlined fontSize="small" />
    ) : (
      <KeyboardArrowDownOutlined
        fontSize="small"
        className="text-[#3C3C43B2]"
      />
    );

  const columns: TableColumnsType<Purchase> = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: "4.12%",
      ellipsis: true,
    },
    {
      title: "Mã phiếu nhập",
      dataIndex: "id",
      key: "id",
      width: "9.31%",
      ellipsis: true,
    },
    {
      title: "Ngày nhập",
      dataIndex: "created_at",
      key: "created_at",
      // render: (date) => (date ? new Date(date).toLocaleString("vi-VN") : "-"),
      render: (date) =>
        `${new Date(date).toLocaleDateString("vi-VN")}, ${new Date(
          date
        ).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        })}`,
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      sortOrder:
        sortedInfo.columnKey === "created_at" ? sortedInfo.order : null,
      sortIcon: customSortIcon,
      width: "15.3%",
      ellipsis: true,
    },
    {
      title: "Trạng thái nhập",
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <StatusBadge type="purchase_status" value={record.status} />
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortOrder: sortedInfo.columnKey === "status" ? sortedInfo.order : null,
      sortIcon: customSortIcon,
      // width: "15.4%",
      width: "19.6%",
      ellipsis: true,
    },
    {
      title: "Chi nhánh nhập",
      dataIndex: "branch",
      key: "branch",
      width: "10.5%",
      ellipsis: true,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: ["supplier", "contact_name"],
      key: "supplier_name",
      render: (_, record) => record.supplier?.contact_name || "N/A",
      width: "10.64%",
      ellipsis: true,
    },
    {
      title: "Nhân viên tạo",
      key: "employee",
      render: (_, record) => record.user?.full_name || "N/A",
      width: "12.63%",
      ellipsis: true,
    },
    {
      title: "Giá trị đơn",
      dataIndex: "total_value",
      key: "total_value",
      render: (value) => value?.toLocaleString("en-ES") || 0,
      sorter: (a, b) => (a.total_value || 0) - (b.total_value || 0),
      sortOrder:
        sortedInfo.columnKey === "total_value" ? sortedInfo.order : null,
      sortIcon: customSortIcon,
      width: "10.64%",
      ellipsis: true,
    },
    {
      title: "Kiểm hàng",
      key: "stt",
      align: "center",
      // render: () => (
      //   <div
      //     className="flex justify-center items-center text-blue-500 w-full h-full"
      //     onClick={(e) => {
      //       e.stopPropagation();
      //       alert("Kiểm hàng");
      //     }}
      //   >
      //     <ContentPasteSearchOutlined fontSize="small" />
      //   </div>
      // ),
      //render: (_, record) => <CreateInspectionButton record={record} />,
      render: (_, record) => {
        if (record.status !== "canceled")
          return (
            <div
              className="flex justify-center items-center text-blue-500 w-full h-full"
              onClick={(e) => {
                e.stopPropagation();
                setCreateId(record.id);
                setIsCreateFormOpen(true);
              }}
            >
              <ContentPasteSearchOutlined fontSize="small" />
            </div>
          );
      },
      ellipsis: true,
    },
  ];

  const handleRowClick = (record: Purchase) => {
    setSelectedPurchaseId(record.id);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedPurchaseId(null);
  };

  const handleSaved = (updated: Purchase) => {
    setPurchaseList((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  return (
    <>
      <div>
        <AntTable<Purchase>
          columns={columns}
          dataSource={purchaseList.map((item) => ({ ...item, key: item.id }))}
          pagination={false}
          showSorterTooltip={false}
          locale={{
            emptyText: (
              <NoData message="Hiện chưa có phiếu nhập nào" className="py-4"/>
              // <div className="css-dev-only-do-not-override-142vneq ant-empty ant-empty-normal">
              //   <div className="flex flex-col justify-center items-center">
              //     <Image 
              //     src='/shopping_vol_1.svg'
              //     alt='Logo Shopping'
              //     width={180}
              //     height={148}
              //     />
              //   </div>
              //   <div className="text-[17px] leading-[22px] font-normal mt-[15px]">Hiện chưa có phiếu nhập nào</div>
              // </div>
            ),
          }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: "pointer" },
          })}
          onChange={handleTableChange}
        />

        <Tooltip id="badge-tooltip" place="top-start" opacity={1.0} className='z-10'/>

        {isEditOpen && selectedPurchaseId && (
          <PopupEditPurchase
            isOpen={isEditOpen}
            onClose={handleCloseEdit}
            purchaseId={selectedPurchaseId}
            onSaved={handleSaved}
          />
        )}
      </div>

      {isCreateFormOpen && (
        <PopupCreateInspection
          isOpen={isCreateFormOpen}
          onClose={(e?: React.MouseEvent) => {
            if (e) {
              e.stopPropagation();
            }
            setIsCreateFormOpen(false);
          }}
          purchaseId={createId}
        />
      )}
    </>
  );
}

// function CreateInspectionButton({ record }: { record: Purchase }) {
//   // console.log(record);
//   const [isOpen, setIsOpen] = useState(false);

//   const handleClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setIsOpen(true);
//   };

//   const handleClose = (e?: React.MouseEvent) => {
//     if (e) {
//       e.stopPropagation();
//     }
//     setIsOpen(false);
//   };

//   return (
//     <>
//       <div
//         className="flex justify-center items-center text-blue-500 w-full h-full"
//         onClick={handleClick}
//       >
//         <ContentPasteSearchOutlined fontSize="small" />
//       </div>
//       {isOpen && (
//         <div onClick={(e) => e.stopPropagation()} className="cursor-default">
//           <PopupCreateInspection
//             isOpen={isOpen}
//             onClose={handleClose}
//             purchaseId={record.id}
//           />
//         </div>
//       )}
//     </>
//   );
// }
