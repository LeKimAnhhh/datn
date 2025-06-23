"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  CloseOutlined,
  CheckCircleOutlined,
  ReportGmailerrorred,
  ArrowDropDownOutlined,
  LiveHelpOutlined,
} from "@mui/icons-material";
import Image from "next/image";

import PopupEmployees from "@/app/components/PopupEmployees";
import PopupSearchProducts from "@/app/components/PopupSearchProducts";

import {
  InspectionReportItem,
  Employee,
  Product,
  Purchase,
} from "@/app/lib/definitions";
import {
  createInspection,
  getPurchaseById,
  fetchEmployeeData,
} from "@/app/lib/data";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NoData from "@/app/components/NoData";
import Select from "../select";
import { usePathname, useRouter } from "next/navigation";

interface PopupCreateInspectionProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseId?: string;
}

interface InspectionItemRow {
  product_id: string;
  product_name: string;
  product_image_url: string;
  stock: number;
  import_quantity: number; // Số lượng đơn nhập
  actual_quantity: number; // Số lượng thực tế
  reason: string;
  note: string;
}

export default function PopupCreateInspection({
  isOpen,
  onClose,
  purchaseId,
}: PopupCreateInspectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [branch, setBranch] = useState("Terra");
  const [employeeName, setEmployeeName] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [isEmployeePopupVisible, setIsEmployeePopupVisible] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [employeeResults, setEmployeeResults] = useState<Employee[]>([]);

  const [deliveryDate, setDeliveryDate] = useState("");
  const [billId, setBillId] = useState(purchaseId || "");

  const [note, setNote] = useState("");

  const [items, setItems] = useState<InspectionItemRow[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleCheckBill = useCallback(async () => {
    if (!billId) return;
    try {
      const token = localStorage.getItem("access_token") || "";
      const purchase: Purchase = await getPurchaseById(token, billId);
      console.log(purchase);
      // fill data
      setBranch(purchase.branch || "");
      if (purchase.user) {
        setSelectedEmployeeId(purchase.user.id);
        setEmployeeName(purchase.user.full_name);
      }
      if (purchase.delivery_date) {
        const dateStr = purchase.delivery_date.split("T")[0];
        setDeliveryDate(dateStr);
      }
      const newItems: InspectionItemRow[] = purchase.items.map((it) => ({
        product_id: it.product_id || "",
        product_name: it.product?.name || "(No name)",
        product_image_url: it.product?.images?.length
          ? `${process.env.NEXT_PUBLIC_DEV_API}${it.product.images[0].url}`
          : "",
        stock:
          (it.product?.thonhuom_stock || 0) + (it.product?.terra_stock || 0),

        import_quantity: it.quantity,
        actual_quantity: it.quantity,
        reason: "",
        note: "",
      }));
      setItems(newItems);
    } catch (err: any) {
      setMessage(`${err.message}` || "Phiếu nhập không tồn tại.");
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  }, [billId, setSelectedEmployeeId, setEmployeeName, setBranch, setDeliveryDate, setItems, setMessage, setMessageType]);

  useEffect(() => {
    if (purchaseId) {
      handleCheckBill();
    }
  }, [purchaseId, handleCheckBill]);

  if (!isOpen) return null;

  const handleEmployeeSearchChange = async (val: string) => {
    setEmployeeSearchTerm(val);
    try {
      const token = localStorage.getItem("access_token") || "";
      const { users } = await fetchEmployeeData(token, 50, 1, val);
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

  // Tính cột Lệch
  const calcDifference = (row: InspectionItemRow) => {
    return row.actual_quantity - row.import_quantity;
  };

  // Đổi actual_quantity
  const handleChangeActualQuantity = (index: number, val: number) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i === index) {
          return { ...it, actual_quantity: val };
        }
        return it;
      })
    );
  };

  const handleCreate = async () => {
    if (!billId) {
      setMessage(`Vui lòng nhập Mã phiếu nhập hợp lệ.`);
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
      }, 2000);
      // alert("Vui lòng nhập Mã phiếu nhập hợp lệ.")
      return;
    }
    if (items.length === 0) {
      setMessage(`Không có sản phẩm để kiểm.`);
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
      }, 5000);
      // alert("Không có sản phẩm để kiểm.");
      return;
    }
    try {
      const token = localStorage.getItem("access_token") || "";
      const payload = {
        user_id: selectedEmployeeId || "",
        import_bill_id: billId,
        note,
        branch,
        items: items.map((it) => ({
          product_id: it.product_id,
          actual_quantity: it.actual_quantity,
          reason: it.reason,
          note: it.note,
        })),
      };
      const res = await createInspection(token, payload);
      setMessage(`Đã thêm mới thành công phiếu kiểm ${res.id}`);
      setMessageType("success");
      // alert("Tạo phiếu kiểm thành công!");
      setTimeout(() => {
        onClose();
        if (pathname.includes("phieu-nhap")) {
          return router.push("/tong-quan/phieu-kiem");
        } else {
          return window.location.reload();
        }
      }, 2000);
    } catch (err: any) {
      setMessage(`${err.message}`);
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      {message && (
        <div
          className={`toast-message ${messageType === "success"
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
      <div className="bg-[#f2f2f7]  2xl:max-h-[95vh] 3xl:max-h-[760px] w-full xl:max-w-[80vw] 3xl:max-w-[78vw] rounded-2xl xl:p-6 p-2 relative">
        <div className="flex justify-between 2xl:mb-4 mb-2">
          <h2 className="font-semibold  text-xl 3xl:text-2xl text-black">
            Tạo phiếu kiểm
          </h2>
          <button onClick={onClose} className="text-gray-600">
            <CloseOutlined />
          </button>
        </div>

        {/* <button
          onClick={handleCreate}
          className="mb-4 bg-[#338bff] hover:bg-[#66b2ff] text-white p-2 rounded-md"
        >
          Tạo phiếu kiểm
        </button> */}

        {/* Phần 1: Thông tin phiếu kiểm */}
        <div className="border rounded-2xl 2xl:p-4 p-2 h-fit 2xl:mb-4 mb-2 bg-white">
          <div className="flex justify-start">
            <h3 className="text-[15px] 3xl:text-[17px] leading-[22px] text-black font-bold mb-4">Thông tin phiếu kiểm</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Chi nhánh */}
            <div className="relative">
              <label className="text-[13px] 3xl:text-[15px] leading-5 font-semibold text-[#242428] block mb-1 text-left">Chi nhánh</label>
              <Select 
                options={[
                  {value: "Terra", label: "Terra"},
                  {value: "Thợ Nhuộm", label: "Thợ Nhuộm"}
                ]}
                onSelect={(val) => setBranch(val)}
                defaultValue={branch}
                wrapperClassName="w-full h-8 3xl:h-10"
                btnClassName="h-full bg-transparent border-[#3C3C4359] text-black text-[13px] 3xl:text-[15px]"
              />
              {/* <select
                className="border border-[#3C3C4359] p-1 rounded-md w-full h-10 bg-transparent bg-none"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="Terra">Terra</option>
                <option value="Thợ Nhuộm">Thợ Nhuộm</option>
              </select> */}
              {/* <ArrowDropDownOutlined
                  className="absolute right-3 top-11 text-center transform -translate-y-1/2 text-gray-500 cursor-pointer pointer-events-none"
                /> */}
            </div>

            {/* Nhân viên */}
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

            {/* Ngày hẹn giao */}
            <div>
              <label className="text-[13px] 3xl:text-[15px] leading-5 font-semibold text-[#242428] block mb-1 text-left">Ngày hẹn giao</label>
              <div className="relative">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    className="w-full h-8 3xl:h-10 border border-[#3C3C4359]"
                    value={deliveryDate ? dayjs(deliveryDate) : null}
                    onChange={(newValue) => {
                      setDeliveryDate(
                        newValue ? newValue.format("YYYY-MM-DD") : ""
                      );
                    }}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        variant: "outlined",
                        fullWidth: true,
                        size: "small",
                        InputProps: {
                          className: "!text-[13px] 3xl:!text-[15px] !h-8 3xl:!h-10",
                          sx: {
                            borderRadius: "6px",
                            textAlign: "right",
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                            borderColor: "#3C3C4359",
                          },
                        },
                        inputProps: {
                          // placeholder: "dd/mm/yyyy",
                          className: "font-[510] focus:ring-0  !pl-2 !py-2",
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
              {/* <input
                type="date"
                className="border p-2 rounded-md w-full h-9"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              /> */}
            </div>

            {/* Mã phiếu nhập */}
            <div>
              <label className="text-[13px] 3xl:text-[15px] leading-5 font-semibold text-[#242428] block mb-1 text-left ">Mã phiếu nhập</label>
              <input
                type="text"
                className="border border-[#3C3C4359] text-normal text-[13px] 3xl:text-[15px] leading-5 text-black p-2 rounded-md w-full h-8 3xl:h-10"
                placeholder="VD: PN1"
                value={billId}
                onChange={(e) => setBillId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCheckBill();
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Phần 2: Thông tin sản phẩm */}
        <div className="border rounded-2xl 2xl:p-4 p-2 bg-white 2xl:max-h-[442px] overflow-hidden">
          {/* <div className="border rounded-2xl p-4 bg-white max-h-[442px] overflow-hidden"> */}
          <div className="flex justify-start">
            <h3 className="text-[15px] 3xl:text-[17px] leading-[22px] text-black font-bold 3xl:mb-4 mb-2">Thông tin sản phẩm</h3>
          </div>
          {items.length === 0 ? (
            <div className="flex flex-col items-center h-[300px] 3xl:h-[390px] justify-center text-center text-gray-500">
             <NoData message="Hiện tại chưa có sản phẩm nào" className="[&_img]:max-w-[77px] [&_p]:!text-[15px]"/>
              <a href="#" className="text-[#0058CC] font-sm leading-4 text-[12px] mt-1">
                <LiveHelpOutlined className="w-[16px]" /> Thêm mã phiếu nhập để bắt đầu kiểm hàng
              </a>
            </div>
          ) : (
            <div className="overflow-auto h-[300px] 3xl:h-[390px] scrollbar-hidden">
              <table className="w-full table-fixed">
                <thead className="h-8 3xl:h-10 sticky top-0 z-10 rounded-t-lg ant-table-thead bg-[#ededf0]">
                <tr className="rounded-t-xl shadow-[0_1px_1px_0px_#4F49502E] text-[13px] 3xl:text-[15px]">
                    <th className="w-[4.33%] rounded-tl-xl  text-center p-2 3xl:p-3 ant-table-cell sticky top-0">STT</th>
                    <th className="w-[4.33%]  text-center p-2 3xl:p-3 ant-table-cell sticky top-0">Ảnh</th>
                    <th className="w-[26.05%] text-center p-2 3xl:p-3 ant-table-cell sticky top-0">Tên sản phẩm</th>
                    <th className="w-[6.33%] text-center p-2 3xl:p-3 ant-table-cell sticky top-0">Tồn kho</th>
                    <th className="w-[11.97%] text-center p-2 3xl:p-3 ant-table-cell sticky top-0">SL đơn nhập</th>
                    <th className="w-[11.97%] text-center p-2 3xl:p-3 ant-table-cell sticky top-0">SL thực tế</th>
                    <th className="w-[9.15%] text-center p-2 3xl:p-3 ant-table-cell sticky top-0">Lệch</th>
                    <th className="w-[12.935%] text-center p-2 3xl:p-3 ant-table-cell sticky top-0">Lý do</th>
                    <th className="w-[12.935%] rounded-tr-xl text-center p-2 3xl:p-3 ant-table-cell sticky top-0">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => {
                    const diff = calcDifference(row);
                    const rowStyle =
                      diff > 0
                        ? { backgroundColor: "#F6C888BF" }
                        : diff < 0
                          ? { backgroundColor: "#F78E8EBF" }
                          : {};

                    return (
                      <tr
                        key={row.product_id}
                        style={rowStyle}
                        className="border-b cursor-pointer hover:bg-gray-100"
                      >
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] text-center">{idx + 1}</td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] group z-10">
                          {row.product_image_url ? (
                            <Image
                              src={row.product_image_url}
                              alt="product"
                              width={256}
                              height={256}
                              //unoptimized
                              className="object-cover rounded h-8 w-8 transition-all duration-300 transform group-hover:scale-[5] group-hover:translate-x-[100px]"
                            />
                          ) : (
                            <div className="w-[40px] h-[40px] bg-gray-200 text-[13px] 3xl:text-[15px]"/>
                          )}
                        </td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] leading-5 font-[510] whitespace-pre-wrap text-[13px] 3xl:text-[15px]">
                          <p className="line-clamp-2">{row.product_name}</p>
                        </td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] leading-5 font-[510]">{row.stock}</td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] leading-5 font-[510]">
                          {row.import_quantity}
                        </td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] leading-5 font-[510]">
                          <input
                            type="number"
                            className="border p-1 rounded-lg w-full h-8 3xl:h-10 text-[13px] 3xl:text-[15px]"
                            value={row.actual_quantity}
                            onChange={(e) => {
                              let val = Number(e.target.value);
                              if (val < 0) val = 0;
                              handleChangeActualQuantity(idx, val);
                            }}
                          />
                        </td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] leading-5 font-[500]">
                          {diff}
                        </td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] leading-5 font-[510]">
                          <div className="relative block w-full">
                            {/* <input
                            type="text"
                            className="border p-1 w-[100px] rounded-lg"
                            value={row.reason}
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? { ...it, reason: e.target.value }
                                    : it
                                )
                              )
                            }
                          /> */}
                            <select
                              className="border p-1 rounded-lg h-8 3xl:h-10 w-full text-[13px] 3xl:text-[15px]"
                              defaultValue=""
                              // value={reason}
                              // onChange={(e) => setBranch(e.target.value)}
                            >
                              <option value=""></option>
                              <option value="thừa">Thừa</option>
                              <option value="thiếu">Thiếu</option>
                              <option value="khác">Khác</option>
                            </select>
                            {/* <ArrowDropDownOutlined className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer pointer-events-none" /> */}
                          </div>
                        </td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 text-[13px] 3xl:text-[15px] leading-5 font-[510] h-8 3xl:h-[56px]">
                          <input
                            type="text"
                            className="border p-1 rounded-lg w-full h-8 3xl:h-10 text-[13px] 3xl:text-[15px]"
                            value={row.note}
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx ? { ...it, note: e.target.value } : it
                                )
                              )
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-gray-400 text-[13px] 3xl:text-[15px]">
                        Chưa có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="2xl:mt-6 mt-3 flex justify-end">
          <button
            onClick={handleCreate}
            className="bg-[#338bff] hover:bg-[#66b2ff] text-white 3xl:py-[10px] px-4 rounded-md h-8 3xl:h-10 text-[13px] 3xl:text-[15px]"
          >
            Tạo phiếu kiểm
          </button>
        </div>
      </div>
    </div>
  );
}
