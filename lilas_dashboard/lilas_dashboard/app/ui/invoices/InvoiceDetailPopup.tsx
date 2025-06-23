"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  fetchInvoiceDetail,
  cancelInvoice,
  confirmInvoice,
  fetchProductsName,
  updateInvoice,
  fetchShops,
  payCustomerAmount,
  payCustomerTransaction,
} from "@/app/lib/data";
import {
  InvoiceItem,
  ServiceItem,
  Invoice,
  Product,
  ShopResponse,
} from "@/app/lib/definitions";
import StatusBadge from "@/app/ui/status";
import {
  RoomOutlined,
  EditOutlined,
  DeleteForeverOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ReportGmailerrorred,
  LocalPhoneOutlined,
  LiveHelpOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import PopupSearchProducts from "@/app/components/PopupSearchProducts";
import Image from "next/image";
import CreateTransportForm from "@/app/ui/transport/create-form";
import PopupEditCustomer from "@/app/ui/customer/edit-customer";
import PaymentModal from "../payment";
import PopupPayment from "@/app/components/PopupPayment";
import clsx from "clsx";
import { PrintButtonInvoice } from "@/app/ui/invoices/PrintButtonInvoice";
import Select from "../select";
import ErrorPage from "@/app/tong-quan/404/page";
import { Tooltip } from "react-tooltip";
import { cn } from "@/app/lib/utils";
import NoData from "@/app/components/NoData";
import PopupSkeleton from "@/app/components/PopupSkeleton";

interface InvoiceDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
}

