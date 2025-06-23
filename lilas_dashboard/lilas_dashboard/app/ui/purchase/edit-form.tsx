"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  getPurchaseById,
  updatePurchase,
  cancelPurchase,
  updateSupplier,
  fetchEmployeeData,
  fetchProducts,
  fetchProductsNameImport,
  confirmImportBill,
  fetchSuppliersData,
  payImportBill,
} from "@/app/lib/data";
import { Purchase, Supplier, PurchaseItem, Product, Employee } from "@/app/lib/definitions";
import InspectionStatusBadge from "@/app/ui/status";
import PopupSuppliers from "@/app/components/PopupSuppliers";
import {
  ArrowDropDownOutlined,
  DeleteForeverOutlined,
  CloseOutlined,
  CheckCircle,
  CalendarToday,
  FmdGoodOutlined,
  StoreOutlined,
  ErrorOutline,
  IosShareOutlined,
  LocalPrintshopOutlined,
  ReportGmailerrorred,
  CheckCircleOutlined,
  ArrowDropDown,
  LiveHelpOutlined,
} from "@mui/icons-material";

import PopupSearchProducts from "@/app/components/PopupSearchProducts";
import PopupEmployees from "@/app/components/PopupEmployees";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import PopupDelete from "@/app/components/PopupDelete";
import PaymentModal from "../payment";
import Select from "../select";
import { Tooltip } from "react-tooltip";
import NoData from "@/app/components/NoData";
import { fontSize } from "suneditor/src/plugins";
import PopupSkeleton from "@/app/components/PopupSkeleton";

interface PopupEditPurchaseProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseId: string;
  onSaved: (updated: Purchase) => void;
}

