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
} from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import {
  fetchEmployeeData,
  fetchSuppliersData,
  fetchProductsName,
  createReturnBill,
} from "@/app/lib/data";
import {
  Supplier,
  Product,
  Employee,
  ReturnBillItem,
} from "@/app/lib/definitions";

import PopupEmployees from "@/app/components/PopupEmployees";
import PopupSuppliers from "@/app/components/PopupSuppliers";
import PopupSearchProducts from "@/app/components/PopupSearchProducts";
import NoData from "@/app/components/NoData";
import Select from "../select";
import { cn } from "@/app/lib/utils";
import PopupEditReturn from "./edit-form";


interface PopupCreateReturnProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AddedItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  discount: number;
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

  // SUPPLIER
  const [supplierName, setSupplierName] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [isSupplierPopupVisible, setIsSupplierPopupVisible] = useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [supplierResults, setSupplierResults] = useState<Supplier[]>([]);

  // PRODUCT
  const [isProductPopupVisible, setIsProductPopupVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  // FORM FIELDS
  const [branch, setBranch] = useState("Terra");
  const [note, setNote] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [extraFee, setExtraFee] = useState<number>(0);
  const [deliveryDate, setDeliveryDate] = useState<string>("");

  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);
  const itemIdRef = useRef<number>(1);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(
      null
    );

  if (!isOpen) return null;

  const subTotal = addedItems.reduce((acc, it) => acc + it.total_line, 0);
  const totalItems = addedItems.reduce((acc, it) => acc + it.quantity, 0);
  const grandTotal = subTotal * (1 - discount / 100) + extraFee;

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
        const lineDiscount = raw * (existing.discount / 100);
        updated[index] = {
          ...existing,
          quantity: newQty,
          total_line: raw - lineDiscount,
        };
      } else {
        const rawPrice = product.price_import; // giá nhập
        updated.push({
          id: itemIdRef.current++,
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

  const handleChangeQuantity = (itemId: number, value: number) => {
    if (value < 0 || value > 999) return;
    setAddedItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const raw = value * it.price;
          const lineDiscount = raw * (it.discount / 100);
          return {
            ...it,
            quantity: value,
            total_line: raw - lineDiscount,
          };
        }
        return it;
      })
    );
  };

  const handleChangeDiscount = (itemId: number, value: number) => {
    setAddedItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const raw = it.quantity * it.price;
          const lineDiscount = raw * (value / 100);
          return {
            ...it,
            discount: value,
            total_line: raw - lineDiscount,
          };
        }
        return it;
      })
    );
  };

  const handleChangePrice = (itemId: number, value: number) => {
    setAddedItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const raw = it.quantity * value;
          const lineDiscount = raw * (it.discount / 100);
          return {
            ...it,
            price: value,
            total_line: raw - lineDiscount,
          };
        }
        return it;
      })
    );
  }

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

  const handleSelectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSupplierName(supplier.contact_name);
    setIsSupplierPopupVisible(false);
  };
  const handleSupplierSearchChange = async (value: string) => {
    setSupplierSearchTerm(value);
    try {
      const token = localStorage.getItem("access_token") || "";
      const { suppliers } = await fetchSuppliersData(token, 50, 1, value);
      setSupplierResults(suppliers);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateReturn = async () => {
    if (!selectedSupplier) {
      setMessage("Vui lòng chọn nhà cung cấp!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }
    if (!selectedEmployeeId) {
      setMessage("Vui lòng chọn nhân viên!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }
    if (!branch) {
      setMessage("Vui lòng chọn chi nhánh!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
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
        supplier_id: selectedSupplier.id,
        user_id: selectedEmployeeId,
        branch,
        note,
        discount,
        extra_fee: extraFee,
        items: addedItems.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
          price: it.price,
          discount: it.discount,
        })),
      };

      const res = await createReturnBill(token, payload);
      console.log(res);
      setMessage("Tạo phiếu trả hàng thành công");
      setMessageType("success");

      setSelectedReturnId(res.id);

      setTimeout(() => setMessage(""), 5000);
      
      setTimeout(() => {
        setIsEditOpen(true);
      }, 100);

      // setTimeout(() => {
      //   onClose();
      //   window.location.reload();
      // }, 1500);
    } catch (error: any) {
      setMessage(error.message);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedReturnId(null);
    onClose();
    window.location.reload();
  };

  const handleSaved = (updated: any) => {};

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

        <div className="bg-[#f2f2f7] w-full xl:w-[80vw] 3xl:w-[73vw] xl:max-h-[97vh] rounded-2xl p-6 max-lg-padding relative">
          <div className="flex justify-between 2xl:mb-4 mb-2 ">
            <h2 className="font-semibold text-xl 3xl:text-2xl text-black">
              Tạo phiếu trả hàng
            </h2>
            <button className="text-[#3C3C43B2]" onClick={onClose}>
              <CloseOutlined />
            </button>
          </div>

          <div className="grid grid-cols-12 gap-3 3xl:gap-4">
            {/* NCC */}
            <div className="col-span-8 row-span-2 border rounded-[16px] 2xl:p-4 p-2 bg-white shadow-[0_2px_0_#D9D9D9]">
              <h3 className="text-[15px] 3xl:text-[17px] font-semibold mb-2">
                Thông tin nhà cung cấp
              </h3>
              <div className="relative">
                {!selectedSupplier ? (
                  <>
                    <div className="relative w-full flex flex-col gap-2">
                      <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black font-bold" />
                      <input
                        placeholder="Tìm kiếm nhà cung cấp"
                        className="h-8 3xl:h-10 border border-none px-4 pl-[40px] py-2 text-[15px] leading-5 w-full rounded-md bg-[#e9ecf2]"
                        value={supplierName}
                        onFocus={() => {
                          handleSupplierSearchChange("");
                          setIsSupplierPopupVisible(true);
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSupplierName(val);
                          handleSupplierSearchChange(val);
                          setIsSupplierPopupVisible(true);
                        }}
                      />
                    </div>

                    <div className="mt-2 3xl:mt-10 flex flex-col items-center justify-center text-center text-gray-500">
                      {/* <div className="flex items-center justify-center mb-2">
                        <Image 
                          src={"/not_found.svg"}
                          alt="Icon Not Found"
                          width={53}
                          height={43}
                        />
                      </div>
                      <p className="text-sm font-semibold text-[#3C3C4366]">Chưa có thông tin nhà cung cấp</p> */}
                      <NoData
                        message="Chưa có thông tin nhà cung cấp"
                        className="[&_img]:max-w-[57px] [&_p]:!text-[13px] 3xl:[&_p]:!text-[15px]"
                      />
                      <a
                        href="#"
                        className="text-[#0058CC] text-[12px] leading-4 mt-1"
                      >
                        <LiveHelpOutlined
                          className="w-[16px]"
                          sx={{ fontSize: 18 }}
                        />{" "}
                        Chọn thanh tìm kiếm để chọn nhà cung cấp
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center"></div>
                )}

                {isSupplierPopupVisible && !selectedSupplier && (
                  <div className="absolute w-full left-0 top-8 3xl:top-10">
                    <PopupSuppliers
                      suppliers={supplierResults}
                      onSelectSupplier={(sp) => {
                        setSelectedSupplier(sp);
                        setSupplierName(sp.contact_name);
                        setIsSupplierPopupVisible(false);
                      }}
                      onClose={() => setIsSupplierPopupVisible(false)}
                    />
                  </div>
                )}
              </div>

              {/* {selectedSupplier && (
                <div className="border border-gray-300 rounded-md">
                  <div className="flex justify-end pr-6">
                    <button
                      className="text-[#3c3c43b2] py-4 text-sm"
                      onClick={() => {
                        setSelectedSupplier(null);
                        setSupplierName("");
                      }}
                    >
                      <CloseOutlined className="w-6 h-6 text-[#3c3c43b2]" />
                    </button>
                  </div>

                  <div className="px-6 pb-6 pt-0 grid grid-cols-3">
                    <div className="col-span-1">
                      <p className="font-semibold text-start line-clamp-2 max-w-[200px]">
                        {selectedSupplier.contact_name}
                      </p>
                      <div className="flex">
                        <FmdGoodOutlined className="w-5 h-5 float-left text-[#3c3c43b2] mr-2" />
                        <p className="text-[#3c3c43b2] line-clamp-5 max-w-[200px] text-start">
                          {selectedSupplier.address || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 flex flex-col gap-[17px] justify-between w-full pl-7">
                      <div className="flex justify-between items-center">
                        <label className="text-[15px] leading-5 font-semibold text-[#3c3c43a6] text-opacity-70">
                          Nợ hiện tại
                        </label>
                        <input
                          type="text"
                          disabled
                          className="w-[288px] text-right h-[38px] bg-gray-200 border-none focus:outline-none bg-opacity-70 rounded-md text-[15px] leading-5 font-semibold text-[#e50000] cursor-not-allowed"
                          value={selectedSupplier.debt.toLocaleString("en-ES")}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <label className="text-[15px] leading-5 font-semibold text-[#3c3c43a6] text-opacity-70">
                          Tổng đơn nhập (
                          {selectedSupplier.total_import_orders || "0"})
                        </label>
                        <input
                          type="text"
                          value={selectedSupplier.total_import_value.toLocaleString(
                            "en-ES"
                          )}
                          disabled
                          className="w-[288px] text-right h-[38px] bg-gray-200 border-none focus:outline-none bg-opacity-70 rounded-md text-[15px] leading-5 font-semibold text-[#0061fd] cursor-not-allowed"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <label className="text-[15px] leading-5 font-semibold text-[#3c3c43a6]">
                          Trả hàng (
                          {selectedSupplier.total_return_orders || "0"})
                        </label>
                        <input
                          type="text"
                          value={selectedSupplier.total_return_value.toLocaleString(
                            "en-ES"
                          )}
                          disabled
                          className="w-[288px] text-right h-[38px] bg-gray-200 border-none focus:outline-none bg-opacity-70 rounded-md text-[15px] leading-5 font-semibold text-[#e50000] cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )} */}
              {selectedSupplier && (
                <div className="border border-gray-300 rounded-md">
                  <div className="flex justify-end pr-6">
                    <button
                      className="text-[#3c3c43b2] py-4 text-sm"
                      onClick={() => {
                        setSelectedSupplier(null);
                        setSupplierName("");
                      }}
                    >
                      <CloseOutlined className="w-6 h-6 text-[#3c3c43b2]" />
                    </button>
                  </div>

                  <div className="px-4 pb-4 3xl:px-6 3xl:pb-6 pt-0 grid grid-cols-3 text-[13px] 3xl:text-[17px]">
                    <div className="col-span-1">
                      <p className="font-semibold text-start line-clamp-2 max-w-[200px]">
                        {selectedSupplier.contact_name}
                      </p>
                      <div className="flex">
                        <FmdGoodOutlined className="w-5 h-5 float-left text-[#3c3c43b2] mr-2" />
                        <p className="text-[#3c3c43b2] line-clamp-5 max-w-[200px] text-start">
                          {selectedSupplier.address || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 flex flex-col gap-2.5 3xl:gap-[17px] justify-between w-full pl-0 3xl:pl-7">
                      <div className="flex justify-between items-center">
                        <label className="leading-5 font-semibold text-[#3c3c43a6] text-opacity-70">
                          Nợ hiện tại
                        </label>
                        <input
                          type="text"
                          disabled
                          className="text-[13px] 3xl:text-[17px] w-[288px] text-right h-9 3xl:h-[38px] bg-gray-200 border-none focus:outline-none bg-opacity-70 rounded-md leading-5 font-semibold text-[#e50000] cursor-not-allowed"
                          value={selectedSupplier.debt.toLocaleString("en-ES")}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <label className="leading-5 font-semibold text-[#3c3c43a6] text-opacity-70">
                          Tổng đơn nhập (
                          {selectedSupplier.total_import_orders || "0"})
                        </label>
                        <input
                          type="text"
                          value={selectedSupplier.total_import_value.toLocaleString(
                            "en-ES"
                          )}
                          disabled
                          className="text-[13px] 3xl:text-[17px] w-[288px] text-right h-9 3xl:h-[38px] bg-gray-200 border-none focus:outline-none bg-opacity-70 rounded-md leading-5 font-semibold text-[#0061fd] cursor-not-allowed"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <label className="leading-5 font-semibold text-[#3c3c43a6]">
                          Trả hàng (
                          {selectedSupplier.total_return_orders || "0"})
                        </label>
                        <input
                          type="text"
                          value={selectedSupplier.total_return_value.toLocaleString(
                            "en-ES"
                          )}
                          disabled
                          className="text-[13px] 3xl:text-[17px] w-[288px] text-right h-9 3xl:h-[38px] bg-gray-200 border-none focus:outline-none bg-opacity-70 rounded-md leading-5 font-semibold text-[#e50000] cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* THÔNG TIN PHIẾU TRẢ */}
            <div className="col-span-4 row-span-2 col-start-9 border rounded-2xl p-3 h-auto bg-white shadow-[0_2px_0_#D9D9D9]">
              <h3 className="font-semibold text-[15px] 3xl:text-[17px]">
                Thông tin phiếu trả hàng
              </h3>

              <div className="flex flex-col gap-4 3xl:gap-[17px] mt-2">
                <div className="flex justify-between items-center h-8 3xl:h-10">
                  <label className="block text-[13px] 3xl:text-[17px] leading-5 text-[#242428]">
                    Chi nhánh
                  </label>
                  <Select
                    options={[
                      { label: "Terra", value: "Terra" },
                      { label: "Thợ Nhuộm", value: "Thợ Nhuộm" },
                    ]}
                    placeholder="Chọn chi nhánh"
                    onSelect={(val) => setBranch(val)}
                    btnClassName="bg-transparent text-black h-full border-[#3C3C4359] text-[13px] 3xl:text-[17px]"
                    wrapperClassName="h-full"
                    itemClassName="text-[13px] 3xl:text-[17px]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <label className="block text-[13px] 3xl:text-[17px] leading-5 text-[#242428]">
                    Nhân viên
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="text-[13px] 3xl:text-[17px] border border-[#3C3C4359] p-2 rounded-md w-48 h-8 3xl:h-10 placeholder:text-[#3C3C4366]"
                      placeholder="Chọn nhân viên"
                      value={employeeName}
                      onFocus={() => {
                        handleEmployeeSearchChange("");
                        setIsEmployeePopupVisible(true);
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmployeeName(val); // hiển thị
                        handleEmployeeSearchChange(val); // fetch
                        setIsEmployeePopupVisible(true);
                      }}
                    />
                    {isEmployeePopupVisible && (
                      <div className="absolute w-full left-0 top-9">
                        <PopupEmployees
                          employees={employeeResults}
                          onSelectEmployee={handleSelectEmployee}
                          onClose={() => setIsEmployeePopupVisible(false)}
                        />
                      </div>
                    )}
                    <div className="absolute right-1 text-right top-1/2 transform -translate-y-1/2 text-[#3C3C43B2]">
                      <ArrowDropDown
                        className={cn(
                          "mr-[7px]",
                          selectedEmployeeId ? "text-black" : "text-inherit"
                        )}
                        fontSize="small"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <label className="block text-[13px] 3xl:text-[17px] leading-5 text-[#242428]">
                    Hẹn ngày giao
                  </label>
                  <div className="relative w-48">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        className="w-48"
                        format="DD/MM/YYYY"
                        value={deliveryDate ? dayjs(deliveryDate) : null}
                        onChange={(newValue) => {
                          setDeliveryDate(
                            newValue ? newValue.format("YYYY-MM-DD") : ""
                          );
                        }}
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            fullWidth: true,
                            size: "small",
                            InputProps: {
                              className: "!text-[13px] 3xl:!text-[17px]",
                              sx: {
                                borderRadius: "6px",
                                textAlign: "right",
                                display: "flex",
                                alignItems: "center",
                                paddingRight: "8px",
                                // fontSize: "15px",
                                gap: "2px",
                              },
                            },
                            inputProps: {
                              placeholder: "DD/MM/YYYY",
                              className:
                                "placeholder-gray-400 font-[510] focus:ring-0 !pl-2 !py-2 text-[13px] 3xl:text-[17px] 3xl:min-h-6",
                            },
                          },
                          openPickerIcon: {
                            sx: {
                              marginRight: "7px",
                              fontSize: 20,
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </div>

                <div className="flex justify-between items-center h-8 3xl:h-10">
                  <label className="block text-[13px] 3xl:text-[17px] leading-5 text-[#242428]">
                    Ghi chú
                  </label>
                  <div className="relative">
                    <input
                      className="text-[13px] 3xl:text-[17px] border border-[#3C3C4359] placeholder:text-[#3C3C4366] p-2 rounded-md w-48 h-8 3xl:h-10 overflow-y-scroll scrollbar-hidden "
                      value={note}
                      placeholder="Ghi chú chung"
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setNote(e.target.value);
                        }
                      }}
                      maxLength={5000}
                    />
                    <div className="absolute right-1 text-right top-1/2 mr-[7px] transform -translate-y-1/2 text-gray-500">
                      <EditOutlined sx={{ fontSize: 20 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* THÔNG TIN SẢN PHẨM */}
            {/* <div className="col-span-9 row-span-3 row-start-3 border rounded-xl p-2 2xl:p-4 bg-white h-[300px] 2xl:h-[380px] flex flex-col gap-2 shadow-[0_2px_0_#D9D9D9]">
              <h3 className="text-lg font-semibold">Thông tin sản phẩm </h3>
              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black font-bold" />
                <input
                  placeholder="Tìm kiếm sản phẩm"
                  className="border-none px-4 pl-[40px] py-2 text-[15px] leading-5 font-semibold bg-[#e9ecf2] w-full rounded-md"
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
                  <div className="absolute w-full left-0 top-[50px]">
                    <PopupSearchProducts
                      products={searchResults}
                      onSelectProduct={(prod) => {
                        handleSelectProduct(prod);
                        setIsProductPopupVisible(false);
                        setSearchTerm("");
                      }}
                      onClose={() => setIsProductPopupVisible(false)}
                    />
                  </div>
                )}
              </div>

              {addedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <NoData
                    message="Chưa có thông tin sản phẩm"
                    className="[&_img]:max-w-[57px] [&_p]:!text-[15px]"
                  />
                  <a href="#" className="text-blue-500 text-[12px]">
                    <LiveHelpOutlined className="w-[16px]" /> Chọn thanh tìm
                    kiếm để thêm sản phẩm
                  </a>
                </div>
              ) : (
                <div className="mt-4 max-h-[250px] overflow-y-auto scrollbar-hidden">
                  <table className="w-full table-fixed">
                    <thead className="sticky top-0 z-10 rounded-t-lg">
                      <tr className="h-12 bg-gray-100 rounded-t-xl shadow-[0_1px_1px_0px_#4F49502E] 2xl:text-[15px] text-xs">
                        <th className="w-[40px] rounded-tl-xl">STT</th>
                        <th className="w-[80px]">Ảnh</th>
                        <th className="w-[200px]">Tên sản phẩm</th>
                        <th className="w-[80px]">Số lượng</th>
                        <th className="w-[120px]">Đơn giá</th>
                        <th className="w-[80px]">CK (%)</th>
                        <th className="w-[120px]">Thành tiền</th>
                        <th className="w-[40px] rounded-tr-xl"></th>
                      </tr>
                    </thead>

                    <tbody className="text-center 2xl:text-[15px] text-xs">
                      {addedItems.map((it, idx) => (
                        <tr key={it.id} className="border-b h-14">
                          <td className="p-2">{idx + 1}</td>
                          <td>
                            <div className="flex justify-center">
                              <Image
                                src={
                                  it.product.image_url ||
                                  (it.product.images?.[0]?.url
                                    ? `${process.env.NEXT_PUBLIC_DEV_API}${it.product.images[0].url}`
                                    : "/no_image.png")
                                }
                                alt={it.product.name || "product"}
                                width={32}
                                height={32}
                                className="object-cover rounded aspect-square"
                                //unoptimized
                              />
                            </div>
                          </td>
                          <td className="text-left">
                            <p className="line-clamp-2">{it.product.name}</p>
                          </td>
                          <td>
                            <input
                              type="number"
                              className="border w-16 p-1 rounded-md"
                              value={it.quantity || ""}
                              onChange={(e) =>
                                handleChangeQuantity(
                                  it.id,
                                  Number(e.target.value)
                                )
                              }
                              min={1}
                              max={999}
                            />
                          </td>
                          <td>{it.price.toLocaleString("en-ES")}</td>
                          <td>
                            <input
                              type="number"
                              className="border w-16 p-1 rounded-md"
                              value={it.discount || ""}
                              onChange={(e) =>
                                handleChangeDiscount(
                                  it.id,
                                  Math.min(
                                    100,
                                    Math.max(0, Number(e.target.value))
                                  )
                                )
                              }
                              min={0}
                              max={100}
                            />
                          </td>
                          <td>{it.total_line.toLocaleString("en-ES")}</td>
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
                      {addedItems.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-2">
                            Chưa có sản phẩm
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div> */}
            <div className="col-span-9 row-span-3 row-start-3 border rounded-xl p-2 2xl:p-4 bg-white w-auto xl:h-[215px] 2xl:h-[267px] 3xl:h-[320px] flex flex-col gap-2 shadow-[0_2px_0_#D9D9D9]">
              <h3 className="text-[15px] 3xl:text-[17px] font-semibold">
                Thông tin sản phẩm
              </h3>
              <div className="relative w-full flex flex-col gap-2">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black font-bold" />
                <input
                  placeholder="Tìm kiếm sản phẩm"
                  className="h-8 3xl:h-10 px-4 pl-[40px] py-2 border border-none text-[15px] leading-5 bg-[#e9ecf2] p-2 w-full rounded-md"
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
                  <div className="absolute w-full left-0 top-10 3xl:top-[50px]">
                    <PopupSearchProducts
                      products={searchResults}
                      onSelectProduct={(prod) => {
                        handleSelectProduct(prod);
                        setIsProductPopupVisible(false);
                        setSearchTerm("");
                      }}
                      onClose={() => {
                        setIsProductPopupVisible(false);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Bảng sản phẩm đã thêm */}
              {addedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  {/* <div className="flex items-center justify-center mb-2">
                    <Image 
                      src={"/hand_bag.svg"}
                      alt="Icon Not Found"
                      width={100}
                      height={66}
                    />
                  </div>
                  <p className="text-sm font-semibold text-[#3C3C4366] ">Chưa có thông tin sản phẩm</p> */}
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
                        <th className="w-[80px] ant-table-cell sticky top-0">
                          Số lượng
                        </th>
                        <th className="w-[120px] ant-table-cell sticky top-0">
                          Đơn giá
                        </th>
                        {/* <th className="w-[80px] ant-table-cell sticky top-0">
                          CK (%)
                        </th> */}
                        <th className="w-[120px] ant-table-cell sticky top-0">
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
                          {/* <td>{it.price.toLocaleString("en-ES")}</td> */}
                          <td>
                            <input
                              type="text"
                              className="border p-1 rounded-lg w-full text-[13px] 3xl:text-[17px]"
                              // disabled={!canEditItems}
                              value={it.price.toLocaleString("en-ES")}
                              placeholder="0"
                              onChange={(e) => {
                                const value = Number(
                                  e.target.value.replace(/\D/g, "")
                                );
                                let parsed = Number(value);
                                if (parsed < 0) parsed = 0;
                                if (parsed > 999999999999)
                                  parsed = 999999999999;
                                handleChangePrice(it.id, parsed);
                              }}
                            />
                          </td>
                          {/* <td>
                            <input
                              type="number"
                              className="border w-16 p-1 rounded-lg text-[13px] 3xl:text-[17px]"
                              value={it.discount === 0 ? "" : it.discount}
                              placeholder="0"
                              onChange={(e) =>
                                handleChangeDiscount(
                                  it.id,
                                  Math.min(
                                    100,
                                    Math.max(0, Number(e.target.value))
                                  )
                                )
                              }
                              min={0}
                              max={100}
                            />
                          </td> */}
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
                      {addedItems.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-center py-2 text-gray-500"
                          >
                            Chưa có sản phẩm
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 3xl:gap-4 col-span-3 row-span-3 col-start-10 row-start-3 border rounded-xl p-2 bg-white xl:h-[215px] 2xl:h-[267px] 3xl:h-[320px] shadow-[0_2px_0_#D9D9D9]">
              {/* <div className="flex justify-between font-semibold">
                <h3>Tổng tiền</h3>
                <span>{subTotal.toLocaleString("en-ES")}</span>
              </div>
              <p className="text-[#3C3C43B2]">
                (
                <span className="font-semibold text-[#338BFF]">
                  {totalItems.toLocaleString("en-ES")}
                </span>
                sản phẩm)
              </p> */}
              {/* <div className="border-gray-300 border-b-[1px] w-full my-2 2xl:my-4"></div> */}

              <div className="flex flex-row justify-between border-b pb-1">
                <h3 className="font-bold mr-1 text-[15px] 3xl:text-[17px] leading-[22px] line-clamp-1">
                  Giá trị phiếu{" "}
                  <span className="text-[#3C3C43B2] text-[13px]">
                    (
                    <span className="text-[#338BFF] text-[13px] 3xl:text-[15px]">
                      {totalItems}
                    </span>{" "}
                    sản phẩm)
                  </span>
                </h3>
                <h3 className="font-semibold leading-[22px] text-[15px] 3xl:text-[17px]">
                  {subTotal.toLocaleString("en-ES")}
                </h3>
              </div>

              {/* <div className="flex items-center justify-between">
                <label className="text-[13px] 3xl:text-[17px] font-normal leading-5">
                  Chiết khấu tổng đơn (%)
                </label>
                <div
                  id="ticket-container"
                  className={`relative flex items-center justify-center h-8 3xl:h-10 ${
                    discount > 0 ? "bg-[#3AA207]" : "bg-gray-300"
                  } text-white font-bold rounded-[4px] pr-[10px] overflow-hidden`}
                  style={{ width: "48px" }}
                >
                  <div className="absolute w-[7px] h-[13px] bg-white left-0 rounded-r-full"></div>
                  <div className="absolute w-[7px] h-[13px] bg-white right-0 rounded-l-full"></div>
                  <input
                    type="text"
                    className="bg-transparent text-center font-bold outline-none focus:outline-none focus:ring-0 focus:border-transparent focus:shadow-none appearance-none text-[15px] placeholder:text-white border-transparent"
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
                <label className="font-normal text-[13px] 3xl:text-[17px] leading-5">
                  Thêm chi phí
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
              <div className="flex h-full items-end">
                <div className="w-full flex flex-row justify-between text-[#e50000] text-[15px] 3xl:text-[17px] font-semibold border-t pt-1">
                  <p>Còn phải trả:</p>
                  <p>{grandTotal.toLocaleString("en-ES")}</p>
                </div>
              </div>
            </div>

            {/* <div className="col-span-3 row-span-3 col-start-10 row-start-3 border rounded-xl p-3 bg-white 2xl:h-[380px] h-[300px] shadow-[0_2px_0_#D9D9D9] flex flex-col">
              <div className="border-gray-300 border-b-[1px] w-full pb-4">
                <div className="flex justify-between font-semibold">
                  <h3>Giá trị phiếu</h3>
                  <span>{subTotal.toLocaleString("en-ES")}</span>
                </div>
                <p className="text-[#3C3C43B2]">
                  (
                  <span className="font-semibold text-[#338BFF]">
                    {totalItems.toLocaleString("en-ES")}
                  </span>{" "}
                  sản phẩm)
                </p>
              </div>

              <div className="w-full py-4 flex flex-col gap-[17px]">
                <div className="flex items-center justify-between">
                  <label className="text-[15px] font-normal leading-5">
                    Chiết khấu tổng đơn (%)
                  </label>
                  <div
                    id="ticket-container"
                    className={`relative flex items-center justify-center h-[35px] ${
                      discount > 0 ? "bg-[#3AA207]" : "bg-gray-300"
                    } text-white font-bold rounded-[4px] pr-[10px] overflow-hidden`}
                    style={{ width: "48px" }}
                  >
                    Cạnh vé
                    <div className="absolute w-[7px] h-[13px] bg-white left-0 rounded-r-full"></div>
                    <div className="absolute w-[7px] h-[13px] bg-white right-0 rounded-l-full"></div>
                    Input
                    <input
                      type="text"
                      className="bg-transparent text-center font-bold outline-none focus:outline-none focus:ring-0 focus:border-transparent focus:shadow-none appearance-none text-[15px] placeholder:text-white border-transparent"
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
                    Ký hiệu %
                    <span className="absolute right-2">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="font-normal text-[15px] leading-5">
                    Thêm chi phí
                  </label>
                  <input
                    type="text"
                    className="min-h-10 p-1 w-[120px] text-right rounded-md border-[#3C3C4359] text-[15px] font-semibold leading-5"
                    value={
                      extraFee === 0 ? "" : extraFee.toLocaleString("en-ES")
                    }
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
                <div className="border-gray-300 border-t-[1px] w-full flex justify-between pt-4 text-[#e50000]">
                  <p className="font-semibold text-[17px] leading-[22px]">
                    Còn phải trả
                  </p>
                  <p>
                    <b>{grandTotal.toLocaleString("en-ES")}</b>
                  </p>
                </div>
              </div>
              
            </div> */}

            <div className="col-span-12 flex justify-end">
              <button
                onClick={handleCreateReturn}
                className="bg-[#338bff] hover:bg-[#66b2ff] text-white px-4 rounded-md mt-0 h-8 3xl:h-10 text-[13px] 3xl:text-[17px]"
              >
                Tạo phiếu trả hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      {isEditOpen && selectedReturnId && (
        <PopupEditReturn
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          returnId={selectedReturnId}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}