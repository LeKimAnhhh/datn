"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  CloseOutlined,
  DeleteForeverOutlined,
  LocalPrintshopOutlined,
  ReportGmailerrorred,
  FmdGoodOutlined,
  CheckCircleOutlined,
  ArrowDropDown,
  LiveHelpOutlined,
} from "@mui/icons-material";

import {
  getReturnBillById,
  updateReturnBill,
  confirmReturnBill,
  fetchEmployeeData,
  fetchSuppliersData,
  fetchProductsName,
  cancelReturnBill,
} from "@/app/lib/data";

import {
  ReturnBill,
  ReturnBillItem,
  Supplier,
  Product,
  Employee,
} from "@/app/lib/definitions";

import StatusBadge from "@/app/ui/status";
import PopupEmployees from "@/app/components/PopupEmployees";
import PopupSuppliers from "@/app/components/PopupSuppliers";
import PopupSearchProducts from "@/app/components/PopupSearchProducts";
import PopupDelete from "@/app/components/PopupDelete";
import Select from "../select";
import { cn } from "@/app/lib/utils";
import { Tooltip } from "react-tooltip";
import NoData from "@/app/components/NoData";
import PopupSkeleton from "@/app/components/PopupSkeleton";

interface PopupEditReturnProps {
  isOpen: boolean;
  onClose: () => void;
  returnId: string;
  onSaved: (updated: ReturnBill) => void;
}

