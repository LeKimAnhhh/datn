"use client";

import React from "react";
import {
  PendingActionsOutlined,
  CurrencyExchangeOutlined,
  BlockOutlined,
  RestartAlt,
  HourglassBottomOutlined,
  Inbox,
  CheckOutlined,
  DeleteOutline,
  MopedOutlined,
  MoveToInboxOutlined,
  ReportOutlined,
  AssignmentLateOutlined,
  CompareArrowsOutlined,
} from "@mui/icons-material";
import { cn } from "../lib/utils";

interface StatusBadgeProps {
  type: "inspection_status" | "purchase_status" | "product_status" | "invoice_status" | "payment_status" | "delivery_status" | "retunr_status" | "transport_status" | "transfer_status";
  value: string;
  dry_stock?: boolean;
}

interface TemplateBadgeProps {
  icon?: JSX.Element;
  textColor: string;
  bgColor: string;
  borderColor?: string;
  title: string;
}

function TemplateBadge({ icon, textColor, bgColor, borderColor, title }: TemplateBadgeProps) {
  return (
    <div
      data-tooltip-id="badge-tooltip"
      data-tooltip-content={title}
      className={cn(
        "flex items-center gap-2 border px-3 py-1 rounded-full text-xs 2xl:text-[15px] w-auto max-w-fit cursor-default",
        `text-[${textColor}] bg-[${bgColor}]`,
        borderColor ? `border  border-[${borderColor}]` : "!border-none"
      )}
    >
      {icon}
      <span className="font-semibold line-clamp-1">{title}</span>
    </div>
  );
}

const transport_status_values = [
  {value: "ready_to_pick", title: "Chờ lấy hàng"},
  {value: "picking", title: "Nhân viên đang lấy hàng"},
  {value: "cancel", title: "Hủy đơn hàng"},
  {value: "money_collect_picking", title: "Đang thu tiền người gửi"},
  {value: "picked", title: "Nhân viên đã lấy hàng"},
  {value: "storing", title: "Hàng đang nằm ở kho"},
  {value: "transporting", title: "Đang luân chuyển hàng"},
  {value: "sorting", title: "Đang phân loại hàng hóa"},
  {value: "delivering", title: "Nhân viên đang giao hàng"},
  {value: "money_collect_delivering", title: "Đang thu tiền người nhận"},
  {value: "delivered", title: "Đã giao hàng thành công"},
  {value: "delivery_fail", title: "Giao hàng thất bại"},
  {value: "waiting_to_return", title: "Đợi trả hàng"},
  {value: "return", title: "Trả hàng"},
  {value: "return_transporting", title: "Luân chuyển hàng trả"},
  {value: "return_sorting", title: "Phân loại hàng trả"},
  {value: "returning", title: "Đang trả hàng"},
  {value: "return_fail", title: "Trả hàng thất bại"},
  {value: "returned", title: "Đã trả hàng thành công"},
  {value: "exception", title: "Ngoại lệ"},
  {value: "damage", title: "Hư hỏng"},
  {value: "lost", title: "Bị mất"}
]



