"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  CloseOutlined,
  FmdGoodOutlined,
  LiveHelpOutlined,
  EditOutlined,
  DeleteOutlineOutlined,
  ReportGmailerrorred,
  CheckCircleOutlined,
  ArrowDropDown,
  DeleteForeverOutlined,
  SearchOutlined,
  ArrowDropDownOutlined,
} from "@mui/icons-material";

import {
  fetchEmployeeData,
  fetchProductsName,
  createTransferStock,
} from "@/app/lib/data";
import {
  Product,
  Employee,
} from "@/app/lib/definitions";

import PopupEmployees from "@/app/components/PopupEmployees";
import PopupProductList from "@/app/components/PopupProductList";
import NoData from "@/app/components/NoData";
import Select from "../select";
import { cn } from "@/app/lib/utils";


interface PopupCreateReturnProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AddedItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  total_line: number;
}

export default function PopupCreateReturn({
  isOpen,
  onClose,
}: PopupCreateReturnProps) {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  // EMPLOYEE
  const [employeeName, setEmployeeName] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isEmployeePopupVisible, setIsEmployeePopupVisible] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [employeeResults, setEmployeeResults] = useState<Employee[]>([]);

  // PRODUCT
  const [isProductPopupVisible, setIsProductPopupVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProductFocused, setIsProductFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  // FORM FIELDS
  const [note, setNote] = useState("");
  const [extraFee, setExtraFee] = useState<number>(0);

  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);
  const itemIdRef = useRef<number>(1);

  const [fromWarehouse, setFromWarehouse] = useState("Terra");
  const [toWarehouse, setToWarehouse] = useState("Thợ Nhuộm");

  if (!isOpen) return null;

  const subTotal = addedItems.reduce((acc, it) => acc + it.total_line, 0) + extraFee;
  const totalItems = addedItems.reduce((acc, it) => acc + it.quantity, 0);

  const handleSearchChange = async (value: string) => {
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
    setAddedItems((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((x) => x.product.id === product.id);

      if (index !== -1) {
        const existing = updated[index];
        const newQty = existing.quantity + 1;
        const raw = newQty * existing.price;
        updated[index] = {
          ...existing,
          quantity: newQty,
          total_line: raw,
        };
      } else {
        const rawPrice = product.price_retail; // giá lẻ
        updated.push({
          id: itemIdRef.current++,
          product,
          quantity: 1,
          price: rawPrice,
          total_line: rawPrice,
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

  const handleChangeQuantity = (itemId: number, value: number) => {
    if (value < 0 || value > 999) return;
    setAddedItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const raw = value * it.price;
          return {
            ...it,
            quantity: value,
            total_line: raw,
          };
        }
        return it;
      })
    );
  };

  const handleRemoveItem = (itemId: number) => {
    setAddedItems((prev) => prev.filter((x) => x.id !== itemId));
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployeeId(employee.id);
    setEmployeeName(employee.full_name);
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

  const handleCreateTransfer = async () => {
    if (!selectedEmployeeId) {
      setMessage("Vui lòng chọn nhân viên!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }
    if (!fromWarehouse || !toWarehouse) {
      setMessage("Vui lòng chọn đủ kho chuyển - kho nhận!");
      setMessageType("error");
      return;
    }
    if (fromWarehouse === toWarehouse) {
      setMessage("Không thể chuyển cùng 1 kho!");
      setMessageType("error");
      return;
    }
    if (addedItems.length === 0) {
      setMessage("Vui lòng thêm sản phẩm!");
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
        items: addedItems.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
        })),
      };

      console.log(payload)
      await createTransferStock(token, payload);
      setMessage("Tạo phiếu chuyển hàng thành công");
      setMessageType("success");

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setMessage(error.message);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
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

        <div className="bg-[#f2f2f7] w-full xl:w-[80vw] 3xl:w-[73vw] xl:p-3 xl:max-h-[97vh] 3xl:p-6 rounded-2xl p-6 max-lg-padding relative">
          <div className="flex justify-between 2xl:mb-4 mb-2 ">
            <h2 className="font-semibold text-xl 3xl:text-2xl text-black">
              Tạo phiếu chuyển hàng
            </h2>
            <button className="text-[#3C3C43B2]" onClick={onClose}>
              <CloseOutlined />
            </button>
          </div>

          {/* info */}
          <div className="border rounded-2xl 2xl:p-4 p-2 h-fit 2xl:mb-4 mb-2 bg-white">
            <div className="flex justify-start">
              <h3 className="text-[15px] 3xl:text-[17px] leading-[22px] text-black font-bold mb-4">Thông tin phiếu chuyển</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Chi nhánh */}
              <div className="relative">
                <label className="text-[13px] 3xl:text-[15px] leading-5 font-semibold text-[#242428] block mb-1 text-left">Chi nhánh chuyển</label>
                <Select 
                  options={[
                    {value: "Terra", label: "Terra"},
                    {value: "Thợ Nhuộm", label: "Thợ Nhuộm"}
                  ]}
                  onSelect={(val) => setFromWarehouse(val)}
                  defaultValue={fromWarehouse}
                  wrapperClassName="w-full h-8 3xl:h-10"
                  btnClassName="h-full bg-transparent border-[#3C3C4359] text-black text-[13px] 3xl:text-[15px]"
                />
              </div>

              <div className="relative">
                <label className="text-[13px] 3xl:text-[15px] leading-5 font-semibold text-[#242428] block mb-1 text-left">Chi nhánh nhận</label>
                <Select 
                  options={[
                    {value: "Terra", label: "Terra"},
                    {value: "Thợ Nhuộm", label: "Thợ Nhuộm"}
                  ]}
                  onSelect={(val) => setToWarehouse(val)}
                  defaultValue={toWarehouse}
                  wrapperClassName="w-full h-8 3xl:h-10"
                  btnClassName="h-full bg-transparent border-[#3C3C4359] text-black text-[13px] 3xl:text-[15px]"
                />
              </div>

              <div>
                <label className="text-[13px] 3xl:text-[15px] leading-5 font-semibold text-[#242428] block mb-1 text-left">Nhân viên</label>
                <div className="relative block">
                  <input
                    className="border border-[#3C3C4359] p-2 rounded-md w-full h-8 3xl:h-10 font-normal text-[13px] 3xl:text-[15px] leading-5"
                    placeholder="Chọn nhân viên..."
                    value={employeeName}
                    onFocus={() => {
                      handleEmployeeSearchChange("");
                      setIsEmployeePopupVisible(true);
                    }}
                    onChange={(e) => {
                      setEmployeeName(e.target.value);
                      handleEmployeeSearchChange(e.target.value);
                      setIsEmployeePopupVisible(true);
                    }}
                  />
                  {isEmployeePopupVisible && (
                    <div className="absolute w-full left-0 top-[45px] z-[15]">
                      <PopupEmployees
                        employees={employeeResults}
                        onSelectEmployee={handleSelectEmployee}
                        onClose={() => setIsEmployeePopupVisible(false)}
                      />
                    </div>

                  )}
                  <ArrowDropDownOutlined
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer pointer-events-none"
                    fontSize="small"
                  />
                </div>
              </div>            

              <div>
                <label className="text-[13px] 3xl:text-[15px] leading-5 font-semibold text-[#242428] block mb-1 text-left ">Ghi chú</label>
                <input
                  type="text"
                  className="border border-[#3C3C4359] text-normal text-[13px] 3xl:text-[15px] leading-5 text-black p-2 rounded-md w-full h-8 3xl:h-10"
                  placeholder="Ghi chú chung"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 2xl:gap-4">
            <div className="col-span-9 row-span-3 border rounded-xl p-2 2xl:p-4 bg-white w-auto xl:h-[300px] 3xl:h-[320px] flex flex-col gap-2 shadow-[0_2px_0_#D9D9D9]">
              <h3 className="text-[15px] 3xl:text-[17px] font-semibold">
                Thông tin sản phẩm
              </h3>
              <div className="relative w-full flex flex-col gap-2">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black font-bold" />
                <input
                  ref={searchInputRef}
                  placeholder="Tìm kiếm sản phẩm"
                  className="h-8 3xl:h-10 px-4 pl-[40px] py-2 border border-none text-[15px] leading-5 bg-[#e9ecf2] p-2 w-full rounded-md"
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

              {/* Table production */}
              {addedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <NoData
                    message="Chưa có thông tin sản phẩm"
                    className="[&_img]:max-w-[57px] [&_p]:!text-[13px] 3xl:[&_p]:!text-[15px]"
                  />
                  <a
                    href="#"
                    className="text-blue-500 text-[12px] leading-4 mt-1"
                  >
                    <LiveHelpOutlined
                      className="w-[16px]"
                      sx={{ fontSize: 18 }}
                    />{" "}
                    Chọn thanh tìm kiếm để chọn sản phẩm
                  </a>
                </div>
              ) : (
                <div className="max-h-[250px] flex-1 overflow-y-auto scrollbar-hidden">
                  <table className="w-full table-fixed border-collapse">
                    <thead className="h-8 3xl:h-10 ant-table-thead bg-[#ededf0] sticky top-0 z-10 rounded-t-lg">
                      <tr className="bg-gray-100 rounded-t-xl text-[13px] 3xl:text-[17px]  text-xs shadow-[0_1px_1px_0px_#4F49502E]">
                        <th className="w-[40px] rounded-tl-xl ant-table-cell sticky top-0">
                          STT
                        </th>
                        <th className="w-[80px] ant-table-cell sticky top-0">
                          Ảnh
                        </th>
                        <th className="w-[200px] ant-table-cell sticky top-0">
                          Tên sản phẩm
                        </th>
                        <th className="w-[110px] ant-table-cell sticky top-0">
                          Tồn CN chuyển
                        </th>
                        <th className="w-[80px] ant-table-cell sticky top-0">
                          SL chuyển
                        </th>
                        <th className="w-[80px] ant-table-cell sticky top-0">
                          Đơn giá
                        </th>
                        <th className="w-[100px] ant-table-cell sticky top-0">
                          Thành tiền
                        </th>
                        <th className="w-[40px] ant-table-cell sticky top-0 rounded-tr-xl"></th>
                      </tr>
                    </thead>
                    <tbody className="text-center text-[13px] 3xl:text-[17px] ">
                      {addedItems.map((it, idx) => (
                        <tr
                          key={it.id}
                          className="hover:bg-gray-100 border-b cursor-pointer"
                        >
                          <td className="p-2">{idx + 1}</td>
                          <td>
                            <div className="flex justify-center p-1">
                              <Image
                                src={
                                  it.product.image_url ||
                                  (it.product.images?.[0]?.url
                                    ? `${process.env.NEXT_PUBLIC_DEV_API}${it.product.images[0].url}`
                                    : "/customers/amy-burns.png")
                                }
                                alt={"product"}
                                width={256}
                                height={256}
                                className="object-cover rounded-lg w-10 h-10"
                                //unoptimized
                              />
                            </div>
                          </td>
                          <td className="text-left">
                            <p className="line-clamp-2">{it.product.name}</p>
                          </td>
                          <td className="text-right px-2">
                            {fromWarehouse === "Thợ Nhuộm"
                              ? it.product.thonhuom_stock?.toLocaleString("en-ES")
                              : it.product.terra_stock?.toLocaleString("en-ES")}
                          </td>
                          <td>
                            <input
                              type="number"
                              className="border w-16 p-1 rounded-lg text-[13px] 3xl:text-[17px]"
                              value={it.quantity === 0 ? "" : it.quantity}
                              placeholder="0"
                              min="0"
                              max="999"
                              onChange={(e) =>
                                handleChangeQuantity(
                                  it.id,
                                  Number(e.target.value)
                                )
                              }
                            />
                          </td>                        
                          <td>{it.price.toLocaleString("en-ES")}</td>  
                          <td className="font-semibold text-center pr-2">
                            {it.total_line.toLocaleString("en-ES")}
                          </td>
                          <td>
                            <button
                              className="text-red-500"
                              onClick={() => handleRemoveItem(it.id)}
                            >
                              <DeleteForeverOutlined />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 3xl:gap-4 col-span-3 row-span-3 col-start-10 border rounded-xl p-2 bg-white xl:h-[300px] 3xl:h-[320px] shadow-[0_2px_0_#D9D9D9]">
              <div className="flex flex-row justify-between border-b pb-1">
                <div className="leading-tight">
                  <h3 className="font-bold mr-1 text-[15px] 3xl:text-[17px] leading-[22px]">
                    Giá trị phiếu
                  </h3>
                  <span className="text-[#3C3C43B2] text-[13px]">
                    (
                    <span className="text-[#338BFF] text-[13px] 3xl:text-[15px]">
                      {totalItems}
                    </span>{" "}
                    sản phẩm)
                  </span>
                </div>

                <h3 className="font-semibold leading-[22px] text-[15px] 3xl:text-[17px]">
                  {subTotal.toLocaleString("en-ES")}
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <label className="font-normal text-[13px] 3xl:text-[17px] leading-5">
                  Phí vận chuyển
                </label>
                <input
                  type="text"
                  className="min-h-5 h-8 3xl:h-10 p-1 w-[120px] text-right rounded-md border-[#3C3C4359] text-[13px] 3xl:text-[17px] font-semibold leading-5"
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
          </div>

          <div className="col-span-12 flex justify-end mt-4">
            <button
              onClick={handleCreateTransfer}
              className="bg-[#338bff] hover:bg-[#66b2ff] text-white px-4 rounded-md mt-0 h-8 3xl:h-10 text-[13px] 3xl:text-[17px]"
            >
              Tạo phiếu chuyển
            </button>
          </div>
        </div>
      </div>
    </>
  );
}