export default function InvoiceDetailPopup({
  isOpen,
  onClose,
  invoiceId,
}: InvoiceDetailPopupProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [subTotal, setSubTotal] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<string>("%");
  const [extraCost, setExtraCost] = useState<number>(0);  
  const [deposit, setDeposit] = useState<number>(0);
  const [customerPaid, setCustomerPaid] = useState<number>(0); 
  const [finalTotal, setFinalTotal] = useState<number>(0); 
  const [remainToPay, setRemainToPay] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isProductPopupVisible, setIsProductPopupVisible] = useState(false);
  const [status, setStatus] = useState("");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [isOpenModalPayment, setIsOpenModalPayment] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [shops, setShops] = useState<ShopResponse[]>([]);
  const [invoiceNote, setInvoiceNote] = useState<string>("");
  const [expectedDelivery, setExpectedDelivery] = useState<Dayjs | null>(null);

  useEffect(() => {
    async function loadShops() {
      try {
        const shopData = await fetchShops();
        console.log("shop:", shopData)
        setShops(shopData);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách cửa hàng:", error);
      }
    }
    if (isOpen) {
      loadShops();
    }
  }, [isOpen]);

  useEffect(() => {
    async function loadData() {
      if (!isOpen) return;
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token") || "";
        const data = await fetchInvoiceDetail(token, invoiceId);
        console.log("Invoice detail:", data);

        setInvoice(data);
        setStatus(data.status || "");
        setDeposit(data.deposit);
        setDiscount(data.discount || 0);
        setDiscountType(data.discount_type);
        setInvoiceNote(data.note || "");
        setExtraCost(data.extraCost || 0); 
        setExpectedDelivery(data.expected_delivery ? dayjs(data.expected_delivery) : null);

        const combinedItems: InvoiceItem[] = [
          ...data.items,
          ...data.service_items.map((si) => ({
            ...si,
            barcode: "",
            total_line: si.price * si.quantity * (1 - si.discount / 100),
          })),
        ];
        setItems(combinedItems);
      } catch (err: any) {
        setError(err.message || "Failed to load invoice details");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isOpen, invoiceId]);

  console.log(items)

  const calculateAllTotals = useCallback(() => {
    const currentSubTotal = items.reduce((acc, item) => {
      // const lineTotal = item.price * item.quantity * (1 - item.discount / 100);
      const lineTotal = totalLineCalculator(item);
      return acc + lineTotal;
    }, 0);

    const invoiceDiscountValue =
      discountType === "%"
        ? (currentSubTotal * discount) / 100
        : discount;
    
    // const finalTotal = subTotal - invoiceDiscountValue
    const currentFinalTotal = currentSubTotal - invoiceDiscountValue + extraCost;
    const remain = currentFinalTotal - deposit - customerPaid;

    setSubTotal(currentSubTotal);
    setFinalTotal(currentFinalTotal);
    setRemainToPay(remain);
  }, [items, discount, discountType, extraCost, deposit, customerPaid]);

  useEffect(() => {
    calculateAllTotals();
  }, [calculateAllTotals]);

  const canEditItems = status === "ready_to_pick";
  const selectedShop = shops.find((shop) => shop.name === invoice?.branch);
  const paymentText = remainToPay < 0 ? "Tiền thừa trả khách" : "Còn phải trả";
  const paymentAmount = Math.abs(remainToPay);

  const handleUpdateInvoice = async () => {
    if (!invoice) return;
    try {
      const token = localStorage.getItem("access_token") || "";
      const mappedItems = items.map((it) => ({
        id: typeof it.id === "string" ? parseInt(it.id) : it.id,
        product_id: it.product?.id || it.product_id || "",
        quantity: it.quantity,
        price: it.price,
        discount: it.discount,
        discount_type: it.discount_type || "%"
      }));

      const payload = {
        status: invoice.status,
        payment_status: invoice.payment_status,
        discount,
        discount_type: discountType,
        deposit: invoice.deposit,
        note: invoiceNote,
        deposit_method: invoice.deposit_method,
        branch: invoice.branch,
        is_delivery: invoice.is_delivery,
        order_source: invoice.order_source,
        expected_delivery: expectedDelivery, 
        extraCost,
        items: mappedItems,

        service_items: invoice.service_items.map((si) => ({
          product_id: si.product_id,
          name: si.name,
          quantity: si.quantity,
          price: si.price,
          discount: si.discount,
        })),
      };

      console.log("Payload update:", payload);
      const updatedInvoice = await updateInvoice(token, invoiceId, payload);
      setInvoice(updatedInvoice);
      console.log("updated: ", updatedInvoice);
      setMessage("Cập nhật đơn hàng thành công!");
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (error: any) {
      setMessage(error.message || "Cập nhật đơn hàng thất bại!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  const handleConfirmInvoice = async () => {
    try {
      const token = localStorage.getItem("access_token") || "";
      await confirmInvoice(token, invoiceId);
      setMessage("Xác nhận thành công!");
      setMessageType("success");
      setDeposit(0);

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Không thể xác nhận đơn hàng");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  const handleCancelInvoice = async () => {
    try {
      const token = localStorage.getItem("access_token") || "";
      await cancelInvoice(token, invoiceId);
      setMessage("Xác nhận hủy thành công!");
      setMessageType("success");
      setDeposit(0);

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Không thể hủy đơn hàng");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const token = localStorage.getItem("access_token") || "";
      if (invoice?.customer?.id) {
        // await payCustomerAmount(token, invoice.customer.id, payAmount);
        await payCustomerTransaction(token, invoice.customer.id, invoiceId);
        setMessage("Thanh toán thành công!");
        setMessageType("success");
        // setIsButtonDisabled(true);
        setIsOpenModalPayment(false);
        const newDebt = invoice.customer.debt - invoice.deposit;
        setInvoice({
          ...invoice,
          deposit: 0,
          customer: {
            ...invoice.customer,
            debt: newDebt,
          },
        });
        setDeposit(0);
        setTimeout(() => {
          setMessage("");
          setIsOpenModalPayment(false);
        }, 1000);
      }
    } catch (err: any) {
      console.error("Lỗi khi thanh toán:", err);
      setMessage(err.message || "Thanh toán thất bại!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  const handleSearchProducts = async (value: string) => {
    setSearchTerm(value);
    try {
      const token = localStorage.getItem("access_token") || "";
      const { products } = await fetchProductsName(token, 0, 50, value);
      setSearchResults(products);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setItems((prev) => {
      const updatedItems = [...prev];

      const existingIndex = updatedItems.findIndex(
        (it) => it.product && it.product.id === product.id
      );
      if (existingIndex !== -1) {
        const existingItem = updatedItems[existingIndex];
        const newQty = existingItem.quantity + 1;
        updatedItems[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          total_line: newQty * existingItem.price * (1 - existingItem.discount / 100),
        };
      } else {
        const rawPrice = product.price_import || 0;
        const newItem: InvoiceItem = {
          id: -Date.now(),
          product,
          quantity: 1,
          price: rawPrice,
          discount: 0,
          total_line: rawPrice,
          barcode: "",
          name: product.name || "No Name",
        };
        updatedItems.push(newItem);
      }
      return updatedItems;
    });
    setSearchTerm(""); 
    setIsProductPopupVisible(false);
  };

  const handleChangeQuantity = (itemId: number, newValue: number) => {
    if (newValue < 0) return;
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          return { ...it, quantity: newValue };
        }
        return it;
      })
    );
  };

  const handleChangeDesposit = (newValue: number) => {
    if(!invoice || newValue < 0) return;
    
    setInvoice((prev:any) => {
      return {
        ...prev,
        deposit: newValue,
      };
    });
  };

  const handleChangeDiscount = (itemId: number, newDiscount: number) => {
    if (newDiscount < 0) return;
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          return { ...it, discount: newDiscount };
        }
        return it;
      })
    );
  };

  const handleChangeDiscountType = (itemId: number, newType: "%" | "VND") => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          return { ...it, discount_type: newType };
        }
        return it;
      })
    );
  };

  const handleRemoveItem = (itemId: number) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const totalLineCalculator = (item: InvoiceItem) => {
    if(item.discount_type === "VND") {
      return item.price * item.quantity - item.discount;
      
    }
    return item.price * item.quantity * (1 - item.discount / 100);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        <PopupSkeleton type="invoice" />
      </div>
    );
  }
  
  if(error) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <ErrorPage />
      </div>
    )
  }
  if (!isOpen) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
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
                <CheckCircleOutlined
                  style={{ color: "#1A73E8", fontSize: 20 }}
                />
              ) : (
                <ReportGmailerrorred
                  style={{ color: "#D93025", fontSize: 20 }}
                />
              )}
              <span>{message}</span>
              <CloseOutlined
                className="close-btn"
                style={{ fontSize: 16, cursor: "pointer", color: "#5F6368" }}
                onClick={() => setMessage("")}
              />
            </div>
          )}
          <div
            className={cn(
              "bg-[#F3F3F7] w-full xl:w-[90vw] 3xl:w-[78vw] rounded-xl p-1 relative flex flex-col",
              "xl:p-3 xl:max-h-[97vh] 3xl:p-6"
            )}
          >
            <div className="flex justify-between items-center pb-1">
              <div className="flex gap-4 items-center">
                <h2 className="font-semibold 2xl:text-xl text-black">
                  Chi Tiết Đơn Hàng #{invoiceId}
                </h2>
                {!!invoice && (
                  <p className="text-right text-[15px] font-normal leading-5 text-[#3C3C43B2]">
                    {invoice.created_at
                      ? `${new Date(invoice.created_at).toLocaleDateString(
                          "vi-VN"
                        )} • ${new Date(invoice.created_at).toLocaleTimeString(
                          "es-EN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hourCycle: "h23",
                          }
                        )}`
                      : "-"}
                  </p>
                )}

                {invoice && (
                  <div className="flex gap-2 items-center">
                    <PrintButtonInvoice invoice={invoice} shop={selectedShop} />
                    <span className="mx-[16px] text-gray-300">|</span>
                    <StatusBadge type="invoice_status" value={invoice.status} />
                    <StatusBadge
                      type="payment_status"
                      value={invoice.payment_status}
                    />
                  </div>
                )}
              </div>
              <button onClick={onClose} className="text-red-500 mb-4">
                <CloseOutlined fontSize="small" className="text-black" />
              </button>
            </div>

            {/* {loading && <p>Đang tải dữ liệu...</p>}
            {error && <p className="text-red-500">{error}</p>} */}

            {invoice && !loading && !error && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-2 2xl:mb-4">
                  <div className="bg-white border p-[8px] 2xl:p-[16px] rounded-2xl col-span-2 2xl:max-h-[380px] md:h-auto shadow-[0_2px_0_#D9D9D9]">
                    <h3 className="font-semibold mb-[8px] text-[15px]">
                      Thông tin khách hàng
                    </h3>
                    <div className="flex gap-2">
                      <div className="flex flex-col gap-2 border p-[8px] 2xl:p-[16px] rounded-[16px] w-1/2 2xl:max-h-[310px] h-auto">
                        <p
                          className={cn(
                            " text-[13px]   3xl:text-[15px] border-b flex items-center pb-1"
                            // "pb-[8px] mb-[8px] 2xl:pb-[16px] 2xl:mb-[12.5px]"
                          )}
                        >
                          <PersonOutlineOutlinedIcon className="text-gray-400 w-[20px] h-[20px] mr-[5px]" />
                          <strong className="line-clamp-1 max-w-[150px]">
                            {invoice.customer?.id !== "KH1"
                              ? invoice.customer.full_name
                              : "-"}
                            {/* {invoice?.customer?.full_name} */}
                          </strong>
                          <span className="mx-[16px] text-gray-300">|</span>
                          <LocalPhoneOutlined className="text-gray-400 w-[20px] h-[20px] mr-[5px]" />
                          <strong>
                            {invoice.customer?.id !== "KH1"
                              ? invoice.customer?.phone
                              : "-"}
                          </strong>
                        </p>
                        <div
                          className={cn(
                            "border-b cursor-pointer",
                            "flex flex-col gap-1 py-1 3xl:py-4"
                            // "pb-[8px] mb-[8px] 2xl:pb-[12.5px] 2xl:mb-[16px]"
                          )}
                          onClick={() => {
                            if (invoice?.customer?.id !== "KH1") {
                              setSelectedCustomerId(invoice.customer.id);
                              setIsEditCustomerOpen(true);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <RoomOutlined className="text-gray-400" />
                            <span className="text-black text-[13px]   3xl:text-[15px] font-medium">
                              Địa chỉ giao hàng
                            </span>
                          </div>
                          {/* <p className="font-bold  text-[13px]   3xl:text-[15px] line-clamp-1">
                            {invoice?.customer?.address}
                          </p> */}
                          <div className="flex items-center">
                            <DriveFileRenameOutlineOutlinedIcon className="text-[#0061FD] w-[20px] h-[20px]" />
                            <span className="text-black text-[13px]   3xl:text-[15px] font-semibold pl-[8px] line-clamp-1">
                              {invoice?.customer?.address || "-"}{" "}
                              {invoice?.customer?.ward_name || "-"}{" "}
                              {invoice?.customer?.district_name || "-"}{" "}
                              {invoice?.customer?.province || "-"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center space-x-2">
                            <RoomOutlined className="text-gray-500" />
                            <span className="text-gray-500 text-[13px]   3xl:text-[15px] font-medium">
                              Địa chỉ kho lấy hàng
                            </span>
                          </div>
                          <p className="font-bold text-[13px]   3xl:text-[15px] line-clamp-1">
                            {selectedShop
                              ? `${selectedShop.name} - ${selectedShop.phone}`
                              : "Lilas Maison - 0948413016"}
                          </p>
                          <div className="flex items-center">
                            <DriveFileRenameOutlineOutlinedIcon className="text-[#0061FD] w-[20px] h-[20px]" />
                            <span className="text-black text-[13px]   3xl:text-[15px] font-bold pl-[8px] line-clamp-1">
                              {selectedShop ? selectedShop.address : "75e Phố Thợ Nhuộm, Trần Hưng Đạo, Hoàn Kiếm, Hà Nội, Việt Nam"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border p-4 rounded-[16px] w-1/2 flex flex-col gap-1.5 justify-between">
                        <div className="flex items-center justify-between border-b 3xl:py-2">
                          <span className="text-[#242428] font-normal text-[13px] 3xl:text-[15px]">
                            Nợ phải trả
                          </span>
                          <span className="text-[#E50000] font-semibold text-[13px] 3xl:text-[15px]">
                            {invoice?.customer?.debt?.toLocaleString("en-ES") ||
                              0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[13px] 3xl:text-[15px] border-b 3xl:py-2">
                          <span className="text-[#242428] font-normal">
                            Điểm tích lũy
                          </span>
                          <span className="text-black font-semibold text-[13px] 3xl:text-[15px]">
                            0 điểm
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b 3xl:py-2">
                          <span className="text-[#242428] font-normal text-[13px] 3xl:text-[15px]">
                            Tổng chi tiêu (
                            <span className="text-[#0061FD] text-[13px] 3xl:text-[15px]">
                              {invoice?.customer?.total_order || "0"}
                            </span>{" "}
                            đơn)
                          </span>
                          <span className="text-[#0061FD] font-semibold text-[13px] 3xl:text-[15px]">
                            {invoice?.customer?.total_spending?.toLocaleString(
                              "en-ES"
                            ) || "0"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[13px] 3xl:text-[15px] border-b 3xl:py-2">
                          <span className="text-[#242428] font-normal text-[13px] 3xl:text-[15px]">
                            Trả hàng (<span className="text-[#E50000]">{invoice?.customer?.total_return_orders || "0"}</span>{" "}
                            <span className="text-[#242428] text-[13px] 3xl:text-[15px]">
                              đơn
                            </span>
                            )
                          </span>
                          <span className="text-[#E50000] font-semibold text-[13px] 3xl:text-[15px]">
                            {invoice?.customer?.total_return_spending?.toLocaleString(
                              "en-ES"
                            ) || "0"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[13px] 3xl:text-[15px] 3xl:py-2">
                          <span className="text-[#242428] font-normal text-[13px] 3xl:text-[15px]">
                            Nhóm khách hàng
                          </span>
                          <span className="text-black font-semibold">
                            {invoice.customer?.id !== "KH1"
                              ? invoice?.customer?.group?.name || "Khách lẻ"
                              : "-"}
                          </span>
                        </div>
                        <button
                          className={clsx(
                            "w-full py-2 rounded-md font-semibold  text-[13px] 2xl:text-md",
                            // isButtonDisabled || invoice.status !== "returned"
                            invoice.status !== "returned" || invoice.deposit == 0
                              ? "bg-gray-500 text-white cursor-not-allowed opacity-50"
                              : "bg-blue-500 hover:bg-blue-700 text-white"
                          )}
                          // disabled={isButtonDisabled || invoice.status !== "returned"}
                          disabled={invoice.status !== "returned" || invoice.deposit == 0}
                          onClick={() => setIsOpenModalPayment(true)}
                        >
                          {invoice.status !== "returned" || invoice.deposit == 0
                            ? "Thanh toán"
                            : `Xác nhận thanh toán cọc ${invoice?.deposit.toLocaleString("en-ES")}`}
                        </button>
                        {/* <PaymentModal
                          title={invoice?.customer?.full_name}
                          isOpen={isOpenModalPayment}
                          onClose={() => setIsOpenModalPayment(false)}
                          onConfirm={handleConfirmPayment}
                        /> */}
                        <PopupPayment
                          isOpen={isOpenModalPayment}
                          onClose={() => setIsOpenModalPayment(false)}
                          onConfirm={handleConfirmPayment}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border p-2 2xl:p-4 rounded-[16px] bg-white shadow-[0_2px_0_#D9D9D9] flex flex-col gap-2">
                    <h3 className="font-semibold text-[15px]">
                      Thông tin đơn hàng
                    </h3>
                    <div className="flex flex-col justify-evenly h-full">
                      <div className="grid grid-cols-2 gap-1 items-center">
                        <p className="text-[#242428] self-center  text-[13px]  3xl:text-[15px]">
                          Bán tại
                        </p>
                        <input
                          type="text"
                          defaultValue={invoice?.branch || ""}
                          disabled
                          className="border border-[rgba(60,60,67,0.35)] text-black px-[4px] 2xl:px-[8px] py-1 w-full rounded-[8px] text-right bg-gray-100 text-[13px]  3xl:text-[15px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-1 items-center">
                        <p className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                          Bán bởi
                        </p>
                        <p className="font-semibold text-black text-right  text-[13px]   3xl:text-[15px]">
                          {invoice.user?.full_name || "-"}
                        </p>
                      </div>

                      {/* <div className="grid grid-cols-2 gap-1 items-center">
                        <p className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                          Ngày bán
                        </p>
                        <p className="font-semibold text-black text-right  text-[13px]   3xl:text-[15px]">
                          {invoice.created_at
                            ? new Date(invoice.created_at).toLocaleString(
                                "vi-VN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )
                            : ""}
                        </p>
                      </div> */}

                      <div className="grid grid-cols-2 gap-1 items-center">
                        <p className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                          Ghi chú
                        </p>
                        <input
                          data-tooltip-id="note-tooltip"
                          data-tooltip-content={invoiceNote}
                          type="text"
                          placeholder="Chưa ghi chú"
                          value={invoiceNote}
                          disabled={status !== "ready_to_pick"}
                          onChange={(e) => setInvoiceNote(e.target.value)}
                          className={`text-[13px]  3xl:text-[15px] border border-[rgba(60,60,67,0.35)] w-full px-[4px] 2xl:px-[8px] py-1 rounded-[8px] text-right 
                            ${
                              status === "ready_to_pick"
                                ? "bg-white text-black"
                                : "bg-gray-100"
                            }`}
                        />
                        <Tooltip
                              id="note-tooltip"
                              place="top-start"
                              opacity={1.0}
                              className="z-10"
                            />
                      </div>

                      <div className="grid grid-cols-2 gap-1 items-center">
                        <p className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                          Nguồn
                        </p>
                        <p className="font-semibold text-black text-right  text-[13px]   3xl:text-[15px]">
                          {invoice.order_source || "-"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-1 items-center">
                        <p className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                          Ngày hẹn giao
                        </p>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            className={
                              status === "ready_to_pick"
                                ? "bg-white text-black"
                                : "bg-gray-100 text-gray-400"
                            }
                            value={expectedDelivery}
                            disabled={status !== "ready_to_pick"}
                            onChange={(newValue) =>
                              setExpectedDelivery(newValue)
                            }
                            format="DD/MM/YYYY"
                            slotProps={{
                              textField: {
                                variant: "outlined",
                                fullWidth: true,
                                size: "small",
                                InputProps: {
                                  sx: {
                                    borderRadius: "8px",
                                    textAlign: "right",
                                    display: "flex",
                                    alignItems: "center",
                                    // paddingRight: "8px",
                                    // paddingLeft: "8px",
                                    paddingX: "8px",
                                    gap: "2px",
                                    fontWeight: "500",
                                    fontSize: "15px",
                                    color: "#000",
                                  },
                                },
                                inputProps: {
                                  className:
                                    "text-right pr-0 focus:ring-0 !py-[7.5px]",
                                },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </div>

                      <div className="grid grid-cols-2 gap-1 items-center">
                        <p className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                          Trạng thái vận chuyển
                        </p>
                        {invoice.status !== "ready_to_pick" && invoice.is_delivery === true && (
                          <div className="flex justify-end">
                            <StatusBadge
                              type="delivery_status"
                              value={invoice.status}
                            />
                            <Tooltip
                              id="badge-tooltip"
                              place="top-start"
                              opacity={1.0}
                              className="z-10"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* <div className="grid grid-cols-2 gap-y-[5px] 2xl:gap-y-2 gap-x-1 2xl:gap-x-6">
                      <div className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                        Bán tại
                      </div>
                      <div>
                        <input
                          type="text"
                          defaultValue={invoice?.branch || ""}
                          disabled
                          className="border border-[rgba(60,60,67,0.35)] text-black !pr-8 px-[4px] 2xl:px-[8px] 2xl:py-[7px] py-1 w-full rounded-[8px] text-right bg-gray-100"
                        />
                      </div>
                      <div className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                        Bán bởi
                      </div>
                      <div className="font-semibold text-black text-right  text-[13px]   3xl:text-[15px]">
                        {invoice.user?.full_name || "-"}
                      </div>
                      <div className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                        Ngày bán
                      </div>
                      <div className="font-semibold text-black text-right  text-[13px]   3xl:text-[15px]">
                        {invoice.created_at
                          ? new Date(invoice.created_at).toLocaleString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )
                          : ""}
                      </div>
                      <div className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                        Ghi chú
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Chưa ghi chú"
                          value={invoiceNote}
                          disabled={status !== "ready_to_pick"}
                          onChange={(e) => setInvoiceNote(e.target.value)}
                          className={`border border-[rgba(60,60,67,0.35)] w-full !pr-9 px-[4px] 2xl:px-[8px] py-[4.5px] 2xl:py-[7px] rounded-[8px] text-right 
                            ${
                              status === "ready_to_pick"
                                ? "bg-white text-black"
                                : "bg-gray-100 text-gray-400"
                            }`}
                        />
                        <EditOutlined className="absolute top-[8px] right-2 text-gray-400" />
                      </div>
                      <div className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                        Nguồn
                      </div>
                      <div className="font-semibold text-black text-right  text-[13px]   3xl:text-[15px]">
                        {invoice.delivery_partner || "-"}
                      </div>
                      <div className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                        Ngày hẹn giao
                      </div>
                      <div className="relative">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            className={
                              status === "ready_to_pick"
                                ? "bg-white text-black"
                                : "bg-gray-100 text-gray-400"
                            }
                            value={expectedDelivery}
                            disabled={status !== "ready_to_pick"}
                            onChange={(newValue) =>
                              setExpectedDelivery(newValue)
                            }
                            format="DD/MM/YYYY"
                            slotProps={{
                              textField: {
                                variant: "outlined",
                                fullWidth: true,
                                size: "small",
                                InputProps: {
                                  sx: {
                                    borderRadius: "8px",
                                    textAlign: "right",
                                    display: "flex",
                                    alignItems: "center",
                                    paddingRight: "8px",
                                    paddingLeft: "8px",
                                    gap: "2px",
                                    fontWeight: "500",
                                    color: "#000",
                                  },
                                },
                                inputProps: {
                                  className: "text-right pr-0 focus:ring-0",
                                },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </div>
                      <div className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                        Trạng thái vận chuyển
                      </div>
                      <div className="flex items-center justify-end  text-[13px]   3xl:text-[15px]">
                        {invoice.status !== "ready_to_pick" && (
                          <StatusBadge
                            type="delivery_status"
                            value={invoice.status}
                          />
                        )}
                      </div>
                    </div> */}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 2xl:gap-4">
                  <div className="max-h-[222px] 2xl:max-h-[267px] 3xl:max-h-[320px] col-span-9 col-start-1 border p-2 2xl:p-4 rounded-[16px] h-auto bg-white relative shadow-[0_2px_0_#D9D9D9]">
                    <h3 className="font-semibold mb-2 text-[15px]">
                      Thông tin sản phẩm
                    </h3>
                    {status === "ready_to_pick" && (
                      <div className="mb-3 relative">
                        <SearchOutlined
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                          sx={{
                            fontSize: 20,
                          }}
                        />
                        <input
                          placeholder="Tìm kiếm sản phẩm..."
                          className="bg-[#E9ECF2] border-none px-10 w-full rounded-md h-8 placeholder:text-[13px] 3xl:placeholder:text-[15px] text-[13px] 3xl:text-[15px]"
                          value={searchTerm}
                          onFocus={() => {
                            handleSearchProducts("");
                            setIsProductPopupVisible(true);
                          }}
                          onChange={(e) => {
                            setIsProductPopupVisible(true);
                            handleSearchProducts(e.target.value);
                          }}
                        />
                        {isProductPopupVisible && (
                          <div className="absolute w-full left-0 top-10 z-10">
                            <PopupSearchProducts
                              products={searchResults}
                              onSelectProduct={handleSelectProduct}
                              onClose={() => setIsProductPopupVisible(false)}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`mt-4 ${
                        status !== "ready_to_pick"
                          ? "max-h-[170px] 2xl:max-h-[200px] 3xl:max-h-[250px]"
                          : "max-h-[120px] 2xl:max-h-[150px] 3xl:max-h-[200px]"
                      } overflow-y-auto scrollbar-hidden`}
                    >
                      {items.length > 0 ? (
                        <table className="w-full table-fixed  text-[13px]   3xl:text-[15px]">
                          <thead className="h-8 ant-table-thead bg-[#ededf0] sticky top-0">
                            <tr>
                              <th className="sticky top-0 ant-table-cell w-[40px] rounded-tl-md">
                                STT
                              </th>
                              <th className="sticky top-0 ant-table-cell w-[80px]">
                                Ảnh
                              </th>
                              <th className="sticky top-0 ant-table-cell w-[200px]">
                                Tên sản phẩm
                              </th>
                              <th className="sticky top-0 ant-table-cell w-[80px]">
                                SL
                              </th>
                              <th className="sticky top-0 ant-table-cell w-[90px]">
                                Đơn giá
                              </th>
                              <th className="sticky top-0 ant-table-cell w-[110px]">
                                Chiết khấu
                              </th>
                              <th className="px-2 sticky top-0 ant-table-cell w-[100px] text-right">
                                Thành tiền
                              </th>
                              <th className="sticky top-0 ant-table-cell w-[40px] rounded-tr-md" />
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => {
                              // const lineTotal = 
                              //   item.price *
                              //   item.quantity *
                              //   (1 - item.discount / 100);

                              const lineTotal = totalLineCalculator(item);

                              return (
                                <tr
                                  key={item.id}
                                  className="hover:bg-gray-50 border-b cursor-pointer max-h-8"
                                >
                                  <td className="p-2 text-center">{idx + 1}</td>
                                  <td>
                                    <div className="flex justify-center p-1">
                                      <Image
                                        src={
                                          item.product?.image_url ||
                                          (item.product?.images?.[0]?.url
                                            ? `${process.env.NEXT_PUBLIC_DEV_API}${item.product?.images[0].url}`
                                            : "/customers/dich-vu.png")
                                        }
                                        alt="Product"
                                        width={40}
                                        height={40}
                                        className="object-cover rounded-lg size-8"
                                      />
                                    </div>
                                  </td>
                                  <td className="text-left">
                                    <p
                                      className="line-clamp-2 break-all"
                                      data-tooltip-id="product-name"
                                      data-tooltip-content={
                                        item.product?.name || item.name
                                      }
                                    >
                                      {item.product?.name || item.name}
                                    </p>
                                    <Tooltip id="product-name" place="top" />
                                  </td>
                                  <td className="text-center">
                                    <input
                                      type="number"
                                      className="border w-16 h-8 rounded-md text-center text-[13px] 3xl:text-[15px]"
                                      disabled={!canEditItems}
                                      value={item.quantity}
                                      onChange={(e) => {
                                        let value = e.target.value.replace(
                                          /\D/g,
                                          ""
                                        );
                                        if (value.length > 9) {
                                          value = value.slice(0, 9);
                                        }
                                        handleChangeQuantity(
                                          Number(item.id),
                                          Number(value)
                                        );
                                      }}
                                      onInput={(
                                        e: React.FormEvent<HTMLInputElement>
                                      ) => {
                                        const target = e.currentTarget;
                                        if (target.value.length > 9) {
                                          target.value = target.value.slice(
                                            0,
                                            9
                                          );
                                        }
                                      }}
                                    />
                                  </td>
                                  <td className="p-2 text-center">
                                    {item.price.toLocaleString("en-ES")}
                                  </td>
                                  <td className="p-2 text-center">
                                    {/* discount input */}
                                    <div className="flex flex-row items-center">
                                    <input
                                      type="text"
                                      className="border w-full h-8 rounded-l-md text-center text-[13px] 3xl:text-[15px]"
                                      disabled={!canEditItems}
                                      value={item.discount.toLocaleString("en-ES")}
                                      onChange={(e) => {
                                        const value = Number(
                                          e.target.value.replace(/\D/g, "")
                                        );
                                        let parsed = Number(value);
                                        if (parsed < 0) parsed = 0;

                                        const maxValue = item.discount_type === "VND" ? item.price : 100;
                                        if (parsed > maxValue) {
                                          parsed = maxValue;
                                        }
                                        
                                        handleChangeDiscount(
                                          Number(item.id),
                                          parsed
                                        );
                                      }}
                                    />
                                    <button
                                      className="bg-gray-500/50 px-1 py-0 rounded-r-md h-8"
                                      disabled={!canEditItems}
                                      onClick={() => {
                                        handleChangeDiscount(Number(item.id), 0);
                                        handleChangeDiscountType(Number(item.id),
                                        !item.discount_type ? "VND" :
                                          item.discount_type === "%" ? "VND" : "%"
                                      );
                                      }}
                                    >
                                      {item.discount_type || "%"}
                                    </button>
                                    </div>
                                  </td>
                                  <td className="p-2 text-right font-semibold">
                                    {lineTotal.toLocaleString("en-ES")}
                                  </td>
                                  <td className="p-2 text-center">
                                    {canEditItems && (
                                      <button
                                        className="text-red-600"
                                        onClick={() =>
                                          handleRemoveItem(Number(item.id))
                                        }
                                      >
                                        <DeleteForeverOutlined />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                          <NoData
                            message="Chưa có thông tin sản phẩm"
                            className="[&_img]:max-w-[57px] [&_p]:!text-[15px]"
                          />
                          <a
                            href="#"
                            className="text-blue-500 text-[12px] leading-4 mt-1"
                          >
                            <LiveHelpOutlined className="w-[16px]" /> Chọn thanh
                            tìm kiếm để chọn sản phẩm
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "col-span-3 border p-[8px] 2xl:p-[16px] rounded-[16px] bg-white shadow-[0_2px_0_#D9D9D9]",
                      "flex flex-col gap-1 2xl:gap-2"
                    )}
                  >
                    <div className="flex flex-row justify-between border-b pb-1">
                      <h3 className="font-bold mr-1 text-[15px] leading-[22px] line-clamp-1">
                        Tổng tiền{" "}
                        <span className="text-[#3C3C43B2]  text-[13px]">(</span>
                        <span className="text-[#338BFF]  text-[13px]">
                          {items
                            .reduce((acc, it) => acc + it.quantity, 0)
                            .toLocaleString("en-ES")}
                        </span>
                        <span className="text-[#3C3C43B2]  text-[13px]">
                          {" "}
                          sản phẩm)
                        </span>
                      </h3>
                      <h3 className="font-semibold leading-[22px] text-[15px]">
                        {finalTotal.toLocaleString("en-ES")}
                      </h3>
                    </div>

                    <div className="flex flex-row justify-between">
                      <p className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                        Thêm chi phí
                      </p>
                      <input
                        type="text"
                        className="w-[150px] p-1 text-right px-[4px] py-[4.5px] 2xl:py-[7px] rounded-md h-8 bg-[#77777E1A] border-[#77777E1A]"
                        placeholder="0"
                        maxLength={15}
                        disabled={status !== "ready_to_pick"}
                        value={extraCost.toLocaleString("en-ES")}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setExtraCost(Number(val));
                        }}
                      />
                    </div>
                    <div className="flex flex-row justify-between">
                      <p className="text-[#242428] self-center  text-[13px]   3xl:text-[15px]">
                        Chiết khấu hoàn đơn
                      </p>
                      <div
                        id="ticket-container"
                        className={`relative flex items-center justify-center h-8 ${
                          discount > 0 ? "bg-[#3AA207]" : "bg-gray-300"
                        } text-white font-bold rounded-[4px] pr-[10px] overflow-hidden`}
                        style={{
                          width:
                            invoice?.discount_type === "%" ? "60px" : "100px",
                        }}
                      >
                        <div className="absolute w-[7px] h-[13px] bg-white left-0 rounded-r-full"></div>
                        <div className="absolute w-[7px] h-[13px] bg-white right-0 rounded-l-full"></div>
                        <input
                          type="text"
                          className="bg-transparent text-center z-10 font-bold outline-none focus:outline-none appearance-none text-[15px] placeholder:text-white border-transparent"
                          placeholder="0"
                          maxLength={discountType === "%" ? 3 : 12}
                          disabled={status !== "ready_to_pick"}
                          value={discount.toLocaleString("en-ES")}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            if (discountType === "%") {
                              val = Math.min(100, Number(val)).toString();
                            } else {
                              val = Math.min(
                                99999999999,
                                Number(val)
                              ).toString();
                            }
                            setDiscount(Number(val));
                          }}
                          onInput={(e) => {
                            const inputVal = (e.target as HTMLInputElement)
                              .value;
                            const container =
                              document.getElementById("ticket-container");
                            if (container) {
                              const lengthLimit = discountType === "%" ? 3 : 11;
                              const currentLength = Math.min(
                                inputVal.length,
                                lengthLimit
                              );
                              container.style.width = `${
                                currentLength * 10 + 40
                              }px`;
                            }
                          }}
                        />
                        <span className="absolute right-2">
                          {discountType === "%" ? "%" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2  text-[13px]   3xl:text-[15px] justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold">Tiền khách cọc</span>
                        <Select
                          options={[
                            { value: "cash", label: "Tiền mặt" },
                            { value: "bank", label: "Chuyển khoản" },
                            { value: "pos", label: "POS" },
                          ]}
                          onSelect={() => {}}
                          defaultValue={invoice.deposit_method}
                          btnClassName="!bg-transparent !text-gray-600 !p-0 text-xs   hover:!border-transparent"
                          wrapperClassName="!max-w-[116px] 2xl:!max-w-[120px] !min-w-[116px] -mt-1 2xl:-mt-0"
                          iconSize={14}
                        />
                      </div>

                      <input
                        type="text"
                        className="w-[150px] text-right px-[4px] py-[4.5px] 2xl:py-[7px] rounded-md bg-[#77777E1A] border-[#77777E1A] justify-self-end h-8"
                        placeholder="0.00"
                        maxLength={15}
                        disabled={status !== "ready_to_pick"}
                        value={deposit.toLocaleString("en-ES")}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setDeposit(Number(val));
                          handleChangeDesposit(Number(val));
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2  text-[13px]   3xl:text-[15px] justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold">Khách thanh toán</span>
                        <Select
                          options={[
                            { value: "cash", label: "Tiền mặt" },
                            { value: "bank", label: "Chuyển khoản" },
                            { value: "pos", label: "POS" },
                          ]}
                          onSelect={() => {}}
                          defaultValue="bank"
                          btnClassName="!bg-transparent !text-gray-600 !p-0 text-xs   hover:!border-transparent"
                          wrapperClassName="!max-w-[116px] 2xl:!max-w-[120px] !min-w-[116px] -mt-1 2xl:-mt-0"
                          iconSize={14}
                        />
                      </div>

                      <input
                        type="text"
                        className="w-[150px] text-right px-[4px] py-[4.5px] 2xl:py-[7px] rounded-md bg-[#77777E1A] border-[#77777E1A] justify-self-end h-8"
                        placeholder="0.00"
                        maxLength={15}
                        disabled={status !== "ready_to_pick"}
                        value={customerPaid.toLocaleString("en-ES")}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setCustomerPaid(Number(val));
                        }}
                      />
                    </div>

                    <div className="flex h-full items-end">
                      <div className="w-full flex flex-row justify-between text-red-500 text-[15px] font-semibold border-t pt-1">
                        <p>{paymentText}:</p>
                        <p>{paymentAmount.toLocaleString("en-ES")}</p>
                      </div>
                    </div>

                    
                  </div>
                </div>

                {status === "ready_to_pick" && (
                  <div className="mt-2 2xl:mt-4 flex justify-end gap-2 h-fit">
                    <button
                      onClick={handleCancelInvoice}
                      className="text-white bg-[#E50000] py-1.5  text-[13px]   3xl:text-[15px] px-4 rounded-lg"
                    >
                      Hủy đơn hàng
                    </button>
                    <button
                      onClick={() => setIsCreateFormOpen(true)}
                      className="bg-transparent text-[#338BFF] border border-[#338BFF] py-1.5  text-[13px]   3xl:text-[15px] px-4 rounded-lg"
                    >
                      Tạo đơn vận chuyển
                    </button>
                    <button
                      onClick={handleConfirmInvoice}
                      className="text-green-700 border border-green-500 bg-transparent py-1.5 text-[13px] 3xl:text-[15px] px-4 rounded-lg"
                    >
                      Xác nhận hoàn thành
                    </button>
                    <button
                      disabled={!canEditItems}
                      onClick={handleUpdateInvoice}
                      className={`py-1.5  text-[13px]   3xl:text-[15px] px-4 rounded-md ${
                        !canEditItems
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      Lưu đơn hàng
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {invoice && (
        <CreateTransportForm
          isOpen={isCreateFormOpen}
          onClose={() => setIsCreateFormOpen(false)}
          invoiceId={invoiceId}
          customerName={invoice?.customer?.full_name}
          customerPhone={invoice?.customer?.phone || ""}
          customerAddress={invoice?.customer?.address || ""}
          customerWardName={invoice?.customer?.ward_name || ""}
          customerDistrictName={invoice?.customer?.district_name || ""}
          customerProvince={invoice?.customer?.province || ""}
          customerWardCode={invoice?.customer?.ward_code || ""}
          customerDistrictId={invoice?.customer?.district_id || 0}
          codToPaid={paymentAmount}
        />
      )}
      {isEditCustomerOpen && (
        <PopupEditCustomer
          isOpen={isEditCustomerOpen}
          onClose={() => setIsEditCustomerOpen(false)}
          customerId={selectedCustomerId}
          onSaved={(updatedCustomer) => {
            setIsEditCustomerOpen(false);
            setInvoice((prev) =>
              prev ? { ...prev, customer: updatedCustomer } : null
            );
          }}
        />
      )}
    </>
  );
}