export default function PopupEditReturn({
  isOpen,
  onClose,
  returnId,
  onSaved,
}: PopupEditReturnProps) {
  const [returnBill, setReturnBill] = useState<ReturnBill | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

  const [branch, setBranch] = useState("");
  const [note, setNote] = useState("");
  const [discount, setDiscount] = useState(0);
  const [extraFee, setExtraFee] = useState(0);
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<ReturnBillItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierName, setSupplierName] = useState("");
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [supplierResults, setSupplierResults] = useState<Supplier[]>([]);
  const [isSupplierPopupVisible, setIsSupplierPopupVisible] = useState(false);

  // For Employee
  const [employeeName, setEmployeeName] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [employeeResults, setEmployeeResults] = useState<Employee[]>([]);
  const [isEmployeePopupVisible, setIsEmployeePopupVisible] = useState(false);

  // For Product
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isProductPopupVisible, setIsProductPopupVisible] = useState(false);
  const [pricePolicy, setPricePolicy] = useState<string>();

  useEffect(() => {
    if (!isOpen) return;

    async function loadBill() {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token") || "";
        const data = await getReturnBillById(token, returnId);
        setReturnBill(data);
        console.log("ReturnBill data:", data);

        setBranch(data.branch || "");
        setNote(data.note || "");
        setDiscount(data.discount || 0);
        setExtraFee(data.extra_fee || 0);
        setStatus(data.status);
        setItems(data.items);

        if (data.items.length > 0) {
          const first = data.items[0];
          if (first.price === first.product?.price_retail) {
            setPricePolicy("Giá lẻ");
          } else if (first.price === first.product?.price_wholesale) {
            setPricePolicy("Giá buôn");
          } else {
            setPricePolicy("Giá nhập");
          }
        }
        if (data.updated_at) {
          const d = new Date(data.updated_at).toLocaleString("vi-VN");
          setUpdatedAt(d);
        }

        if (data.supplier) {
          setSelectedSupplier(data.supplier);
          setSupplierName(data.supplier.contact_name);
        }

        if (data.user) {
          setSelectedEmployeeId(data.user.id);
          setEmployeeName(data.user.full_name);
        }
      } catch (err: any) {
        console.error(err);
        setMessage(err.message);
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
        }, 5000);
      } finally {
        setLoading(false);
      }
    }

    loadBill();
  }, [isOpen, returnId]);

  const updateItemsPrice = useCallback(() => {
    setItems((prev) =>
      prev.map((it) => {
        const newPrice =
          pricePolicy === "Giá lẻ"
            ? it.product?.price_retail ?? it.price
            : pricePolicy === "Giá buôn"
            ? it.product?.price_wholesale ?? it.price
            : it.product?.price_import ?? it.price;
        const newLine = it.quantity * newPrice * (1 - it.discount / 100);
        return { ...it, price: newPrice, total_line: newLine };
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
  const handleSelectSupplier = (sup: Supplier) => {
    setSelectedSupplier(sup);
    setSupplierName(sup.contact_name);
    setIsSupplierPopupVisible(false);
  };

  const handleRemoveSupplier = () => {
    setSelectedSupplier(null);
    setSupplierName("");
    setReturnBill((prev) => prev);
  };
  
  const handleEmployeeSearchChange = async (term: string) => {
    setEmployeeSearchTerm(term);
    try {
      const token = localStorage.getItem("access_token") || "";
      const { users } = await fetchEmployeeData(token, 50, 1, term);
      setEmployeeResults(users);
    } catch (err) {
      console.error(err);
    }
  };
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setEmployeeName(emp.full_name);
    setIsEmployeePopupVisible(false);
  };

  const handleSearchChange = async (term: string) => {
    setSearchTerm(term);
    if (!term) {
      try {
        const token = localStorage.getItem("access_token") || "";
        const { products } = await fetchProductsName(token, 0, 50, "");
        setSearchResults(products);
      } catch (err) {
        console.error(err);
      }
      return;
    }
    try {
      const token = localStorage.getItem("access_token") || "";
      const { products } = await fetchProductsName(token, 0, 50, term);
      setSearchResults(products);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectProduct = (product: Product) => {
    if (!canEditItems) return;
    setItems((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((x) => x.product_id === product.id);
      if (idx !== -1) {
        const ex = updated[idx];
        const newQty = ex.quantity + 1;
        const raw = newQty * ex.price;
        const lineDiscount = raw * (ex.discount / 100);
        updated[idx] = { ...ex, quantity: newQty, total_line: raw - lineDiscount };
      } else {
        const rawPrice = product.price_import || 0;
        updated.push({
          id: Date.now(),
          product_id: product.id,
          product,
          quantity: 1,
          price: rawPrice,
          discount: 0,
          total_line: rawPrice,
        });
      }
      return updated;
    });
  };

  if (!isOpen) return null;

  if (loading || !returnBill) {
    // return (
    //   <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
    //     <div className="bg-white p-6 rounded-md">Đang tải dữ liệu...</div>
    //   </div>
    // );
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        <PopupSkeleton type="return" />
      </div>
    );
  }

  const canEditItems = status === "returning";
  const subTotal = items.reduce((acc, it) => acc + it.total_line, 0);
  const grandTotal = subTotal * (1 - discount / 100) + extraFee;

  const handleUpdateItem = (index: number, field: string, value: number) => {
    if (!canEditItems) return;
    setItems((prev) =>
      prev.map((it, i) => {
        if (i === index) {
          const newItem = { ...it } as ReturnBillItem;
          (newItem as any)[field] = value;
          const raw = newItem.quantity * newItem.price;
          const lineDiscount = raw * (newItem.discount / 100);
          newItem.total_line = raw - lineDiscount;
          return newItem;
        }
        return it;
      })
    );
  };
  const handleRemoveItem = (index: number) => {
    if (!canEditItems) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedSupplier) {
      setMessage("Vui lòng chọn nhà cung cấp.");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }
    try {
      const token = localStorage.getItem("access_token") || "";
      const payload: any = {
        supplier_id: selectedSupplier ? selectedSupplier.id : null,
        branch,
        note,
        discount,
        extra_fee: extraFee,
        items: items.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          price: it.price,
          discount: it.discount,
        })),
      };
      if (selectedEmployeeId) {
        payload.user_id = selectedEmployeeId;
      }

      console.log(payload)
      const updated = await updateReturnBill(token, returnId, payload);
      setReturnBill(updated);
      setStatus(updated.status);
      onSaved(updated);
      setMessage("Đã lưu chỉnh sửa phiếu trả!");
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

  const handleConfirm = async () => {
    if (status !== "returning") {
      setMessage("Chỉ xác nhận được phiếu đang ở trạng thái returning");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }
    try {
      const token = localStorage.getItem("access_token") || "";
      const updated = await confirmReturnBill(token, returnId);
      setReturnBill(updated);
      setStatus(updated.status);
      onSaved(updated);

      setMessage("Đã xác nhận trả hàng!");
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

  const handleCancel = async () => {
    if (!canEditItems) {
      setMessage("Chỉ hủy được phiếu đang ở trạng thái đang kiểm.");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }
    
    try {
      const token = localStorage.getItem("access_token") || "";
      const updated = await cancelReturnBill(token, returnId);
      setReturnBill(updated);
      setStatus(updated.status);
      onSaved(updated);
  
      setMessage("Đã hủy phiếu trả hàng!");
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

  // if (loading) {
  //   return (
  //     <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
  //       <div className="bg-white p-6 rounded-md">Đang tải dữ liệu...</div>
  //     </div>
  //   );
  // }

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
      <div className="bg-[#F2F2F7] w-full xl:max-w-[90vw] 3xl:max-w-[73vw] rounded-2xl 2xl:p-6 p-4 relative max-h-[95vh] 3xl:max-h-[800px]">
        <div className="flex justify-between 3xl:mb-2">
          <div>
            <h2 className="flex text-xl font-bold mb-1 gap-2 items-center">
              <p className="font-semibold text-xl text-black">
                Chi tiết phiếu trả #{returnBill.id}
              </p>
              <div className="flex justify-between mx-4">
                <p className="font-normal text-[17px] leading-5 text-[#3C3C43B2]">
                  {"  "}
                  {returnBill.created_at
                    ? `${new Date(returnBill.created_at).toLocaleDateString(
                        "vi-VN"
                      )} • ${new Date(returnBill.created_at).toLocaleTimeString(
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
              <StatusBadge type="retunr_status" value={status} />
            </h2>
          </div>
          <button className="text-[#3C3C43B2]" onClick={onClose}>
            <CloseOutlined />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-2 2xl:gap-4 -mt-2 3xl:-mt-0">
          <div className="bg-white col-span-3 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] row-span-4 col-start-1 row-start-2 border p-2 2xl:p-4 rounded-2xl h-auto 2xl:max-h-[262px]">
            <div className="flex justify-between">
              <h3 className="font-semibold text-[15px] 3xl:text-[16px]">
                Thông tin nhà cung cấp
              </h3>
              {selectedSupplier && (
                <button
                  className="text-gray-400"
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

          <div className="bg-white col-span-9 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] row-span-4 col-start-4 row-start-2 border 2xl:p-4 p-2 rounded-2xl h-auto 2xl:max-h-[262px]">
            <h3 className="font-semibold mb-2 text-[15px] 3xl:text-[16px]">
              Thông tin phiếu nhập hàng
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="w-28 text-[15px] 3xl:text-[16px]">
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
                  disabled={!canEditItems}
                />
                {/* <select
                  className="border bg-[#fff] bg-opacity-10 p-1 h-10 rounded-md font-medium text-sm leading-5"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  disabled={!canEditItems}
                >
                  <option value="">-- Chọn chi nhánh --</option>
                  <option value="Terra">Terra</option>
                  <option value="Thợ Nhuộm">Thợ Nhuộm</option>
                </select> */}
              </div>

              <div className="flex flex-col gap-1">
                <label className="w-28 text-[15px] 3xl:text-[16px]">
                  Nhân viên
                </label>
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="h-8 3xl:h-10 text-[13px] 3xl:text-[15px] font-medium border border-[#77777E1A] bg-[#77777E1A] p-1 w-full rounded-md px-2 text-sm leading-5"
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
                    disabled={!canEditItems}
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
                <label className="w-28 text-[15px] 3xl:text-[16px]">
                  Chính sách giá
                </label>
                <Select
                  options={[
                    { label: "Giá lẻ", value: "Giá lẻ" },
                    { label: "Giá buôn", value: "Giá buôn" },
                    { label: "Giá nhập", value: "Giá nhập" },
                  ]}
                  placeholder="Chọn chính sách"
                  defaultValue={pricePolicy}
                  onSelect={(val) => setPricePolicy(val)}
                  btnClassName="h-8 3xl:h-10 border-[#77777E1A] text-black bg-[#77777E1A] font-medium text-[13px] 3xl:text-[15px]"
                  wrapperClassName="!min-w-full"
                  disabled={["returned"].includes(status)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="w-28 text-[15px] 3xl:text-[16px]">
                  Ngày cập nhật
                </label>
                <input
                  type="text"
                  className="h-8 3xl:h-10 text-[13px] 3xl:text-[15px] border border-[#77777E1A] bg-[#77777E1A] px-2 rounded-md font-medium leading-5"
                  placeholder="Không có dữ liệu"
                  value={updatedAt}
                  readOnly
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="w-28 text-[15px] 3xl:text-[16px]">
                  Ghi chú
                </label>
                <input
                  className="h-8 3xl:h-10 border border-[#3C3C4359] bg-white px-2 rounded-md font-medium text-[13px] 3xl:text-[15px] leading-5"
                  value={note}
                  placeholder="Ghi chú chung"
                  onChange={(e) => setNote(e.target.value)}
                  disabled={!canEditItems}
                />
              </div>
            </div>
          </div>
          <div className="bg-white col-span-9 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] row-span-5 col-start-1 row-start-6 border 2xl:p-4 p-2 rounded-2xl gap-2 2xl:gap-4 3xl:max-h-[360px] 2xl:max-h-[300px] max-h-[250px] overflow-hidden">
            <div className="flex gap-4">
              <h3 className="font-semibold"> Thông tin sản phẩm </h3>
            </div>

            {status === "returning" && (
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

            <div
              className={cn(
                "mt-4 overflow-y-auto scrollbar-hidden max-h-[200px]"
                // status !== "returning" ? "max-h-[300px]" : "max-h-[200px]"
              )}
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
                        Số lượng
                      </th>
                      <th className="text-[13px] 3xl:text-[15px] ant-table-cell sticky top-0 w-[120px]">
                        Đơn giá
                      </th>
                      {/* <th className="text-[13px] 3xl:text-[15px] ant-table-cell sticky top-0 w-[80px]">
                        CK (%)
                      </th> */}
                      <th className="text-[13px] 3xl:text-[15px] ant-table-cell sticky top-0 w-[120px]">
                        Thành tiền
                      </th>
                      <th className="text-[13px] 3xl:text-[15px] ant-table-cell sticky top-0 w-[40px] rounded-tr-xl"></th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {items.map((item, idx) => {
                      const product = item.product || ({} as Product);
                      const lineTotal = item.total_line;
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 border-b cursor-pointer text-[13px] 3xl:text-[15px]"
                        >
                          <td className="p-2">{idx + 1}</td>
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
                          {/* <td className="text-[13px] 3xl:text-[15px]">
                            {item.price.toLocaleString("en-ES")}
                          </td> */}
                          <td>
                            <input
                              type="text"
                              className="border p-1 rounded-lg w-full text-[13px] 3xl:text-[15px] h-8 3xl:h-10"
                              disabled={!canEditItems}
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
                          {/* <td>
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
                          </td> */}
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
          <div className="bg-white col-span-3 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] row-span-5 col-start-10 row-start-6 border p-2 2xl:p-3 rounded-2xl 3xl:h-[360px] 2xl:h-[300px] h-[250px] flex flex-col">
            <div className="border-gray-300 border-b-[1px] w-full pb-1 3xl:pb-4">
              <div className="flex justify-between font-semibold text-[15px] 3xl:text-[17px]">
                <h3>Giá trị phiếu</h3>
                <span>{subTotal.toLocaleString("en-ES")}</span>
              </div>
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

            <div className="w-full py-2 3xl:py-4 flex flex-col gap-2 3xl:gap-[17px]">
              {/* <div className="flex items-center justify-between">
                <label className="text-[13px] 3xl:text-[15px] font-normal leading-5">
                  Chiết khấu tổng đơn (%)
                </label>
                <div
                  id="ticket-container"
                  className={`relative flex items-center justify-center h-8 3xl:h-[35px] ${
                    discount > 0 ? "bg-[#3AA207]" : "bg-gray-300"
                  } text-white font-bold rounded-[4px] pr-[10px] overflow-hidden`}
                  style={{ width: "48px" }}
                >
                  <div className="absolute w-[7px] h-[13px] bg-white left-0 rounded-r-full"></div>
                  <div className="absolute w-[7px] h-[13px] bg-white right-0 rounded-l-full"></div>
                  <input
                    disabled={!canEditItems}
                    type="text"
                    className="h-8 3xl:h-10 text-[13px] 3xl:text-[15px] bg-transparent text-center font-bold outline-none focus:outline-none focus:ring-0 focus:border-transparent focus:shadow-none appearance-none placeholder:text-white border-transparent"
                    placeholder="0"
                    value={discount === 0 ? "" : discount}
                    maxLength={3}
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
              </div> */}

              <div className="flex items-center justify-between">
                <label className="font-normal text-[13px] 3xl:text-[15px] leading-5">
                  Thêm chi phí
                </label>
                <input
                  disabled={!canEditItems}
                  type="text"
                  className="h-9 3xl:h-10 p-1 w-[120px] text-right rounded-md border-[#3C3C4359] text-[13px] 3xl:text-[15px] font-semibold leading-5"
                  value={extraFee === 0 ? "" : extraFee.toLocaleString("en-ES")}
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
            </div>

            <div className="flex h-full items-end">
              <div className="border-gray-300 border-t-[1px] w-full flex justify-between pt-2 3xl:pt-4 text-[#e50000] text-[15px] 3xl:text-[17px]">
                <p className="font-semibold leading-[22px]">Còn phải trả</p>
                <p>
                  <b>{grandTotal.toLocaleString("en-ES")}</b>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 gap-2">
          <button
            // onClick={handleCancel}
            onClick={() => setIsDeletePopupOpen(true)}
            disabled={!canEditItems}
            className={cn(
              "px-4 3xl:py-2 rounded-md text-[13px] 3xl:text-[15px] h-8 3xl:min-h-10",
              canEditItems
                ? "bg-[#E50000] text-white"
                : "bg-[#77777E1A] text-[#3C3C4366]"
            )}
          >
            Huỷ phiếu
          </button>

          <button
            onClick={handleSave}
            disabled={!canEditItems}
            className={cn(
              "px-4 3xl:py-2 rounded-md text-[13px] 3xl:text-[15px] h-8 3xl:min-h-10",
              canEditItems
                ? "border border-blue-500 text-blue-500"
                : "bg-[#77777E1A] text-[#3C3C4366]"
            )}
          >
            Lưu chỉnh sửa
          </button>

          <button
            onClick={handleConfirm}
            disabled={!canEditItems}
            className={cn(
              "px-4 3xl:py-2 rounded-md text-[13px] 3xl:text-[15px] h-8 3xl:min-h-10",
              canEditItems
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-[#77777E1A] text-[#3C3C4366]"
            )}
          >
            Xác nhận trả hàng
          </button>
        </div>
        {isDeletePopupOpen && (
          <PopupDelete
            isOpen={isDeletePopupOpen}
            onClose={() => setIsDeletePopupOpen(false)}
            onConfirm={handleCancel}
            message={`Hệ thống sẽ huỷ phiếu trả #${returnId} và không thể khôi phục.`}
          />
        )}
      </div>
    </div>
  );
}