export default function StatusBadge({ type, value, dry_stock }: StatusBadgeProps) {
  switch (type) {
    case "inspection_status":
      switch (value) {
        case "checked":
          // return (
          //   <div className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#234904] bg-[#DEFAC2] flex items-center gap-1 border border-[#C5F599] w-auto max-w-fit">
          //     <CheckOutlined fontSize="small" />
          //     <span className="line-clamp-1">Đã kiểm xong</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đã kiểm xong"
              icon={<CheckOutlined fontSize="small" />}
              textColor="#234904"
              bgColor="#DEFAC2"
              borderColor="#C5F599"
            />
          );
        case "checking":
          // return (
          //   <div className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#663300] bg-[#FCF3C5] flex items-center gap-1 border border-[#F2E0A6] w-auto max-w-fit">
          //     <PendingActionsOutlined fontSize="small" />
          //     <span className="line-clamp-1">Đang kiểm</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đang kiểm"
              icon={<PendingActionsOutlined fontSize="small" />}
              textColor="#663300"
              bgColor="#FCF3C5"
              borderColor="#F2E0A6"
            />
          );
      }
      break;

    case "purchase_status":
      switch (value) {
        case "received_unpaid":
          // return (
          //   <div className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#5C2E00] bg-[#FCF3C5] inline-flex items-center gap-1 w-auto max-w-fit">
          //     <AssignmentLateOutlined fontSize="small" />
          //     <span className="line-clamp-1">Đã nhập chưa thanh toán</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đã nhập chưa thanh toán"
              icon={<AssignmentLateOutlined fontSize="small" />}
              textColor="#5C2E00"
              bgColor="#FCF3C5"
            />
          );
        case "received_paid":
          // return (
          //   <div className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#234904] bg-[#DEFAC2] inline-flex items-center gap-1 w-auto max-w-fit">
          //     <CheckOutlined fontSize="small" />
          //     <span className="line-clamp-1">Đã nhập đã thanh toán</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đã nhập đã thanh toán"
              icon={<CheckOutlined fontSize="small" />}
              textColor="#234904"
              bgColor="#DEFAC2"
            />
          );
        case "pending":
          // return (
          //   <div className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#163369] bg-[#DEE9FC] inline-flex items-center gap-1 w-auto max-w-fit">
          //     <CurrencyExchangeOutlined fontSize="small" />
          //     <span className="line-clamp-1">Đang giao dịch</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đang giao dịch"
              icon={<CurrencyExchangeOutlined fontSize="small" />}
              textColor="#163369"
              bgColor="#DEE9FC"
            />
          );
        case "canceled":
          // return (
          //   <div className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#E50000] bg-[#FCE1DE] inline-flex items-center gap-1">
          //     <DeleteOutline fontSize="small" />
          //     Đã hủy
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đã hủy"
              icon={<DeleteOutline fontSize="small" />}
              textColor="#E50000"
              bgColor="#FCE1DE"
            />
          );
      }
      break;

    case "retunr_status":
      switch (value) {
        case "returning":
          // return (
          //   <div className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#663300] bg-[#FCF3C5] inline-flex items-center gap-1 w-auto max-w-fit">
          //     <CompareArrowsOutlined fontSize="small" />
          //     <span className="line-clamp-1">Đang trả hàng</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đang trả hàng"
              icon={<CompareArrowsOutlined fontSize="small" />}
              textColor="#663300"
              bgColor="#FCF3C5"
            />
          );
        case "returned":
          // return (
          //   <div className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#3AA207] bg-[#DEFAC2] inline-flex items-center gap-1 w-auto max-w-fit">
          //     <CheckOutlined fontSize="small" />
          //     <span className="line-clamp-1">Đã trả hàng</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đã trả hàng"
              icon={<CheckOutlined fontSize="small" />}
              textColor="#3AA207"
              bgColor="#DEFAC2"
            />
          );

        case "canceled":
          // return (
          //   <div className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#E50000] bg-[#FCE1DE] inline-flex items-center gap-1 w-auto max-w-fit">
          //     <DeleteOutline fontSize="small" />
          //     <span className="line-clamp-1">Đã hủy</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đã hủy"
              icon={<DeleteOutline fontSize="small" />}
              textColor="#E50000"
              bgColor="#FCE1DE"
            />
          );
      }
      break;

    case "product_status":
      switch (dry_stock ? "Đang giao dịch" : "Ngừng giao dịch") {
        case "Đang giao dịch":
          // return (
          //   <div className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#663300] bg-[#FCF3C5] flex items-center gap-1 w-auto max-w-fit">
          //     <CurrencyExchangeOutlined fontSize="small" />
          //     <span className="line-clamp-1">Đang giao dịch</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đang giao dịch"
              icon={<CurrencyExchangeOutlined fontSize="small" />}
              textColor="#663300"
              bgColor="#FCF3C5"
            />
          );
        case "Ngừng giao dịch":
          // return (
          //   <div className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#8C000E] bg-[#FCE1DE] flex items-center gap-1 w-auto max-w-fit">
          //     <BlockOutlined fontSize="small" />
          //     <span className="line-clamp-1">Ngừng giao dịch</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Ngừng giao dịch"
              icon={<BlockOutlined fontSize="small" />}
              textColor="#8C000E"
              bgColor="#FCE1DE"
            />
          );
      }

    case "invoice_status":
      switch (value) {
        case "cancel":
          // return (
          //   <div
          //     data-tooltip-id="badge-tooltip"
          //     data-tooltip-content="Đã huỷ"
          //     className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#80000E] bg-[#FCE1DE] flex items-center gap-1 w-auto max-w-fit">
          //     <BlockOutlined  fontSize="small" />
          //     <span className="line-clamp-1">Đã hủy</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đã huỷ"
              icon={<BlockOutlined fontSize="small" />}
              textColor="#80000E"
              bgColor="#FCE1DE"
            />
          );
        case "delivering":
          // return (
          //   <div
          //     data-tooltip-id="badge-tooltip"
          //     data-tooltip-content="Đang vận chuyển"
          //     className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#5C2E00] bg-[#FCF3C5] flex items-center gap-1 w-auto max-w-fit"
          //   >
          //     <MopedOutlined  fontSize="small" />
          //     <span className="line-clamp-1">Đang vận chuyển</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đang vận chuyển"
              icon={<MopedOutlined fontSize="small" />}
              textColor="#5C2E00"
              bgColor="#FCF3C5"
            />
          );
        case "delivered":
          // return (
          //   <div
          //     data-tooltip-id="badge-tooltip"
          //     data-tooltip-content="Giao hàng thành công"
          //     className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#234904] bg-[#DEFAC2] flex items-center gap-1 w-auto max-w-fit">
          //     <CheckOutlined  fontSize="small" />
          //     <span className="line-clamp-1">Đã hoàn thành</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đã hoàn thành"
              icon={<CheckOutlined fontSize="small" />}
              textColor="#234904"
              bgColor="#DEFAC2"
            />
          );
        case "ready_to_pick":
        case "picking":
          // return (
          //   <div
          //     data-tooltip-id="badge-tooltip"
          //     data-tooltip-content="Đang giao dịch"
          //     className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#163369] bg-[#DEE9FC] flex items-center gap-1 w-auto max-w-fit">
          //     <CurrencyExchangeOutlined  fontSize="small" />
          //     <span className="line-clamp-1">Đang giao dịch</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đang giao dịch"
              icon={<CurrencyExchangeOutlined fontSize="small" />}
              textColor="#163369"
              bgColor="#DEE9FC"
            />
          );
        case "returned":
          // return (
          //   <div
          //     data-tooltip-id="badge-tooltip"
          //     data-tooltip-content="Trả hàng chờ nhận"
          //     className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#8C000E] bg-[#FCE1DE] flex items-center gap-1 w-auto max-w-fit">
          //     <RestartAlt  fontSize="small" />
          //     <span className="line-clamp-1">Trả hàng chờ nhận</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Trả hàng đã nhận"
              icon={<RestartAlt fontSize="small" />}
              textColor="#8C000E"
              bgColor="#FCE1DE"
            />
          );
        case "returning":
          // return (
          //   <div
          //     data-tooltip-id="badge-tooltip"
          //     data-tooltip-content="Trả hàng chờ nhận"
          //     className="px-3 py-1 rounded-full text-[15px] font-semibold text-[#8C000E] bg-[#FCE1DE] flex items-center gap-1 w-auto max-w-fit">
          //     <RestartAlt  fontSize="small" />
          //     <span className="line-clamp-1">Trả hàng chờ nhận</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Trả hàng chờ nhận"
              icon={<RestartAlt fontSize="small" />}
              textColor="#8C000E"
              bgColor="#FCE1DE"
            />
          );
      }
      break;

    case "payment_status":
      switch (value) {
        case "paid":        
          // return (
          //   <div className="flex items-center px-3 py-1 text-[15px] font-semibold rounded-full text-[#234904] bg-[#DEFAC2] w-auto max-w-fit">
          //     <CheckOutlined  fontSize="small" />
          //     <span className="line-clamp-1">Đã thanh toán</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đã thanh toán"
              icon={<CheckOutlined fontSize="small" />}
              textColor="#234904"
              bgColor="#DEFAC2"
            />
          );
        case "partial_payment":
          // return (
          //   <div className="flex items-center px-3 py-1 text-[15px] font-semibold rounded-full text-[#D37E09] bg-[#FFF6CC] w-auto max-w-fit">
          //     <HourglassBottomOutlined  fontSize="small" />
          //     <span className="line-clamp-1">Thanh toán 1 phần</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Thanh toán 1 phần"
              icon={<HourglassBottomOutlined fontSize="small" />}
              textColor="#D37E09"
              bgColor="#FFF6CC"
            />
          );
        case "unpaid":
        case "refund":
          // return (
          //   <div className="flex items-center px-3 text-[15px] font-semibold py-1 rounded-full text-[#B8000A] bg-[#FCE1DE] w-auto max-w-fit">
          //     <ReportOutlined  fontSize="small" />
          //     <span className="line-clamp-1">Chưa thanh toán</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Chưa thanh toán"
              icon={<ReportOutlined fontSize="small" />}
              textColor="#80000E"
              bgColor="#FCE1DE"
            />
          );
      }
      break;

    case "delivery_status":
      switch (value) {
        case "ready_to_pick":
        case "picking":
          // return (
          //   <div className="px-3 py-1 rounded-full font-semibold text-[15px] flex items-center gap-1 bg-[#DEE9FC] text-[#163369] w-auto max-w-fit">
          //     <CurrencyExchangeOutlined  fontSize="small" />
          //     <span className="line-clamp-1">Chờ lấy hàng</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Chờ lấy hàng"
              icon={<CurrencyExchangeOutlined fontSize="small" />}
              textColor="#163369"
              bgColor="#DEE9FC"
            />
          );
        case "returning":
          // return (
          //   <div className="flex items-center px-3 py-1 rounded-full text-[15px] text-[#80000D] bg-[#FCE1DE] w-auto max-w-fit">
          //     <Inbox  fontSize="small" />
          //     <span className="line-clamp-1">Hủy giao chờ nhận</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Hủy giao chờ nhận"
              icon={<Inbox fontSize="small" />}
              textColor="#80000D"
              bgColor="#FCE1DE"
            />
          );
        case "returned":
          // return (
          //   <div className="flex items-center font-semibold text-[15px] px-3 py-1 rounded-full text-[#B8000A] bg-[#FFDFDB] w-auto max-w-fit">
          //     <MoveToInboxOutlined  fontSize="small" />
          //     <span className="line-clamp-1">Hủy giao đã nhận</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Hủy giao đã nhận"
              icon={<MoveToInboxOutlined fontSize="small" />}
              textColor="#80000D"
              bgColor="#FCE1DE"
            />
          );
        case "delivering":
          // return (
          //   <div className="flex items-center font-semibold text-[15px] px-3 py-1 rounded-full text-[#5C2E00] bg-[#FCF3C5] w-auto max-w-fit">
          //     <MopedOutlined  fontSize="small" />
          //     <span className="line-clamp-1">Đang vận chuyển</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Đang vận chuyển"
              icon={<MopedOutlined fontSize="small" />}
              textColor="#5C2E00"
              bgColor="#FCF3C5"
            />
          );
        case "delivered":
          // return (
          //   <div className="flex items-center font-semibold text-[15px] px-3 py-1 rounded-full bg-[#DEFAC2] w-auto max-w-fit">
          //     <CheckOutlined  fontSize="small" />
          //     <span className="line-clamp-1">Giao hàng thành công</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Giao hàng thành công"
              icon={<CheckOutlined fontSize="small" />}
              textColor="#234904"
              bgColor="#DEFAC2"
            />
          );
        case "cancel":
          // return (
          //   <div className="flex items-center font-semibold text-[15px] px-3 py-1 rounded-full text-[#80000D] bg-[#FCE1DE] w-auto max-w-fit">
          //     <BlockOutlined  fontSize="small" />
          //     <span className="line-clamp-1">Huỷ đơn</span>
          //   </div>
          // );
          return (
            <TemplateBadge
              title="Huỷ đơn"
              icon={<BlockOutlined fontSize="small" />}
              textColor="#80000D"
              bgColor="#FCE1DE"
            />
          );
      }
      break;
    
    case "transport_status":
      const statusItem = transport_status_values.find(item => item.value === value);
      if (statusItem) {
        return (
          <TemplateBadge
            title={statusItem.title}
            textColor="#D37E09"
            bgColor="#FFF6CC"
          />
        );
      }
      return (
        <TemplateBadge
          title={value}
          textColor="#D37E09"
          bgColor="#FFF6CC"
        />
      );

      case "transfer_status":
        switch (value) {
          case "ready_to_pick":
            return (
              <TemplateBadge
                title="Chờ lấy hàng"
                icon={<CurrencyExchangeOutlined fontSize="small" />}
                textColor="#163369"
                bgColor="#DEE9FC"
              />
            );
          case "delivering":
            return (
              <TemplateBadge
                title="Đang vận chuyển"
                icon={<MopedOutlined fontSize="small" />}
                textColor="#5C2E00"
                bgColor="#FCF3C5"
              />
            );
          case "delivered":
            return (
              <TemplateBadge
                title="Nhận hàng thành công"
                icon={<CheckOutlined fontSize="small" />}
                textColor="#234904"
                bgColor="#DEFAC2"
              />
            );
          case "cancelled":
            return (
              <TemplateBadge
                title="Huỷ đơn"
                icon={<BlockOutlined fontSize="small" />}
                textColor="#80000D"
                bgColor="#FCE1DE"
              />
            );
        }
        break;

    default:
      return (
        <div className="px-3 py-1 rounded-full text-[15px] font-semibold bg-gray-200 text-gray-600 flex items-center gap-1 w-auto max-w-fit">
          {value}
        </div>
      );
  }
}
