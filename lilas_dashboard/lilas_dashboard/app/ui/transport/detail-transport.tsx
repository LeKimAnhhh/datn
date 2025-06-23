"use client";
import React, { useEffect, useState } from "react";
import { DeliveryResponse } from "@/app/lib/definitions";
import { fetchDeliveryDetail, printOrder } from "@/app/lib/data";
import StatusBadge from "@/app/ui/status";
import { CheckCircleOutlined, CloseOutlined, LocalPrintshopOutlined, ReportGmailerrorred } from "@mui/icons-material";
import Link from "next/link";
import { Tooltip } from "react-tooltip";
import ErrorPage from "@/app/tong-quan/404/page";
import PopupSkeleton from "@/app/components/PopupSkeleton";

interface DetailTransportProps {
  orderCode: string;
  onClose: () => void;
}

export default function DetailTransport({ orderCode, onClose }: DetailTransportProps) {
  const [delivery, setDelivery] = useState<DeliveryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    const loadDeliveryDetail = async () => {
      try {
        const data = await fetchDeliveryDetail(orderCode);
        console.log("Delivery Data:", data);
        setDelivery(data);  
        setStatus(data.data?.invoice?.status || "");
        setInvoiceItems(data.data?.invoice?.items || []);
      } catch (err) {
        console.error("[loadDeliveryDetail] Error:", err);
        setError("Lỗi khi tải chi tiết vận đơn.");
      }
    };
    loadDeliveryDetail();
  }, [orderCode]);
  

  if (error) {
    return (
      // <div className="p-4 xl:h-[95vh] 3xl:h-[90vh] w-full xl:max-w-[80%] flex items-center justify-center bg-[#F2F2F7] rounded-2xl">
      //   {/* <p>{error}</p> */}
      // </div>
      <ErrorPage />
    );
  }

  if (!delivery) {
    return (
      // <div className="p-4 xl:h-[95vh] 3xl:h-[90vh] w-full xl:max-w-[80%] flex items-center justify-center bg-[#F2F2F7] rounded-2xl">
      //   <p>Đang tải chi tiết vận đơn...</p>
      // </div>
      <PopupSkeleton type="transport" />
    );
  }

  const payMethod = delivery.data?.payment_type_id === 1 ? "Shop trả" : "Người nhận trả";

  // Tính tổng số items
  const totalItems = invoiceItems.reduce((sum, it) => sum + it.quantity, 0);

  const handleClose = () => onClose();

  const handleCancelTransport = () => {
    //alert("Hủy vận chuyển...");
    setMessage("Hủy vận chuyển...");
    setMessageType("success");
    setTimeout(() => {
      setMessage("");
    }, 5000);
    // onClose();
  };

  const handleSave = () => {
    setMessage("Lưu đơn hàng...");
    setMessageType("success");
    setTimeout(() => {
      setMessage("");
    }, 5000);
    // onClose();
  };
  
  const handlePrint = async () => {
    const token = localStorage.getItem("access_token") || "";
  
    try {
      const res = await printOrder(token, orderCode);
  
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
  
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.print();
        }, 100);
      };
  
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(res);
        doc.close();
      }

      setTimeout(() => {
        iframe.remove();
      }, 500); 
    } catch (error) {
      console.log("Error:", error);
    }
  };
  
  return (
    <div className="p-6 bg-[#F2F2F7] rounded-2xl w-full xl:w-[80%] 3xl:w-[78%] max-h-full xl:max-h-[95vh] 3xl:max-h-[90vh]">
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

      <div className="flex justify-between mb-4 gap-4">
        <div className="flex gap-4 items-center">
          <div className="flex gap-4 items-center border-r pr-4">
            <h2 className="text-xl font-bold">
              Chi tiết vận đơn #{delivery.order_code}
            </h2>
            <button
              onClick={handlePrint}
              className="bg-transparent text-[#0061FD] font-semibold py-1 px-2 rounded-lg border border-[#0061FD] h-7 items-center flex gap-1"
            >
              <LocalPrintshopOutlined fontSize="small" />
              In đơn
            </button>
          </div>

          <StatusBadge
            type="delivery_status"
            value={delivery.data.invoice?.status || ""}
          />
        </div>

        <button onClick={onClose} className="text-gray-600">
          <CloseOutlined />
        </button>
      </div>

      {/* VẬN ĐƠN */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-8 border p-4 rounded-2xl flex flex-col gap-2 3xl:gap-4 shadow-[0_2px_0_#D9D9D9] bg-white">
          {/* Trái */}
          <h2 className="text-[15px] 3xl:text-[17px] font-bold">
            Thông tin vận chuyển
          </h2>
          <div className="flex justify-between gap-4">
            <div className="w-1/2 border px-4 rounded-xl">
              <div className="flex justify-between text-[13px] 3xl:text-[15px] font-semibold border-b py-2 3xl:py-4">
                <p className="text-[#3C3C43B2]">Đơn hàng</p>
                <p>{delivery.data?.invoice_id}</p>
              </div>
              <div className="flex justify-between text-[13px] 3xl:text-[15px] font-semibold border-b py-2 3xl:py-4">
                <p className="text-[#3C3C43B2]">Người nhận</p>
                <p>{delivery.data?.to_name}</p>
              </div>
              <div className="flex justify-between text-[13px] 3xl:text-[15px] font-semibold border-b py-2 3xl:py-4">
                <p className="text-[#3C3C43B2]">Điện thoại</p>
                <p>{delivery.data?.to_phone}</p>
              </div>
              <div className="flex justify-between text-[13px] 3xl:text-[15px] font-semibold py-2 3xl:py-4">
                <p className="text-[#3C3C43B2]">Địa chỉ nhận hàng</p>
                <p className="text-right">
                  {delivery.data?.to_address} {delivery.data?.to_ward_name},{" "}
                  {delivery.data?.to_district_name},{" "}
                  {delivery.data?.to_province_name}
                </p>
              </div>
            </div>
            {/* Phải */}
            <div className="w-1/2 border px-4 rounded-xl">
              <div className="flex justify-between text-[13px] 3xl:text-[15px] font-semibold border-b py-2 3xl:py-4">
                <p className="text-[#3C3C43B2]">SĐT kho lấy hàng</p>
                <p>{delivery.shop_address?.phone}</p>
              </div>
              <div className="flex justify-between text-[13px] 3xl:text-[15px] font-semibold border-b py-2 3xl:py-4">
                <p className="text-[#3C3C43B2]">Địa chỉ kho lấy hàng</p>
                <p className="text-right">{delivery.shop_address?.address}</p>
              </div>
              <div className="flex justify-between text-[13px] 3xl:text-[15px] font-semibold border-b py-2 3xl:py-4">
                <p className="text-[#3C3C43B2]">Ngày đóng gói</p>
                <p>
                  {delivery.data?.created_at
                    ? new Date(delivery.data.created_at).toLocaleString(
                        "vi-VN",
                        { day: "2-digit", month: "2-digit", year: "numeric" }
                      ) +
                      ", " +
                      new Date(delivery.data.created_at).toLocaleString(
                        "vi-VN",
                        { hour: "2-digit", minute: "2-digit", hour12: false }
                      )
                    : ""}
                </p>
              </div>
              <div className="flex justify-between text-[13px] 3xl:text-[15px] font-semibold py-2 3xl:py-4">
                <p className="text-[#3C3C43B2]">Trạng thái giao hàng</p>
                <div className="[&_span]:text-[13px] 3xl:[&_span]:text-[15px]">
                  <StatusBadge
                    type="transport_status"
                    value={delivery.status}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* THÔNG TIN PHIẾU */}
        <div className="col-span-4 border p-4 flex flex-col gap-2 3xl:gap-4 rounded-2xl shadow-[0_2px_0_#D9D9D9] bg-white">
          <h2 className="text-[15px] 3xl:text-[17px] font-bold">
            Thông tin phiếu giao hàng
          </h2>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="w-full md:w-1/2 flex flex-col gap-2 3xl:gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-[#3C3C43B2] text-[13px] 3xl:text-[15px] font-semibold">
                  Đơn vị vận chuyển
                </label>
                <input
                  type="text"
                  className="border p-2 rounded-md border-[#3C3C4359] cursor-not-allowed h-8 3xl:h-10 text-[13px] 3xl:text-[15px]"
                  value="Giao hàng nhanh"
                  readOnly
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[#3C3C43B2] text-[13px] 3xl:text-[15px] font-semibold">
                  Trạng thái đối soát
                </label>
                <input
                  type="text"
                  className="border border-[#3C3C4359] p-2 rounded-md cursor-not-allowed h-8 3xl:h-10 text-[13px] 3xl:text-[15px]"
                  value="Chưa đối soát"
                  readOnly
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[#3C3C43B2] text-[13px] 3xl:text-[15px] font-semibold">
                  Thu hộ COD
                </label>
                <input
                  type="text"
                  className="border p-2 cursor-not-allowed rounded-md border-[#3C3C4359] h-8 3xl:h-10 text-[13px] 3xl:text-[15px]"
                  value={(delivery.data?.cod_amount || 0).toLocaleString(
                    "en-ES"
                  )}
                  readOnly
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-2 3xl:gap-4 pr-4">
              <div className="flex flex-col">
                <label className="mb-1 text-[#3C3C43B2] text-[13px] 3xl:text-[15px] font-semibold">
                  Người trả phí
                </label>
                <input
                  type="text"
                  className="border cursor-not-allowed p-2 rounded-md border-[#3C3C4359] h-8 3xl:h-10 text-[13px] 3xl:text-[15px]"
                  value={payMethod}
                  readOnly
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[#3C3C43B2] text-[13px] 3xl:text-[15px] font-semibold">
                  Ngày lấy hàng
                </label>
                <input
                  type="text"
                  className="border p-2 rounded-md border-[#3C3C4359] cursor-not-allowed h-8 3xl:h-10 text-[13px] 3xl:text-[15px]"
                  value={
                    delivery.data?.pickup_time
                      ? new Date(delivery.data.pickup_time).toLocaleString(
                          "vi-VN",
                          { day: "2-digit", month: "2-digit", year: "numeric" }
                        )
                      : ""
                  }
                  readOnly
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-[#3C3C43B2] text-[13px] 3xl:text-[15px] font-semibold">
                  Ghi chú
                </label>
                <input
                  // rows={1}
                  className="w-full border p-2 rounded-md cursor-not-allowed border-[#3C3C4359] h-8 3xl:h-10 text-[13px] 3xl:text-[15px]"
                  value={delivery.data?.note || ""}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tooltip
        id="badge-tooltip"
        place="top-start"
        opacity={1.0}
        className="z-10"
      />

      {/* table */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-9 border p-4 rounded-2xl shadow-[0_2px_0_#D9D9D9] bg-white">
          <h2 className="text-[15px] 3xl:text-[17px] font-bold mb-4">
            Chi tiết phiếu giao hàng
          </h2>
          <div className="max-h-[170px] 3xl:max-h-[200px] overflow-auto scrollbar-hide">
            <table className="w-full table-fixed">
              <thead className="ant-table-thead bg-[#ededf0] sticky top-0 z-10 ">
                <tr className="h-8 3xl:h-10 text-[13px] 3xl:text-[15px] font-semibold">
                  <th className="p-2 ant-table-cell sticky top-0 w-[14%] rounded-tl-lg">
                    Mã sản phẩm
                  </th>
                  <th className="p-2 ant-table-cell sticky top-0">
                    Tên sản phẩm
                  </th>
                  <th className="p-2 ant-table-cell sticky top-0 w-[14%]">
                    Số lượng
                  </th>
                  <th className="p-2 ant-table-cell sticky top-0 w-[14%]">
                    Đơn giá
                  </th>
                  <th className="p-2 ant-table-cell sticky top-0 w-[14%]">
                    Chiết khấu
                  </th>
                  <th className="p-2 ant-table-cell sticky top-0 w-[14%] rounded-tr-lg">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13px] 3xl:text-[15px]">
                {invoiceItems.map((it, idx) => {
                  const discount = it.discount || 0;
                  const lineTotal = it.discount_type === "%" ?
                    it.price * it.quantity * (1 - discount / 100) :
                    it.price * it.quantity - discount;
                  return (
                    <tr
                      className="border-b text-center"
                      key={idx}
                      style={{
                        height: "40px",
                      }}
                    >
                      <td className="p-1 3xl:p-2">{it.product_id}</td>
                      <td className="p-1 3xl:p-2 text-left">
                        {/* {it.product.name} */}
                        <p
                          className="line-clamp-2 break-all"
                          data-tooltip-id="product-name"
                          data-tooltip-content={it.product.name || it.name}
                        >
                          {it.product?.name || it.name}
                        </p>
                        <Tooltip id="product-name" place="top" />
                      </td>
                      <td className="p-1 3xl:p-2">{it.quantity}</td>
                      <td className="p-1 3xl:p-2">
                        {it.price.toLocaleString("en-ES")}
                      </td>
                      <td className="p-1 3xl:p-2">
                        {/* {discount ? discount + "%" : 0} */}
                        {discount.toLocaleString("en-ES") + " " + it.discount_type}
                      </td>
                      <td className="p-1 3xl:p-2">
                        {lineTotal.toLocaleString("en-ES")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4 3xl:gap-6 text-sm border p-4 rounded-2xl shadow-[0_2px_0_#D9D9D9] bg-white">
          <div className="flex justify-between gap-2 border-b pb-2 3xl:pb-3">
            <div className="flex flex-col">
              <h2 className="text-[15px] 3xl:text-[17px] font-bold">
                Tổng tiền
              </h2>
              <p className="text-gray-500 text-xs 3xl:text-sm">({totalItems} sản phẩm)</p>
            </div>
            <p className="text-[15px] 3xl:text-[17px] font-bold">
              {delivery.data?.invoice?.total_value.toLocaleString("en-ES")}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p>Chiết khấu</p>
            <div
              id="ticket-container"
              className={`relative flex items-center justify-center h-7 3xl:h-9 bg-[#3AA207] text-white font-bold rounded-md ${
                delivery.data?.invoice?.discount_type === "%"
                  ? "max-w-14 w-full"
                  : "max-w-28 w-full"
              }`}
            >
              <div className="absolute w-[7px] h-[9px] 3xl:h-[13px] bg-white left-0 rounded-r-full"></div>
              <div className="absolute w-[7px] h-[9px] 3xl:h-[13px] bg-white right-0 rounded-l-full"></div>
              <p className="absolute whitespace-nowrap text-[13px] 3xl:text-[15px]">
                {delivery.data?.invoice?.discount.toLocaleString("en-ES")}
                {delivery.data?.invoice?.discount_type === "%" ? " %" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1">
            <label>Phí giao hàng</label>
            <input
              type="text"
              className="border p-2 text-right rounded-md w-1/2 border-[#3C3C4359] h-8 3xl:h-10 text-[13px] 3xl:text-[15px]"
              value={delivery.data.service_fee.toLocaleString("en-ES")}
              readOnly
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {/* <button
          onClick={handleCancelTransport}
          className="px-3 py-1 bg-[#e50000] text-white rounded-md"
        >
          Hủy vận chuyển
        </button> */}
        <Link
          href={`https://khachhang.ghn.vn/order/edit/${delivery.order_code}`}
          target="_blank"
        >
          <button
            //onClick={handleSave}
            className="px-4 3xl:py-[10px] bg-[#338BFF] text-[13px] 3xl:text-[15px] leading-5 text-white rounded-md min-h-8 3xl:min-h-10"
          >
            Sửa đơn vận chuyển
          </button>
        </Link>
      </div>
    </div>
  );
}