export default function PopupEditPurchase({
  isOpen,
  onClose,
  purchaseId,
  onSaved,
}: PopupEditPurchaseProps) {
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(false);

  // local states for editing
  const [branch, setBranch] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [extraFee, setExtraFee] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [pricePolicy, setPricePolicy] = useState<string>();
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [employeeName, setEmployeeName] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isEmployeePopupVisible, setIsEmployeePopupVisible] = useState(false);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [employeeResults, setEmployeeResults] = useState<Employee[]>([]);
  const [isProductPopupVisible, setIsProductPopupVisible] = useState(false);
  const [isPayPopupOpen, setIsPayPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);

  const [showReturnTable, setShowReturnTable] = useState(false);


  const [isSupplierPopupVisible, setIsSupplierPopupVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierName, setSupplierName] = useState("");
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
    const [supplierResults, setSupplierResults] = useState<Supplier[]>([]);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token") || "";
        const data = await getPurchaseById(token, purchaseId);
        console.log("Purchase Data:", data);
        setPurchase(data);
        setBranch(data.branch || "");
        setNote(data.note || "");
        setStatus(data.status || "");
        setDiscount(data.discount || 0);
        setExtraFee(data.extra_fee || 0);
        setPaidAmount(data.paid_amount || 0);
        setItems(data.items);

        if (data.items.length > 0) {
          const firstItem = data.items[0];
          if (firstItem.price === firstItem.product?.price_retail) {
            setPricePolicy("Giá lẻ");
          } else if (firstItem.price === firstItem.product?.price_wholesale) {
            setPricePolicy("Giá buôn");
          } else {
            setPricePolicy("Giá nhập");
          }
        }

        if (data.delivery_date) {
          setDeliveryDate(data.delivery_date.split("T")[0]);
        }
        if (data.updated_at) {
          const d = new Date(data.updated_at).toLocaleString("vi-VN");
          setLastUpdated(d);
        }
        if (data.supplier) {
          setSelectedSupplier(data.supplier);
          setSupplierName(data.supplier.contact_name);
        }
        if (data.user_id) {
          const empToken = localStorage.getItem("access_token") || "";
          const employees = await fetchEmployeeData(empToken, 50, 1);
          const found = employees.users.find((u) => u.id === data.user_id);
          if (found) {
            setSelectedEmployeeId(found.id);
            setEmployeeName(found.full_name);
          }
        }
      } catch (err: any) {
        console.error(err);
        setMessage(err.message);
        setMessageType("error")
        setTimeout(() => {
          setMessage("");
        }, 5000);;
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isOpen, purchaseId]);

  const updateItemsPrice = useCallback(() => {
    setItems((prevItems) =>
      prevItems.map((it) => {
        const newPrice =
          pricePolicy === "Giá lẻ" ? it.product?.price_retail ?? it.price :
            pricePolicy === "Giá buôn" ? it.product?.price_wholesale ?? it.price :
              // it.product?.price_import ?? it.price;
              it.price;
        return {
          ...it,
          price: newPrice,
          total_line: it.quantity * newPrice * (1 - it.discount / 100),
        };
      })
    );
  }, [pricePolicy]);

  useEffect(() => {
    updateItemsPrice();
  }, [pricePolicy, updateItemsPrice]);

  const handleSupplierSearchChange = async (term: string) => {
      setSupplierSearchTerm(term);
      try {
        const token = localStorage.getItem("access_token") || "";
        const { suppliers } = await fetchSuppliersData(token, 50, 1, term);
        setSupplierResults(suppliers);
      } catch (err) {
        console.error(err);
      }
    };

  const subTotal = items.reduce((acc, it) => acc + it.total_line, 0);
  const grandTotal = subTotal * (1 - discount / 100) + extraFee;
  const remainToPay = Math.max(0, grandTotal - paidAmount);
  const canEditItems = status === "pending";

  useEffect(() => {
    if (status === "received_unpaid" && paidAmount >= grandTotal) {
      setStatus("received_paid");
    } else if (status === "pending" && paidAmount > 0 && paidAmount < grandTotal) {
      setStatus("pending");
    }
  }, [paidAmount, grandTotal, status]);

  if (!isOpen || !purchase) return null;

  const handleSearchChange = async (value: string) => {
    setSearchTerm(value);
    if (!value) {
      try {
        setLoadingProducts(true);
        const token = localStorage.getItem("access_token") || "";
        const { products } = await fetchProductsNameImport(token, 0, 50, "");
        setSearchResults(products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingProducts(false);
      }
      return;
    }
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem("access_token") || "";
      const { products } = await fetchProductsNameImport(token, 0, 50, value);
      setSearchResults(products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    if (!canEditItems) return;
    setItems((prev) => {
      const updated = [...prev];
      const existingIndex = updated.findIndex((x) => x.product_id === product.id);
      if (existingIndex !== -1) {
        const existingItem = updated[existingIndex];
        const newQty = existingItem.quantity + 1;
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          total_line: newQty * existingItem.price * (1 - existingItem.discount / 100),
        };
      } else {
        const newItem: PurchaseItem = {
          id: Date.now(),
          product_id: product.id,
          product: product,
          product_image_url: product.image_url || "",
          product_name: product.name || "No Name",
          quantity: 1,
          price: product.price_import,
          discount: 0,
          total_line: product.price_import,
        };
        updated.push(newItem);
      }
      return updated;
    });
  };

  const handleUpdateItem = (index: number, field: string, value: number) => {
    if (!canEditItems) return;
    setItems((prev) =>
      prev.map((it, i) => {
        if (i === index) {
          const newIt = { ...it } as PurchaseItem;
          (newIt as any)[field] = value;

          const raw = newIt.quantity * newIt.price;
          const discountValue = raw * (newIt.discount / 100);
          newIt.total_line = raw - discountValue;
          return newIt;
        }
        return it;
      })
    );
  };

  const handleRemoveItem = (index: number) => {
    if (!canEditItems) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const dualButtonFunction = async () => {
    const success = await handleSave();
    if (success) {
      await handleImport();
    }
  };

  const handleSave = async () => {
    if (!purchase || !selectedSupplier || items.length === 0) {
      setMessage("Kiểm tra thông tin nhà cung cấp và sản phẩm trước khi lưu.");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return false;
    }

    //check if any item has price = 0
    if(items.some((it) => it.price === 0)){
      setMessage("Kiểm tra giá nhập của sản phẩm trước khi lưu.");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return false;
    }

    
    try {
      const token = localStorage.getItem("access_token") || "";
      const payload: any = {
        branch,
        note,
        discount,
        extra_fee: extraFee,
        status,
        // supplier_id: selectedSupplier ? selectedSupplier.id : null,
        supplier_id: selectedSupplier.id,
        items: items.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          price: it.price,
          discount: it.discount,
        })),
      };
      if (canEditItems) {
        payload.items = items.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          price: it.price,
          discount: it.discount,
        }));
      }

      if (selectedEmployeeId) {
        payload.user_id = selectedEmployeeId;
      }
      if (deliveryDate) {
        payload.delivery_date = new Date(deliveryDate);
      }

      const updated = await updatePurchase(token, purchaseId, payload);
      console.log("payload:", payload)
      console.log("Updated purchase:", updated);
      setStatus(updated.status);
      setPurchase(updated);
      onSaved(updated);
      setMessage("Lưu chỉnh sửa thành công!");
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      // setTimeout(() => {
      //   onClose();
      //   window.location.reload();
      // }, 2000)
      return true;
    } catch (err: any) {
      console.error("Update purchase error: ", err.message);
      setMessage(`Lỗi: ${err.message}`);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  const handleCancelBill = async () => {
    if (!purchase) return;
    
    try {
      // if (!confirm("Bạn chắc chắn muốn hủy phiếu này?")) return;
      const token = localStorage.getItem("access_token") || "";
      const data = await cancelPurchase(token, purchaseId);
      setPurchase(data);
      setStatus(data.status);
      onSaved(data);
      setMessage("Hủy phiếu thành công!");
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (err: any) {
      
      console.error(err);
      setMessage(err.message);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  const handleImport = async () => {
    if (!purchase) return;
    if (status !== "pending") return;

    try {
      const token = localStorage.getItem("access_token") || "";
      const updated = await confirmImportBill(token, purchaseId);
      setPurchase(updated);
      setPaidAmount(updated.paid_amount);
      setStatus(updated.status);
      if (updated.supplier) {
        setSelectedSupplier(updated.supplier);
        setSupplierName(updated.supplier.contact_name);
      }
      
      onSaved(updated);
      setMessage("Đơn hàng đã nhập kho!");
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  // const dualButtonFunction = async () => {
  //   handleSave();
  //   handleImport();
  // };

  const handleOpenPayPopup = () => {
    setIsPayPopupOpen(true);
    setPayAmount(0);
  };

  const handleConfirmPay = async (payAmount: number) => {
    console.log("Confirm pay", payAmount);
    if (!purchase?.supplier) {
      setMessage("Không có thông tin NCC.");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }
    if (payAmount <= 0) {
      setMessage("Số tiền thanh toán phải lớn hơn 0");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }
    try {
      const token = localStorage.getItem("access_token") || "";
      await payImportBill(token, purchase.id, payAmount);
      const updatedPurchase = await getPurchaseById(token, purchaseId);
      setPurchase(updatedPurchase);
      setPaidAmount(updatedPurchase.paid_amount);
      setStatus(updatedPurchase.status);
      setSelectedSupplier(updatedPurchase.supplier || null);
      setSupplierName(updatedPurchase.supplier?.contact_name || "");
      onSaved(updatedPurchase);
      
      setMessage("Thanh toán thành công!");
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
      }, 1000);
      setIsPayPopupOpen(false);
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      console.error(err);
    }
  };

  const handleSelectSupplier = (sup: Supplier) => {
    setSelectedSupplier(sup);
    setSupplierName(sup.contact_name);
    setIsSupplierPopupVisible(false);
  };

  const handleRemoveSupplier = () => {
    setSelectedSupplier(null);
    setSupplierName("");
    setPurchase((prev) => prev);
  };

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setEmployeeName(emp.full_name);
    setIsEmployeePopupVisible(false);
  };

  const handleEmployeeSearchChange = async (value: string) => {
    setEmployeeSearchTerm(value);
    try {
      const token = localStorage.getItem("access_token") || "";
      const { users } = await fetchEmployeeData(token, 50, 1, value);
      setEmployeeResults(users);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        {/* <div className="bg-white p-6 rounded-md">Đang tải dữ liệu...</div> */}
        <PopupSkeleton type="purchase" />
      </div>
    );
  }
  if (!purchase) return null;

  const supplier = purchase.supplier;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
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
      <div className="bg-[#F2F2F7] w-full xl:max-w-[90vw] 3xl:max-w-[73vw] rounded-2xl p-6 relative max-h-full xl:max-h-[95vh] 3xl:max-h-[800px]">
        <div className="flex justify-between mb-2">
          <div>
            <div className="flex max-lg-text-xl 2xl:text-xl font-bold mb-1 gap-2 items-center">
              <p className="font-semibold max-lg-text-xl 2xl:text-xl text-black">
                Chi tiết phiếu nhập #{purchase.id}
              </p>
              {/* <!--       <div className="bg-[#F2F2F7] max-w-screen-2xl rounded-2xl p-6 relative max-h-[90vh]">
        <div className="flex justify-between mb-2">
          <div>
            <h2 className="flex text-xl font-bold mb-1 gap-2 items-center">
              <p className="font-semibold text-2xl text-black">
                Chi tiết phiếu nhập #{purchase.id}
              </p> --> */}
              <div className="flex justify-between mx-4">
                <p className="font-normal text-[17px] leading-5 text-[#3C3C43B2]">
                  {"  "}
                  {purchase.created_at
                    ? `${new Date(purchase.created_at).toLocaleDateString(
                        "vi-VN"
                      )} • ${new Date(purchase.created_at).toLocaleTimeString(
                        "es-EN",
                        { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }
                      )}`
                    : "-"}
                </p>
              </div>
              {/* <div className="px-[10px] py-1 mr-4 rounded-lg font-semibold text-[15px] text-[#0061FD] text-center border border-[#0061fd] flex justify-center items-center gap-1 cursor-pointer">
                <LocalPrintshopOutlined fontSize="small" />
                In đơn
              </div> */}
              <div className="border-gray-300 border-r-[1px] h-full py-4 mr-4 inline-block"></div>
              <InspectionStatusBadge type="purchase_status" value={status} />
            </div>
          </div>
          <button className="text-[#3C3C43B2]" onClick={onClose}>
            <CloseOutlined />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-2 2xl:gap-4 ">
          {/* <div className="col-span-12 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] col-start-1 row-start-1 border px-6 py-4 h-[52px] rounded-2xl flex items-center">
            {status === "pending" || status === "canceled" ? (
              <p className="text-black flex items-center justify-center text-dark text-[15px] font-semibold leading-5">
                <StoreOutlined className="mr-2 text-[#3C3C43B2]" />
                Đơn hàng chưa nhập kho
              </p>
            ) : (
              <p className="flex items-center gap-1 text-green-600 font-semibold">
                <CheckCircle fontSize="small" />
                <span className="font-semibold text-[15px] leading-5 text-black">Đơn hàng đã nhập kho</span>
              </p>
            )}
          </div> */}

          <div className="bg-white col-span-3 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] border p-2 2xl:p-4 rounded-2xl 2xl:max-h-[262px]">
            {/* <!--           <div className="bg-white col-span-3 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] row-span-4 col-start-1 row-start-2 border p-4 rounded-2xl max-h-[262px]"> --> */}
            <div className="flex justify-between">
              <h3 className="font-semibold text-[15px] 3xl:text-[16px]">
                Thông tin nhà cung cấp
              </h3>
              {selectedSupplier && (
                <button
                  className={`text-gray-400 ${
                    ["canceled", "received_paid", "received_unpaid"].includes(
                      status
                    )
                      ? "hidden"
                      : ""
                  }`}
                  onClick={handleRemoveSupplier}
                  disabled={!canEditItems}
                >
                  <CloseOutlined />
                </button>
              )}
            </div>
            {selectedSupplier ? (
              <div className="mt-2 text-sm flex flex-col gap-2 3xl:gap-4">
                <div className="flex justify-between items-center border rounded-[8px] py-2 3xl:py-3 px-2">
                  <p className="text-[13px] 3xl:text-[15px] font-semibold truncate max-w-[100px]">
                    {selectedSupplier.contact_name}
                  </p>
                  <p className="font-semibold text-[13px] 3xl:text-[15px] leading-5 truncate max-w-[200px]">
                    <FmdGoodOutlined /> {selectedSupplier.address || "-"}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-[b2] leading-5 text-[13px] 3xl:text-[15px]">
                    Nợ hiện tại
                  </p>
                  <span className="text-[#e50000] leading-5 text-[13px] 3xl:text-[15px] font-semibold">
                    {selectedSupplier.debt.toLocaleString("en-ES")}
                  </span>
                </div>
                <div className="border-gray-300 border-b-[1px] w-full"></div>
                <div className="flex justify-between">
                  <p className="leading-5 text-[13px] 3xl:text-[15px]">
                    Tổng đơn nhập{" "}
                    <span className="text-blue-700 text-[13px] 3xl:text-[15px]">
                      (
                      {selectedSupplier.total_import_orders.toLocaleString(
                        "en-ES"
                      )}
                      )
                    </span>
                  </p>
                  <span className="text-[#0061fd] leading-5 text-[13px] 3xl:text-[15px] font-semibold">
                    {selectedSupplier.total_import_value.toLocaleString(
                      "en-ES"
                    )}
                  </span>
                </div>
                <div className="border-gray-300 border-b-[1px] w-full"></div>
                <div className="flex justify-between">
                  <p className="leading-5 text-[13px] 3xl:text-[15px]">
                    Trả hàng{" "}
                    <span className="text-red-700">
                      (
                      {selectedSupplier.total_return_orders.toLocaleString(
                        "en-ES"
                      )}
                      )
                    </span>
                  </p>
                  <span className="text-[#e50000] leading-5 text-[13px] 3xl:text-[15px] font-semibold">
                    {selectedSupplier.total_return_value.toLocaleString(
                      "en-ES"
                    )}
                  </span>
                  {/* <!--                 <div className="flex justify-between my-4">
                  <p className="leading-5 text-[15px] font-medium">
                    Tổng đơn nhập{" "}
                    <span className="text-blue-700">
                      (
                      {selectedSupplier.total_import_orders.toLocaleString(
                        "en-ES"
                      )}
                      )
                    </span>
                  </p>
                  <span className="text-[#0061fd] leading-5 text-[15px] font-semibold">
                    {selectedSupplier.total_import_value.toLocaleString(
                      "en-ES"
                    )}
                  </span>
                </div>
                <div className="border-gray-300 border-b-[1px] w-full"></div>
                <div className="flex justify-between my-4">
                  <p className="leading-5 text-[15px] font-medium">
                    Trả hàng{" "}
                    <span className="text-red-700">
                      (
                      {selectedSupplier.total_return_orders.toLocaleString(
                        "en-ES"
                      )}
                      )
                    </span>
                  </p>
                  <span className="text-[#e50000] leading-5 text-[15px] font-semibold">
                    {selectedSupplier.total_return_value.toLocaleString(
                      "en-ES"
                    )}
                  </span> --> */}
                </div>
              </div>
            ) : (
              <div className="relative mt-2">
                <input
                  type="text"
                  className="border p-2 w-full rounded-lg text-[13px] 3xl:text-[15px] h-8 3xl:h-10"
                  placeholder="Tìm nhà cung cấp"
                  value={supplierName}
                  onFocus={() => {
                    setIsSupplierPopupVisible(true);
                    handleSupplierSearchChange("");
                  }}
                  onChange={(e) => {
                    setSupplierName(e.target.value);
                    setIsSupplierPopupVisible(true);
                    handleSupplierSearchChange(e.target.value);
                  }}
                  disabled={!canEditItems}
                />
                {isSupplierPopupVisible && (
                  <div className="absolute w-full bg-white left-0 top-8 3xl:top-[45px] z-20 border">
                    <PopupSuppliers
                      suppliers={supplierResults}
                      onSelectSupplier={handleSelectSupplier}
                      onClose={() => setIsSupplierPopupVisible(false)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white col-span-6 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] border 2xl:p-4 p-2 rounded-2xl 2xl:max-h-[262px]">
            {/* <!--           <div className="bg-white col-span-6 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] row-span-4 col-start-4 row-start-2 border p-4 rounded-2xl max-h-[262px]"> --> */}
            <h3 className="font-semibold mb-2 text-[15px] 3xl:text-[16px]">
              Thông tin phiếu nhập hàng
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="w-28 text-[13px] 3xl:text-[15px] text-[#3c3c43b2] font-semibold">
                  Chi nhánh
                </label>
                <Select
                  options={[
                    { label: "Terra", value: "Terra" },
                    { label: "Thợ Nhuộm", value: "Thợ Nhuộm" },
                  ]}
                  placeholder="Chọn chi nhánh"
                  defaultValue={branch}
                  onSelect={(val) => setBranch(val)}
                  btnClassName="h-8 3xl:h-10 border-[#77777E1A] text-black bg-[#77777E1A] font-medium text-[13px] 3xl:text-[15px]"
                  wrapperClassName="!min-w-full"
                  disabled={[
                    "received_unpaid",
                    "received_paid",
                    "canceled",
                    "returned",
                  ].includes(status)}
                />
                {/* <select
                  className="border bg-[#fff] bg-opacity-10 p-1 h-10 rounded-md font-medium text-sm leading-5"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  disabled={["received_unpaid", "received_paid", "canceled", "returned"].includes(status)}
                >
                  <option value="Terra">Terra</option>
                  <option value="Thợ Nhuộm">Thợ Nhuộm</option>
                </select> */}
              </div>

              <div className="flex flex-col gap-1">
                <label className="w-28 text-[13px] 3xl:text-[15px] text-[#3c3c43b2] font-semibold">
                  Nhân viên
                </label>
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="h-8 3xl:h-10 text-[13px] 3xl:text-[15px] font-medium border border-[#77777E1A] bg-[#77777E1A] p-1 w-full rounded-md px-2 leading-5"
                    placeholder="Chọn nhân viên..."
                    value={employeeName}
                    onFocus={() => {
                      handleEmployeeSearchChange("");
                      setIsEmployeePopupVisible(true);
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmployeeName(val);
                      handleEmployeeSearchChange(val);
                      setIsEmployeePopupVisible(true);
                    }}
                    disabled={[
                      "received_unpaid",
                      "received_paid",
                      "canceled",
                      "returned",
                    ].includes(status)}
                  />
                  <div className="absolute right-1 text-right top-1/2 transform -translate-y-1/2 text-[#3C3C43B2]">
                    <ArrowDropDown
                      className="text-black mr-[7px]"
                      fontSize="small"
                    />
                  </div>
                  {isEmployeePopupVisible && (
                    <div className="absolute w-full left-0 top-9 3xl:top-[45px]">
                      <PopupEmployees
                        employees={employeeResults}
                        onSelectEmployee={handleSelectEmployee}
                        onClose={() => setIsEmployeePopupVisible(false)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="w-28 text-[13px] 3xl:text-[15px] text-[#3c3c43b2] font-semibold">
                  Chính sách giá
                </label>
                <Select
                  options={[
                    { label: "Giá lẻ", value: "Giá lẻ" },
                    { label: "Giá buôn", value: "Giá buôn" },
                    { label: "Giá nhập", value: "Giá nhập" },
                  ]}
                  placeholder="Chọn chính sách"
                  // defaultValue={pricePolicy}
                  defaultValue="Giá nhập"
                  onSelect={(val) => setPricePolicy(val)}
                  btnClassName="h-8 3xl:h-10 border-[#77777E1A] text-black bg-[#77777E1A] text-[13px] 3xl:text-[15px] font-medium"
                  wrapperClassName="!min-w-full"
                  disabled={true}
                  // disabled={[
                  //   "received_unpaid",
                  //   "received_paid",
                  //   "canceled",
                  //   "returned",
                  // ].includes(status)}
                />
                {/* <select
                  className="border bg-[#fff] bg-opacity-10 p-1 h-10 rounded-md font-medium text-sm leading-5"
                  value={pricePolicy}
                  onChange={(e) => setPricePolicy(e.target.value)}
                  disabled={[
                    "received_unpaid",
                    "received_paid",
                    "canceled",
                    "returned",
                  ].includes(status)}
                >
                  <option value="Giá lẻ">Giá lẻ</option>
                  <option value="Giá buôn">Giá buôn</option>
                  <option value="Giá nhập">Giá nhập</option>
                </select> */}
              </div>

              <div className="flex flex-col gap-1">
                <label className="w-28 text-[13px] 3xl:text-[15px] text-[#3c3c43b2] font-semibold">
                  Ngày hẹn giao
                </label>
                <div className="relative">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      className="bg-[#77777E1A] rounded-lg items-center"
                      value={deliveryDate ? dayjs(deliveryDate) : null}
                      disabled={[
                        "received_unpaid",
                        "received_paid",
                        "canceled",
                        "returned",
                      ].includes(status)}
                      onChange={(newValue) => {
                        setDeliveryDate(
                          newValue ? newValue.format("YYYY-MM-DD") : ""
                        );
                      }}
                      slots={{
                        openPickerIcon: CalendarToday,
                      }}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          variant: "standard",
                          fullWidth: true,
                          size: "small",
                          InputProps: {
                            className:
                              "!text-[13px] 3xl:!text-[15px] !h-8 3xl:!h-10",
                            sx: {
                              borderColor: "#77777E1A",
                              borderWidth: "1px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              gap: "2px",
                              // height: "40px",
                              paddingX: "8px",
                              // "::placeholder": {
                              //   paddingTop: "0px",
                              // },
                            },
                            disableUnderline: true,
                          },

                          inputProps: {
                            className: "!py-2",
                          },
                        },
                        openPickerIcon: {
                          sx: {
                            marginRight: "4px",
                            fontSize: "18px",
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>
                {/* <input
                        type="date"
                        className="border p-1 rounded-md h-10"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                    /> */}
              </div>

              <div className="flex flex-col gap-1">
                <label className="w-28 text-[13px] 3xl:text-[15px] text-[#3c3c43b2] font-semibold">
                  Ngày nhập
                </label>
                <input
                  type="text"
                  // className="border bg-[#77777e] bg-opacity-10 p-1 h-10 rounded-md font-medium text-sm leading-5"
                  className="h-8 3xl:h-10 text-[13px] 3xl:text-[15px] font-medium border border-[#77777E1A] bg-[#77777E1A] p-1 w-full rounded-md px-2 text-sm leading-5"
                  value={status === "pending" ? "" : lastUpdated}
                  placeholder="-"
                  disabled={[
                    "received_unpaid",
                    "received_paid",
                    "canceled",
                    "returned",
                  ].includes(status)}
                  readOnly
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="w-28 text-[13px] 3xl:text-[15px] text-[#3c3c43b2] font-semibold">
                  Ghi chú
                </label>
                <input
                  className="h-8 3xl:h-10 border border-[#3C3C4359] bg-white px-2 rounded-md font-medium text-[13px] 3xl:text-[15px] leading-5"
                  value={note}
                  placeholder="Ghi chú chung"
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setNote(e.target.value);
                    }
                  }}
                  disabled={[
                    "received_unpaid",
                    "received_paid",
                    "canceled",
                    "returned",
                  ].includes(status)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white col-span-3 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] border 2xl:p-4 p-2 rounded-2xl 2xl:max-h-[262px]">
            <h3 className="font-semibold mb-4 text-[15px] 3xl:text-[16px]">
              Đơn hàng chưa thanh toán
            </h3>
            {supplier ? (
              <div className="flex flex-col gap-2 3xl:gap-4">
                <div className="flex justify-between">
                  <span className="font-medium text-[13px] 3xl:text-[15px]">
                    Tiền cần trả NCC:
                  </span>
                  <span className="text-[#100713] font-semibold text-[13px] 3xl:text-[15px] leaing-5">
                    {grandTotal.toLocaleString("en-ES")}
                  </span>
                </div>

                <div className="border-gray-300 border-b-[1px] w-full"></div>

                <div className="flex justify-between text-[13px] 3xl:text-[15px]">
                  <span className="font-medium">Đã trả:</span>
                  <span className="text-[#e50000] font-semibold leading-5">
                    {purchase.paid_amount.toLocaleString("en-ES")}
                  </span>
                </div>

                <div className="border-gray-300 border-b-[1px] w-full"></div>

                <div className="flex justify-between text-[13px] 3xl:text-[15px]">
                  <span className="font-medium">Cần phải trả:</span>
                  <span className="text-[#e50000] font-semibold leading-5">
                    {(grandTotal - purchase.paid_amount).toLocaleString(
                      "en-ES"
                    )}
                  </span>
                </div>

                <button
                  className={`bg-[#338BFF] text-white w-full h-8 3xl:h-10 text-[13px] 3xl:text-[15px] rounded-md font-medium ${
                    purchase.paid_amount >= grandTotal || status === "canceled"
                      ? "bg-[#77777E1A] cursor-not-allowed !text-[#3C3C4366]"
                      : "hover:bg-blue-600"
                  }`}
                  onClick={handleOpenPayPopup}
                  disabled={
                    purchase.paid_amount >= grandTotal || status === "canceled"
                  }
                >
                  Thanh toán
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Không có dữ liệu NCC</p>
            )}
          </div>

          <div className="bg-white col-span-9 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] border 2xl:p-4 p-2 rounded-2xl gap-2 2xl:gap-4 min-h-[270px] 3xl:min-h-[330px] max-h-[300px] xl:max-h-[270px] 2xl:max-h-[355px]">
            {/* <!--           <div className="bg-white col-span-9 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] row-span-5 col-start-1 row-start-6 border p-4 rounded-2xl gap-4 max-h-[380px] overflow-hidden"> --> */}
            <div className="flex gap-4">
              <h3
                className="font-semibold text-[15px] 3xl:text-[16px]"
                onClick={() => setShowReturnTable(false)}
              >
                Thông tin sản phẩm
              </h3>
              {purchase.returns && purchase.returns.length > 0 && (
                <h3
                  className={`font-semibold cursor-pointer hover:text-gray-500 ${
                    showReturnTable ? "text-gray-500" : "text-black"
                  }`}
                  onClick={() => setShowReturnTable(true)}
                >
                  Thông tin trả hàng
                </h3>
              )}
            </div>

            {status === "pending" && (
              <div className="relative mt-2">
                <input
                  placeholder="Tìm kiếm sản phẩm..."
                  className="border p-2 w-full rounded-[8px] h-8 3xl:h-10 text-[13px] 3xl:text-[15px]"
                  value={searchTerm}
                  onFocus={() => {
                    handleSearchChange("");
                    setIsProductPopupVisible(true);
                  }}
                  onChange={(e) => {
                    handleSearchChange(e.target.value);
                    setIsProductPopupVisible(true);
                  }}
                />
                {isProductPopupVisible && (
                  <div className="absolute w-full left-0 top-9 3xl:top-[45px]">
                    <PopupSearchProducts
                      products={searchResults}
                      onSelectProduct={(prod) => {
                        handleSelectProduct(prod);
                        setIsProductPopupVisible(false);
                        setSearchTerm("");
                      }}
                      onClose={() => {
                        setIsProductPopupVisible(false);
                        setSearchTerm("");
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* <div className="mt-4 max-h-[250px] overflow-y-auto scrollbar-hidden"> */}
            <div
              className={`mt-4 ${
                status !== "pending" ? "max-h-[187px] 3xl:max-h-[250px]" : "max-h-[187px] 3xl:max-h-[250px]"
              } overflow-y-auto scrollbar-hidden`}
            >
              {items.length > 0 ? (
                <table className="w-full table-fixed">
                  <thead className="sticky top-0 z-10 rounded-t-lg ant-table-thead bg-[#ededf0]">
                    <tr className="h-8 3xl:h-10 rounded-t-xl shadow-[0_1px_1px_0px_#4F49502E] 2xl:text-[15px] text-xs">
                      <th className="text-[13px] 3xl:text-[15px] ant-table-cell sticky top-0 w-[40px] rounded-tl-xl">
                        STT
                      </th>
                      <th className="text-[13px] 3xl:text-[15px] ant-table-cell sticky top-0 w-[80px]">
                        Ảnh
                      </th>
                      <th className="text-[13px] 3xl:text-[15px] ant-table-cell sticky top-0 w-[200px]">
                        Tên sản phẩm
                      </th>
                      <th className="text-[13px] 3xl:text-[15px] ant-table-cell sticky top-0 w-[80px]">
                        SL Nhập
                      </th>
                      <th className="text-[13px] 3xl:text-[15px] ant-table-cell sticky top-0 w-[120px]">
                        Đơn giá
                      </th>
                      <th className="text-[13px] 3xl:text-[15px] ant-table-cell sticky top-0 w-[80px]">
                        CK (%)
                      </th>
                      <th className="text-[13px] 3xl:text-[15px] ant-table-cell sticky top-0 w-[120px]">
                        Thành tiền
                      </th>
                      <th className="text-[13px] 3xl:text-[15px] ant-table-cell sticky top-0 w-[40px] rounded-tr-xl"></th>
                    </tr>
                  </thead>
                  <tbody className="text-center text-[13px] 3xl:text-[15px]">
                    {items.map((item, idx) => {
                      const product = item.product || ({} as Product);
                      const lineTotal = item.total_line;
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 border-b cursor-pointer"
                        >
                          <td className="p-2 text-[13px] 3xl:text-[15px]">
                            {idx + 1}
                          </td>
                          <td>
                            <div className="flex justify-center p-1">
                              <Image
                                src={
                                  product.image_url ||
                                  (product.images?.[0]?.url
                                    ? `${process.env.NEXT_PUBLIC_DEV_API}${product.images[0].url}`
                                    : "/customers/amy-burns.png")
                                }
                                alt="Product"
                                width={256}
                                height={256}
                                className="object-cover rounded-lg w-10 h-10"
                                //unoptimized
                              />
                            </div>
                          </td>
                          <td className="text-left">
                            {/* <p className="line-clamp-2">{product.name || "(No Name)"}</p> */}
                            <p
                              className="line-clamp-2 break-all text-[13px] 3xl:text-[15px]"
                              data-tooltip-id="product-name"
                              data-tooltip-content={product.name || "(No Name)"}
                            >
                              {product.name || "(No Name)"}
                            </p>
                            <Tooltip
                              id="product-name"
                              place="top"
                              className="z-10"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="border w-16 p-1 rounded-lg text-[13px] 3xl:text-[15px] h-8 3xl:h-10"
                              disabled={!canEditItems}
                              value={item.quantity === 0 ? "" : item.quantity}
                              placeholder="0"
                              onChange={(e) => {
                                let value = Number(e.target.value);
                                if (value < 0) value = 0;
                                if (value > 999) value = 999;
                                handleUpdateItem(idx, "quantity", value);
                              }}
                            />
                          </td>
                          {/* <td>{item.price.toLocaleString("en-ES")}</td> */}
                          <td>
                            <input
                              type="text"
                              className="border p-1 rounded-lg w-full text-[13px] 3xl:text-[15px] h-8 3xl:h-10"
                              disabled={!canEditItems}
                              //hello world
                              value={item.price.toLocaleString("en-ES")}
                              placeholder="0"
                              onChange={(e) => {
                                const value = Number(
                                  e.target.value.replace(/\D/g, "")
                                );
                                let parsed = Number(value);
                                if (parsed < 0) parsed = 0;
                                if (parsed > 999999999999)
                                  parsed = 999999999999;
                                handleUpdateItem(idx, "price", parsed);
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="border w-16 p-1 rounded-lg text-[13px] 3xl:text-[15px] h-8 3xl:h-10"
                              disabled={!canEditItems}
                              value={item.discount === 0 ? "" : item.discount}
                              placeholder="0"
                              onChange={(e) => {
                                let value = Number(e.target.value);
                                if (value < 0) value = 0;
                                if (value > 100) value = 100;
                                handleUpdateItem(idx, "discount", value);
                              }}
                            />
                          </td>
                          <td className="text-right pr-2 text-[13px] 3xl:text-[15px]">
                            {lineTotal.toLocaleString("en-ES")}
                          </td>
                          <td className="text-center">
                            {canEditItems && (
                              <DeleteForeverOutlined
                                className="text-red-500 cursor-pointer"
                                onClick={() => handleRemoveItem(idx)}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center text-gray-500">
                  <NoData
                    message="Chưa có thông tin sản phẩm"
                    className="[&_img]:max-w-[57px] [&_p]:!text-[15px]"
                  />
                  <a
                    href="#"
                    className="text-blue-500 text-[12px] leading-4 mt-1"
                  >
                    <LiveHelpOutlined className="w-[16px]" /> Chọn thanh tìm
                    kiếm để chọn sản phẩm
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white col-span-3 flex flex-col justify-between shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] border 2xl:p-4 p-2 rounded-2xl min-h-[270px] 3xl:min-h-[330px] max-h-[300px] 3xl:max-h-[355px]">
            {/* <!--           <div className="bg-white col-span-3 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] row-span-5 col-start-10 row-start-6 border p-4 rounded-2xl max-h-[380px]"> --> */}
            <div className="flex flex-col gap-2 3xl:gap-4">
              <div className="flex justify-between font-semibold border-b w-full">
                <div>
                  <h3 className="text-[15px] 3xl:text-[17px] font-bold leading-[22px]">
                    Tổng tiền
                  </h3>
                  <span className="font-normal text-[14px] leading-[18px] text-[#3C3C43B2]">
                    (
                  </span>
                  <span className="font-semibold text-[14px] leading-[18px] text-[#338BFF]">
                    {items.reduce((acc, it) => acc + it.quantity, 0)}
                  </span>
                  <span className="font-normal text-[14px] leading-[18px] text-[#3C3C43B2]">
                    {" "}
                    sản phẩm)
                  </span>
                </div>
                <span className="text-[17px] font-bold leading-[22px]">
                  {subTotal.toLocaleString("en-ES")}
                </span>
              </div>
              {/* <div className="border-gray-300 border-b-[1px] w-full my-4"></div> */}
              {/* <div className="flex justify-between mt-2">
                <span className="font-normal text-[15px] leading-5">Số lượng</span>
                <span className="font-semibold text-[15px] leading-5">{items.reduce((acc, it) => acc + it.quantity, 0)}</span>
              </div> */}
              <div className=" flex items-center justify-between">
                <label className="font-normal text-[13px] 3xl:text-[15px] leading-5">
                  Chiết khấu tổng đơn
                </label>
                <div
                  id="ticket-container"
                  className="relative flex items-center justify-center h-8 3xl:h-[35px] text-[13px] 3xl:text-[15px] bg-[#3AA207] text-white font-bold rounded-[4px] pr-[10px] overflow-hidden"
                  style={{ width: "48px" }}
                >
                  <div className="absolute w-[7px] h-[13px] bg-white left-0 rounded-r-full"></div>
                  <div className="absolute w-[7px] h-[13px] bg-white right-0 rounded-l-full"></div>
                  <input
                    type="text"
                    className={`bg-transparent text-center font-bold outline-none focus:outline-none focus:ring-0 focus:border-transparent focus:shadow-none appearance-none text-[13px] 3xl:text-[15px] placeholder:text-white border-transparent ${
                      ["canceled", "received_paid", "received_unpaid"].includes(
                        status
                      )
                        ? "mr-2 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder="0"
                    value={discount === 0 ? "" : discount}
                    maxLength={3}
                    disabled={[
                      "canceled",
                      "received_paid",
                      "received_unpaid",
                    ].includes(status)}
                    onInput={(e) => {
                      const valueLength = Math.min(
                        (e.target as HTMLInputElement).value.length || 1,
                        3
                      );
                      const container =
                        document.getElementById("ticket-container");
                      if (container) {
                        container.style.width = `${valueLength * 10 + 40}px`;
                      }
                    }}
                    // onChange={(e) => setDiscount(Number(e.target.value))}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      value = Math.max(
                        0,
                        Math.min(100, Number(value))
                      ).toString();
                      setDiscount(Number(value));
                    }}
                  />
                  <span className="absolute right-2">%</span>
                </div>
                {/* <input
                    type="number"
                    className="border w-16 p-1 text-right"
                    value={discount === 0 ? "" : discount}
                    placeholder="0"
                    min={0}
                    max={100}
                    onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 0 && value <= 100) {
                            setDiscount(value);
                        }
                    }}
                /> */}
              </div>

              <div className="flex justify-between">
                <label className="font-normal text-[13px] 3xl:text-[15px] leading-5">
                  Thêm chi phí
                </label>
                <input
                  type="text"
                  className={`w-[120px] font-semibold text-[13px] 3xl:text-[15px] leading-5 p-1 text-right rounded-md ${
                    ["canceled", "received_paid", "received_unpaid"].includes(
                      status
                    )
                      ? "cursor-not-allowed"
                      : ""
                  }`}
                  value={extraFee === 0 ? "" : extraFee.toLocaleString("en-ES")}
                  disabled={[
                    "canceled",
                    "received_paid",
                    "received_unpaid",
                  ].includes(status)}
                  placeholder="0"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const numericValue = Number(value);

                    if (numericValue >= 0 && numericValue <= 999999999999) {
                      setExtraFee(numericValue);
                    }
                  }}
                />
              </div>

              <div className="flex justify-between">
                <span className="font-normal text-[13px] 3xl:text-[15px] leading-5">
                  Tiền cần trả
                </span>
                <span className="font-semibold text-[13px] 3xl:text-[15px] leading-5">
                  {grandTotal.toLocaleString("en-ES")}
                </span>
              </div>

              <div className="flex justify-between text-[13px] 3xl:text-[15px]">
                <div className="flex flex-col gap-0">
                  <label className="font-normal text-[13px] 3xl:text-[15px] leading-5">
                    Thanh toán NCC
                  </label>
                  <Select
                    options={[
                      { value: "cash", label: "Tiền mặt" },
                      { value: "bank", label: "Chuyển khoản" },
                      { value: "pos", label: "POS" },
                    ]}
                    onSelect={(value) => console.log(value)}
                    defaultValue="bank"
                    btnClassName="!bg-transparent !text-gray-600 !p-0 text-xs 3xl:text-[15px] hover:!border-transparent"
                    wrapperClassName="min-w-none -mt-1 3xl:-mt-0"
                    iconSize={14}
                  />
                  {/* <select
                    className="bg-none border-none outline-none text-xs font-normal p-1 text-gray-600"
                    defaultValue="Chuyển khoản"
                  >
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Chuyển khoản">Chuyển khoản</option>
                    <option value="POS">POS</option>
                  </select> */}
                </div>

                <input
                  type="text"
                  className={`w-[120px] p-1 font-semibold text-[13px] 3xl:text-[15px] h-8 3xl:h-10 leading-5 text-right rounded-md
                    ${
                      ["canceled", "received_paid", "received_unpaid"].includes(
                        status
                      )
                        ? "cursor-not-allowed"
                        : ""
                    }`}
                  value={
                    paidAmount === 0 ? "" : paidAmount.toLocaleString("en-ES")
                  }
                  placeholder="0"
                  disabled={[
                    "canceled",
                    "received_paid",
                    "received_unpaid",
                  ].includes(status)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const numericValue = Number(value);
                    if (numericValue >= 0 && numericValue <= 9999999999999) {
                      setPaidAmount(numericValue);
                    }
                  }}
                />
              </div>
            </div>

            {/* <div className="flex items-center">
              <select
                className="bg-none border-none outline-none text-xs font-normal leading-4 p-1 text-gray-600"
                defaultValue="Chuyển khoản"
              >
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="POS">POS</option>
              </select>
            </div> */}

            <div className="flex flex-col gap-2 3xl:gap-4">
              <div className="border-gray-300 border-b-[1px] w-full"></div>

              <div className="text-[#e50000] flex justify-between">
                <p className="text-[15px] 3xl:text-[17px] font-semibold leading-[22px]">
                  Còn phải trả:
                </p>
                <p className="text-[15px] 3xl:text-[17px] leading-[22px] font-semibold">
                  {remainToPay.toLocaleString("en-ES")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4 gap-2">
          <button
            onClick={() => setIsDeletePopupOpen(true)}
            disabled={status !== "pending"}
            className={`font-semibold text-[13px] 3xl:text-[15px] px-4 h-8 3xl:min-h-10 3xl:py-[10px] rounded-lg
            ${
              status === "pending"
                ? "text-white bg-[#e50000]"
                : "text-[#3C3C4366] font-semibold bg-[#77777E1A] cursor-not-allowed"
            }`}
          >
            Hủy phiếu
          </button>

          {canEditItems && (
            <button
              onClick={handleSave}
              disabled={status !== "pending"}
              className={`font-semibold text-[13px] 3xl:text-[15px] leading-5 px-4 h-8 3xl:min-h-10 3xl:py-[10px] rounded-lg
              ${
                status === "pending"
                  ? "text-[#338bff] bg-none border border-[#338BFF]"
                  : " text-[#3C3C4366] font-semibold bg-[#77777E1A] cursor-not-allowed"
              }`}
            >
              Lưu chỉnh sửa
            </button>
          )}
          <button
            onClick={dualButtonFunction}
            className="font-semibold text-[13px] 3xl:text-[15px] 3xl:min-h-10 3xl:py-[10px] px-4 rounded-lg bg-[#338bff] hover:bg-[#66b2ff] text-white disabled:bg-[#77777E1A] disabled:text-[#3C3C4366] disabled:cursor-not-allowed"
            disabled={status !== "pending"}
          >
            Nhập hàng
          </button>
        </div>

        {/* {isPayPopupOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-md w-[300px] relative">
              <button
                className="absolute right-3 top-2 text-gray-400"
                onClick={() => setIsPayPopupOpen(false)}
              >
                ✕
              </button>
              <h3 className="text-lg font-semibold mb-3">Thanh toán NCC</h3>
              <label className="block text-sm mb-1">Số tiền</label>
              <input
                type="text"
                className="border p-2 w-full rounded-md"
                value={payAmount === 0 ? "" : payAmount.toLocaleString("en-ES")}
                placeholder="0"
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  const numericValue = Number(value);

                  if (numericValue >= 0 && numericValue <= 999999999999) {
                    setPayAmount(numericValue);
                  }
                }}
              />
              <button
                className="bg-blue-500 text-white w-full py-2 rounded-md mt-4"
                onClick={handleConfirmPay}
              >
                Xác nhận
              </button>
            </div>
          </div>
        )} */}

        {isPayPopupOpen && (
          <PaymentModal
            title="NCC"
            isOpen={isPayPopupOpen}
            onClose={() => setIsPayPopupOpen(false)}
            onConfirm={handleConfirmPay}
          />
        )}

        {isDeletePopupOpen && (
          <PopupDelete
            isOpen={isDeletePopupOpen}
            onClose={() => setIsDeletePopupOpen(false)}
            onConfirm={handleCancelBill}
            message={`Hệ thống sẽ huỷ phiếu nhập #${purchase.id} và không thể khôi phục.`}
          />
        )}
      </div>
    </div>
  );
}