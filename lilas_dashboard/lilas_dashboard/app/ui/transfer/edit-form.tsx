"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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
  getTransferStockById,
  updateTransferStock,
  completeTransferStock,

  changeTransferStockStatus,
  fetchEmployeeData,
  fetchSuppliersData,
  fetchProductsName,
  cancelTransferStock,
} from "@/app/lib/data";

import {
  TransactionTranferResponse,
  TransactionTranferCreate,
  Product,
  Employee,
} from "@/app/lib/definitions";

import StatusBadge from "@/app/ui/status";
import PopupEmployees from "@/app/components/PopupEmployees";
// import PopupSearchProducts from "@/app/components/PopupSearchProducts";
import PopupProductList from "@/app/components/PopupProductList";
import PopupDelete from "@/app/components/PopupDelete";
import Select from "../select";
import { cn } from "@/app/lib/utils";
import { Tooltip } from "react-tooltip";
import NoData from "@/app/components/NoData";
import PopupSkeleton from "@/app/components/PopupSkeleton";

interface PopupEditTransferProps {
  isOpen: boolean;
  onClose: () => void;
  transferId: string;
  onSaved: (updated: TransactionTranferResponse) => void;
}

export default function PopupEditTransfer({
  isOpen,
  onClose,
  transferId,
  onSaved,
}: PopupEditTransferProps) {
  const [transfer, setTransfer] = useState<TransactionTranferResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

  const [fromWarehouse, setFromWarehouse] = useState("");
  const [toWarehouse, setToWarehouse] = useState("");
  const [note, setNote] = useState("");
  const [extraFee, setExtraFee] = useState(0);
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<TransactionTranferCreate["items"]>([]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  // For Employee
  const [employeeName, setEmployeeName] = useState("");
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [employeeResults, setEmployeeResults] = useState<Employee[]>([]);
  const [isEmployeePopupVisible, setIsEmployeePopupVisible] = useState(false);

  // For Product
  const [searchTerm, setSearchTerm] = useState("");
  const [isProductPopupVisible, setIsProductPopupVisible] = useState(false);
  const [isProductFocused, setIsProductFocused] = useState(false);
  const [productDetails, setProductDetails] = useState<Record<string, Product>>({});
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchProductDetails = useCallback(async (productIds: string[]) => {
    if (!productIds.length) return;
    
    try {
      const token = localStorage.getItem("access_token") || "";
      const { products } = await fetchProductsName(token, 0, 50, "");
      const productMap: Record<string, Product> = {};
      products.forEach(product => {
        productMap[product.id] = product;
      });
      // console.log("Product map:", productMap);
      setProductDetails(productMap);
      return productMap;
    } catch (err) {
      console.error("Error fetching product details:", err);
      return {};
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    async function loadBill() {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token") || "";
        const data = await getTransferStockById(token, transferId);
        setTransfer(data);
        console.log("Transfer data:", data);

        
        setSelectedEmployeeId(data.user_id || "");
        setEmployeeName(data.user?.full_name || "");

        setFromWarehouse(data.from_warehouse);
        setToWarehouse(data.to_warehouse);
        setNote(data.note || "");
        setExtraFee(data.extra_fee || 0);
        setStatus(data.status);
        setItems(data.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })));

        setSearchResults(data.items.map(item => item.product).filter((product): product is Product => !!product));

        // Fetch product details for all items
        const productIds = data.items.map(item => item.product_id);
        await fetchProductDetails(productIds);

        // if (data.user_id) {
        //   setSelectedEmployeeId(data.user_id);
        //   // Fetch employee name if needed
        //   const { users } = await fetchEmployeeData(token, 1, 1, data.user_id);
        //   if (users.length > 0) {
        //     setEmployeeName(users[0].full_name);
        //   }
        // }
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
  }, [isOpen, transferId, fetchProductDetails]);

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

  // const handleSearchChange = async (term: string) => {
  //   setSearchTerm(term);
  //   if (!term) {
  //     try {
  //       const token = localStorage.getItem("access_token") || "";
  //       const { products } = await fetchProductsName(token, 0, 50, "");
  //       setSearchResults(products);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //     return;
  //   }
  //   try {
  //     const token = localStorage.getItem("access_token") || "";
  //     const { products } = await fetchProductsName(token, 0, 50, term);
  //     setSearchResults(products);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleSelectProduct = (product: Product) => {
    if (!canEditItems) return;

    setSearchResults((prev) => {
      const exists = prev.some(p => p.id === product.id);
      if (!exists) {
        return [...prev, product];
      }
      return prev;
    });

    setItems((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((x) => x.product_id === product.id);
      if (idx !== -1) {
        const ex = updated[idx];
        updated[idx] = { ...ex, quantity: ex.quantity + 1 };
      } else {
        updated.push({
          product_id: product.id,
          quantity: 1
        });
      }
      return updated;
    });
    
    // Clear search and remove focus
    setSearchTerm("");
    setIsProductPopupVisible(false);
    setIsProductFocused(false);
    searchInputRef.current?.blur();
  };

  if (!isOpen) return null;
  if (loading || !transfer) {
    // return (
    //   <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
    //     <div className="bg-white p-6 rounded-md">Đang tải dữ liệu...</div>
    //   </div>
    // );
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        <PopupSkeleton type="transfer" />
      </div>
    );
  }

  const canEditItems = status === "ready_to_pick" 
  // || status === "delivering";
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  const totalPrice = items.reduce((acc, item) => {
    const product = searchResults.find((p) => p.id === item.product_id);
    return acc + (product?.price_retail || 0) * item.quantity;
  }, 0);

  const grandTotal = totalPrice + extraFee;

  const handleUpdateItem = (index: number, field: string, value: number) => {
    if (!canEditItems) return;
    setItems((prev) =>
      prev.map((it, i) => {
        if (i === index) {
          return { ...it, [field]: value };
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
    if(items.length === 0) {
      setMessage("Vui lòng chọn sản phẩm!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }

    if (items.some((item) => item.quantity <= 0)) {
      setMessage("Vui lòng kiểm tra lại số lượng sản phẩm!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }

    try {
      const token = localStorage.getItem("access_token") || "";
      const payload = {
        user_id: selectedEmployeeId,
        from_warehouse: fromWarehouse,
        to_warehouse: toWarehouse,
        extra_fee: extraFee,
        note,
        items: items.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
        })),
      };

      console.log(payload)
      const updated = await updateTransferStock(token, transferId, payload);
      setTransfer(updated);
      setStatus(updated.status);
      onSaved(updated);
      setMessage("Đã lưu chỉnh sửa phiếu chuyển!");
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
    if(items.length === 0) {
      setMessage("Vui lòng chọn sản phẩm!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }

    if (items.some((item) => item.quantity <= 0)) {
      setMessage("Vui lòng kiểm tra lại số lượng sản phẩm!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }
    try {
      if (!transfer) return;
      const token = localStorage.getItem("access_token") || "";
      const updated = await completeTransferStock(token, transferId);
      setTransfer(updated);
      setStatus(updated.status);
      onSaved(updated);
      setMessage("Xác nhận nhận hàng thành công.");
      setMessageType("success");
    } catch (error: any) {
      setMessage(error.message);
      setMessageType("error");
    }
  };

  const handleSendShip = async () => {
    if(items.length === 0) {
      setMessage("Vui lòng chọn sản phẩm!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }

    if (items.some((item) => item.quantity <= 0)) {
      setMessage("Vui lòng kiểm tra lại số lượng sản phẩm!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }

    try {
      if (!transfer) return;
      const token = localStorage.getItem("access_token") || "";
      const updated = await changeTransferStockStatus(token, transferId);
      setTransfer(updated);
      setStatus(updated.status);
      onSaved(updated);
      setMessage("Xác nhận gửi hàng thành công.");
      setMessageType("success");
    } catch (error: any) {
      setMessage(error.message);
      setMessageType("error");
    }
  };

  const handleCancel = async () => {
    if (!canEditItems) {
      setMessage("Chỉ hủy được phiếu đang ở trạng thái sẵn sàng lấy hàng hoặc đang vận chuyển.");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }
    
    try {
      const token = localStorage.getItem("access_token") || "";
      const updated = await cancelTransferStock(token, transferId);
      console.log("Updated transfer:", updated);

      setTransfer(updated);
      setStatus(updated.status);
      onSaved(updated);
  
      setMessage("Đã hủy phiếu chuyển hàng!");
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
      <div className="bg-[#F2F2F7] w-full xl:max-w-[73vw] rounded-2xl 3xl:p-6 p-4 relative max-h-[95vh] 3xl:max-h-[800px]">
        <div className="flex justify-between mb-3 3xl:mb-4">
          <div>
            <h2 className="flex text-xl font-bold mb-1 gap-2 items-center">
              <p className="font-semibold text-xl text-black">
                Chi tiết phiếu chuyển #{transfer.id}
              </p>
              <div className="flex justify-between mx-4">
                <p className="font-normal text-[17px] leading-5 text-[#3C3C43B2]">
                  {"  "}
                  {transfer.created_at
                    ? `${new Date(transfer.created_at).toLocaleDateString(
                        "vi-VN"
                      )} • ${new Date(transfer.created_at).toLocaleTimeString(
                        "es-EN",
                        { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }
                      )}`
                    : "-"}
                </p>
              </div>
              <div className="border-gray-300 border-r-[1px] h-full py-4 mr-4 inline-block"></div>
              <StatusBadge type="transfer_status" value={status} />
            </h2>
          </div>
          <button className="text-[#3C3C43B2]" onClick={onClose}>
            <CloseOutlined />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-2 -mt-2 3xl:-mt-0">
          <div className="bg-white col-span-12 shadow-[0_2px_0_#D9D9D9] row-span-4 border 2xl:p-4 p-2 rounded-2xl h-auto 2xl:max-h-[262px]">
            <h3 className="font-semibold mb-2 text-[15px] 3xl:text-[16px]">
              Thông tin phiếu chuyển
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="w-30 text-[15px] 3xl:text-[16px]">
                  Chi nhánh chuyển
                </label>

                <Select
                  options={[
                    { label: "Terra", value: "Terra" },
                    { label: "Thợ Nhuộm", value: "Thợ Nhuộm" },
                  ]}
                  placeholder="Chọn chi nhánh"
                  defaultValue={fromWarehouse}
                  onSelect={(val) => setFromWarehouse(val)}
                  btnClassName="h-8 3xl:h-10 border-[#77777E1A] text-black bg-[#77777E1A] font-medium text-[13px] 3xl:text-[15px]"
                  wrapperClassName="!min-w-full"
                  disabled={!canEditItems}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="w-30 text-[15px] 3xl:text-[16px]">
                  Chi nhánh nhận
                </label>

                <Select
                  options={[
                    { label: "Terra", value: "Terra" },
                    { label: "Thợ Nhuộm", value: "Thợ Nhuộm" },
                  ]}
                  placeholder="Chọn chi nhánh"
                  defaultValue={toWarehouse}
                  onSelect={(val) => setToWarehouse(val)}
                  btnClassName="h-8 3xl:h-10 border-[#77777E1A] text-black bg-[#77777E1A] font-medium text-[13px] 3xl:text-[15px]"
                  wrapperClassName="!min-w-full"
                  disabled={!canEditItems}
                />
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
                  Ngày nhập
                </label>
                <input
                  className="border border-[#77777E1A] bg-[#77777E1A] h-8 3xl:h-10 text-black px-2 rounded-md font-medium text-[13px] 3xl:text-[15px] leading-5"
                  value={
                    transfer.status !== "delivered"
                      ? "--"
                      : `${new Date(transfer.updated_at).toLocaleDateString(
                          "vi-VN"
                        )}`
                  }
                  readOnly
                  // disabled={!canEditItems}
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
          <div className="bg-white col-span-9 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] row-span-5 col-start-1 row-start-6 border 2xl:p-4 p-2 rounded-2xl gap-2 2xlgap-4 xl:max-h-[250px] 2xl:max-h-[300px] 3xl:max-h-[360px] overflow-hidden">
            <div className="flex gap-4">
              <h3 className="font-semibold"> Thông tin sản phẩm </h3>
            </div>

            {status === "ready_to_pick" && (
              <div className="relative mt-2">
                <input
                  ref={searchInputRef}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="border p-2 w-full rounded-[8px] h-8 3xl:h-10 text-[13px] 3xl:text-[15px]"
                  value={searchTerm}
                  onFocus={() => {
                    setIsProductPopupVisible(true);
                    setIsProductFocused(true);
                  }}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsProductPopupVisible(true);
                    setIsProductFocused(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setIsProductFocused(false);
                    }, 200);
                  }}
                />
                {isProductPopupVisible && (
                  <div className="absolute w-full left-0 top-10 3xl:top-[50px]">
                    <PopupProductList
                      searchQuery={searchTerm}
                      onSelectProduct={(prod) => {
                        handleSelectProduct(prod);
                      }}
                      isFocused={isProductFocused}
                      onClose={() => setIsProductPopupVisible(false)}
                    />
                  </div>
                )}
              </div>
            )}

            <div
              className={`mt-4 ${
                status !== "ready_to_pick" ? "xl:max-h-[230px] 3xl:max-h-[290px]" : "xl:max-h-[180px] 3xl:max-h-[240px]"
              } overflow-y-auto scrollbar-hidden`}
            >
              {items.length > 0 ? (
                <table className="w-full table-fixed">
                  <thead className="h-8 3xl:h-10 ant-table-thead sticky top-0 z-10 rounded-t-lg ant-table-thead bg-[#ededf0]">
                    <tr className=" h-8 3xl:h-10 ant-table-thead bg-[#ededf0] sticky top-0 z-10 rounded-t-lg text-[13px] 3xl:text-[17px]">
                      <th className="w-[6.5%] rounded-tl-xl ant-table-cell truncate sticky top-0">
                        STT
                      </th>
                      <th className="w-[6.5%] ant-table-cell truncate sticky top-0">
                        Ảnh
                      </th>
                      <th className="w-[24.5%] ant-table-cell truncate sticky top-0 text-left px-2">
                        Tên sản phẩm
                      </th>
                      <th className="w-[13.5%] ant-table-cell truncate sticky top-0">
                        Tồn CN chuyển
                      </th>
                      <th className="w-[12%] ant-table-cell truncate sticky top-0 text-right px-2">
                        SL chuyển
                      </th>
                      <th className="w-[15.5%] ant-table-cell truncate sticky top-0 text-right px-2">
                        Đơn giá
                      </th>
                      <th className="w-[15.5%] ant-table-cell truncate sticky top-0 text-right px-2">
                        Thành tiền
                      </th>
                      <th className="w-[6%] ant-table-cell truncate sticky top-0 rounded-tr-xl"></th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {items.map((item, idx) => {
                      const product = searchResults.find((p) => p.id === item.product_id) || ({} as Product);
                      const stock = fromWarehouse === "Thợ Nhuộm" 
                        ? product?.thonhuom_stock
                        : product?.terra_stock;
                   
                      return (
                        <tr
                          key={item.product_id}
                          className="hover:bg-gray-50 border-b cursor-pointer text-[13px] 3xl:text-[15px]"
                        >
                          <td className="p-2">{idx + 1}</td>
                          <td>
                            <div className="flex justify-center p-1">
                              <Image
                                src={
                                  product?.image_url ||
                                  (product?.images?.[0]?.url
                                    ? `${process.env.NEXT_PUBLIC_DEV_API}${product.images[0].url}`
                                    : "/customers/amy-burns.png")
                                }
                                alt="Product"
                                width={256}
                                height={256}
                                className="object-cover rounded-lg w-10 h-10"
                              />
                            </div>
                          </td>
                          <td className="text-left px-2">
                            <p
                              className="line-clamp-2 break-all text-[13px] 3xl:text-[15px]"
                              data-tooltip-id="product-name"
                              data-tooltip-content={product?.name || "(No Name)"}
                            >
                              {product?.name || "(No Name)"}
                            </p>
                            <Tooltip
                              id="product-name"
                              place="top"
                              className="z-10"
                            />
                          </td>
                          <td>
                            {stock?.toLocaleString("en-ES") || "0"}
                          </td>
                          <td className="px-1.5">
                            <input
                              type="number"
                              className="border w-full p-1 rounded-lg text-[13px] 3xl:text-[15px] h-8 3xl:h-10 text-right"
                              disabled={!canEditItems}
                              value={item.quantity === 0 ? "" : item.quantity}
                              placeholder="0"
                              onChange={(e) => {
                                let value = Number(e.target.value);
                                if (value < 0) value = 0;
                                if (!!stock && value > stock) value = stock;
                                handleUpdateItem(idx, "quantity", value);
                              }}
                            />
                          </td>
                          <td className="text-right px-2">
                            {product?.price_retail?.toLocaleString("en-ES") || "0"}
                            
                          </td>
                          <td className="text-right px-2">
                            {(
                              product?.price_retail * item.quantity
                            ).toLocaleString("en-ES")}
                            
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
          <div className="bg-white col-span-3 shadow-[0_2px_0_#D9D9D9] shadow-[#d9d9d9] row-span-5 col-start-10 row-start-6 border p-2 2xl:p-3 rounded-2xl xl:h-[250px] 2xl:h-[300px] 3xl:h-[360px] flex flex-col">
            <div className="border-gray-300 border-b-[1px] w-full pb-1 3xl:pb-4">
              <div className="flex justify-between font-semibold text-[15px] 3xl:text-[17px]">
                <h3>Giá trị phiếu</h3>
                <span>{totalPrice.toLocaleString("en-US")}</span>
              </div>
              <span className="font-normal text-[14px] leading-[18px] text-[#3C3C43B2]">
                (
              </span>
              <span className="font-semibold text-[14px] leading-[18px] text-[#338BFF]">
                {totalQuantity}
              </span>
              <span className="font-normal text-[14px] leading-[18px] text-[#3C3C43B2]">
                {" "}
                sản phẩm)
              </span>
            </div>

            <div className="w-full py-2 3xl:py-4 flex flex-col gap-2 3xl:gap-[17px]">
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
            onClick={
              status === "ready_to_pick" ? handleSendShip : handleConfirm
            }
            disabled={status !== "ready_to_pick" && status !== "delivering"}
            className={cn(
              "px-4 3xl:py-2 rounded-md text-[13px] 3xl:text-[15px] h-8 3xl:min-h-10",
              status === "ready_to_pick" || status === "delivering"
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-[#77777E1A] text-[#3C3C4366]"
            )}
          >
            {status === "ready_to_pick"
              ? "Gửi hàng"
              : status === "delivering"
              ? "Nhận hàng"
              : "Không khả dụng"}
          </button>
        </div>
        {isDeletePopupOpen && (
          <PopupDelete
            isOpen={isDeletePopupOpen}
            onClose={() => setIsDeletePopupOpen(false)}
            onConfirm={handleCancel}
            message={`Hệ thống sẽ huỷ phiếu chuyển #${transfer.id} và không thể khôi phục.`}
          />
        )}
      </div>
    </div>
  );
}