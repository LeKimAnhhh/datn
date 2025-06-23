"use client";

import React, { useEffect, useState } from "react";
import { CloseOutlined, IosShareOutlined, CheckCircleOutlined, ReportGmailerrorred, CalendarTodayOutlined, ContentPasteSearchOutlined, FileOpenOutlined } from "@mui/icons-material";
import Image from "next/image";

import { InspectionReport } from "@/app/lib/definitions";
import { 
  getInspectionById, 
  completeInspection, 
  getInspectionHistory,
  updateInspection
} from "@/app/lib/data";
import InspectionStatusBadge from "@/app/ui/status";
import Select from "../select";
import { Tooltip } from "react-tooltip";
import PopupSkeleton from "@/app/components/PopupSkeleton";

interface PopupEditInspectionProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  onSaved: (updated: InspectionReport) => void;
}

export default function PopupEditInspection({
  isOpen,
  onClose,
  reportId,
  onSaved,
}: PopupEditInspectionProps) {
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "history">("products");
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token") || "";
        // 1) Gọi API getInspectionById
        const data = await getInspectionById(token, reportId);
        console.log("kiểm data:", data); 
        setReport(data);

        // API History
        // const his = await getInspectionHistory(token, reportId);
          // console.log("kiểm his:", his);
          // setHistory(his);
        } catch (err: any) {
          setMessage(`${err.message}`);
          setMessageType("error");

          setTimeout(() => {
            setMessage("");
          }, 5000);
          // alert(err.message);
          console.error(err);
        } finally {
          setLoading(false);
        }
    }
    load();
  }, [isOpen, reportId]);

  if(loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        <PopupSkeleton type="inspection"/>
      </div>
    );
  }

  if (!isOpen || !report) return null;
  const isEditable = report.status === "checking"; 
  const totalActual = report.items.reduce((acc, it) => acc + it.actual_quantity, 0);

  const handleChangeItem = (index: number, field: "actual_quantity" | "reason" | "note", value: any) => {
    if (!isEditable) return;
    setReport((prev) => {
      if (!prev) return prev;
      const newItems = [...prev.items];
      const it = { ...newItems[index] };
      (it as any)[field] = value;
      newItems[index] = it;
      return { ...prev, items: newItems };
    });
  };

  const handleSave = async () => {
    setIsSaveDialogOpen(true);
  };

  const confirmSave = async () => {
    if (!report) return;
    try {
      setIsSaveDialogOpen(false);
      const token = localStorage.getItem("access_token") || "";

      const payload = {
        branch: report.branch, 
        note: report.note, 
        items: report.items.map((it) => ({
          product_id: it.product_id,
          actual_quantity: it.actual_quantity,
          reason: it.reason,
          note: it.note,
        })),
      };

      console.log("payload:", payload);

      const updated = await updateInspection(token, report.id, payload);
      console.log("updated:", updated);
      setMessage(`Đã lưu chỉnh sửa phiếu kiểm!`);
      setMessageType("success");
      onSaved(updated);
      setReport(updated);

      setTimeout(() => {
        setMessage("");
        // onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setMessage(`${err.message}`);
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  const handleComplete = () => {
    //setIsSaveDialogOpen(true);
    setIsCompleteDialogOpen(true);
  };

  const confirmComplete = async () => {
    try {
      setIsCompleteDialogOpen(false);
      const token = localStorage.getItem("access_token") || "";
      const updated = await completeInspection(token, report.id);
      setMessage(`Hoàn thành cân bằng kho`);
      setMessageType("success");
      console.log("updated:", updated);
      onSaved(updated);
      setReport(updated);
      
      setTimeout(() => {
        setMessage("");
        // onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setMessage(`${err.message}`);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  // const dualButtonFunction = () => {
  //   setIsCompleteDialogOpen(true);
  // };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      {message && (
        <div
          className={`toast-message ${
            messageType === "success" ? "success" : messageType === "error" ? "error" : ""
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
      <div className="bg-[#F2F2F7] w-full xl:max-w-[80vw] 3xl:max-w-[78vw] max-h-[95vh] 3xl:max-h-[760px] xl:p-6 p-2 rounded-2xl relative">
{/* <!--       <div className="bg-[#F2F2F7] w-full max-w-[80vw] h-[760px] p-6 rounded-2xl relative"> --> */}

        <button
          className="absolute top-4 right-4 text-gray-400"
          onClick={onClose}
        >
          <CloseOutlined />
        </button>

        <h2 className=" flex text-xl font-bold 2xl:mb-4 mb-2 gap-2 items-center">
          <div className=''>
            <span>
              Chi tiết phiếu kiểm {report.id}
            </span>
          </div>
          {/* <div className="px-[10px] py-1 2xl:mx-4 mx-2 rounded-lg text-base text-[#0061FD] text-center border border-[#0061fd] flex justify-center items-center gap-1 cursor-pointer">
            <FileOpenOutlined fontSize="small" />
            Xuất file
          </div> */}
          <div className="border-gray-300 border-r-[1px] h-full py-4 inline-block"></div>

          <InspectionStatusBadge type="inspection_status" value={report.status} />
        </h2>
        
        {/* Thông tin phiếu */}
        <div className="bg-white border rounded-2xl 2xl:p-4 p-2 2xl:mb-4 mb-2 shadow-[0_2px_0_#D9D9D9]">
{/* <!--         <div className="bg-white border rounded-2xl p-4 mb-4 shadow-[0_2px_0_#D9D9D9]"> --> */}
          <h3 className="font-bold text-[15px] 3xl:text-[17px] leading-[22px] mb-3">Thông tin phiếu kiểm</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 2xl:gap-4 gap-2">
            {/* Chi nhánh kiểm tra */}
            <div>
              <label className="text-[13px] 3xl:text-[15px] leading-5 font-semibold text-[#3D3D43] ">Chi nhánh kiểm tra</label>
              <input
                type="text"
                className="h-8 3xl:h-10 border border-[#77777E1A] p-2 rounded-md w-full text-[13px] 3xl:text-[15px] text-black cursor-not-allowed bg-[#77777E1A]"
                value={report.branch || ""}
                readOnly
              />
            </div>

            {/* Ngày cân bằng */}
            <div className="relative">
              <label className="text-[13px] 3xl:text-[15px] leading-5 font-semibold text-[#3D3D43]">
                Ngày cân bằng
              </label>
              <div className="relative ">
                <input
                  type="text"
                  className="h-8 3xl:h-10 border border-[#3C3C4359] p-2 pr-10 rounded-md w-full text-[13px] 3xl:text-[15px] font-normal bg-none text-black cursor-not-allowed"
                  value={
                    report.complete_at
                      ? new Date(report.complete_at).toLocaleDateString("en-ES")
                      : "-"
                  }
                  readOnly
                />
                <CalendarTodayOutlined className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Tổng số lượng sản phẩm */}
            <div>
              <label className="text-[13px] 3xl:text-[15px] leading-5 font-semibold text-[#3D3D43] ">Tổng số lượng sản phẩm</label>
              <input
                type="text"
                className="h-8 3xl:h-10 border border-[#3C3C4359] p-2 rounded-md w-full text-[13px] 3xl:text-[15px] font-normal bg-none text-black cursor-not-allowed"
                value={totalActual}
                readOnly
              />
            </div>

            {/* Nhân viên kiểm */}
            <div>
              <label className="text-[13px] 3xl:text-[15px] leading-5 font-semibold text-[#3D3D43] ">Nhân viên kiểm</label>
              <input
                type="text"
                className="h-8 3xl:h-10 border border-[#77777E1A] p-2 rounded-md w-full text-[13px] 3xl:text-[15px] font-normal bg-[#77777E1A] text-black cursor-not-allowed"
                value={report.user?.full_name || "-"}
                readOnly
              />
            </div>

            {/* Ngày tạo */}
            <div>
              <label className="text-[13px] 3xl:text-[15px] leading-5 font-semibold text-[#3D3D43]">Ngày tạo</label>
              <input
                type="text"
                className="h-8 3xl:h-10 border border-[#77777E1A] p-2 rounded-md w-full text-[13px] 3xl:text-[15px] font-normal bg-[#77777E1A] text-black cursor-not-allowed"
                value={
                  report.created_at
                    ? new Date(report.created_at).toLocaleDateString("es-ES")
                    : "-"
                }
                readOnly
              />
            </div>

            {/* Ghi chú chung */}
            <div>
              <label className="text-[13px] 3xl:text-[15px] leading-5 font-semibold text-[#3D3D43]">Phiếu nhập</label>
                <input
                  type="text"
                  disabled
                  className="h-8 3xl:h-10 border border-[#77777E1A] p-2 rounded-md w-full text-[13px] 3xl:text-[15px] font-normal bg-[#77777E1A] cursor-not-allowed"
                  value={report.import_bill_id || ""}
                  maxLength={500}
                  onChange={(e) => {
                    setReport((prev) => {
                      if (!prev) return prev;
                      return { ...prev, note: e.target.value };
                    });
                  }}
                />
            </div>
          </div>
        </div>

        {/* table*/}

        <div className="bg-white border rounded-2xl 2xl:p-4 p-2 h-[320px] 3xl:h-[380px]">
          <div className="flex space-x-4 mb-3">
            <h3
              className={`font-semibold text-[15px] 3xl:text-[17px] cursor-pointer ${
                activeTab === "products" ? "text-black" : "text-gray-400"
              }`}
              onClick={() => setActiveTab("products")}
            >
              Thông tin sản phẩm
            </h3>
            {/* <h3
              className={`font-semibold text-lg cursor-pointer ${
                activeTab === "history" ? "text-black" : "text-gray-400"
              }`}
              onClick={() => setActiveTab("history")}
            >
              Nhật ký hoạt động
            </h3> */}
          </div>

          {/* sản phẩm */}
          {activeTab === "products" && (
            <div className="3xl:max-h-[320px] max-h-[260px] overflow-auto scrollbar-hidden">
              <table className="w-full table-fixed h-full">
                <thead className="h-8 3xl:h-10 sticky top-0 z-10 rounded-t-lg ant-table-thead bg-[#ededf0]">
                  <tr className="rounded-t-xl shadow-[0_1px_1px_0px_#4F49502E] text-[13px] 3xl:text-[15px]">
                      <th className="ant-table-cell truncate sticky top-0 w-[4.33%] p-2 3xl:p-3 rounded-tl-xl  text-center">STT</th>
                      <th className="ant-table-cell truncate sticky top-0 w-[4.33%] p-2 3xl:p-3  text-center">Ảnh</th>
                      <th className="ant-table-cell truncate sticky top-0 w-[26.05%] p-2 3xl:p-3 text-center">Tên sản phẩm</th>
                      <th className="ant-table-cell truncate sticky top-0 w-[6.33%] p-2 3xl:p-3 text-center">Tồn kho</th>
                      <th className="ant-table-cell truncate sticky top-0 w-[11.97%] p-2 3xl:p-3 text-center">SL đơn nhập</th>
                      <th className="ant-table-cell truncate sticky top-0 w-[11.97%] p-2 3xl:p-3 text-center">SL thực tế</th>
                      <th className="ant-table-cell truncate sticky top-0 w-[9.15%] p-2 3xl:p-3 text-center">Lệch</th>
                      <th className="ant-table-cell truncate sticky top-0 w-[12.935%] p-2 3xl:p-3 text-center">Lý do</th>
                      <th className="ant-table-cell truncate sticky top-0 w-[12.935%] p-2 3xl:p-3 rounded-tr-xl text-center">Ghi chú</th>
                    </tr>
                  </thead>
                <tbody className="border-b cursor-pointer">
                  {report.items.map((it, index) => {
                    const diff = it.actual_quantity - it.quantity;
                    const rowStyle =
                      diff > 0
                        ? { backgroundColor: "#F6C888BF" }
                        : diff < 0
                        ? { backgroundColor: "#F78E8EBF" }
                        : {};

                    return (
                      <tr
                        key={it.id}
                        style={rowStyle}
                        className="border-b"
                        // className={`border-b ${it.id % 2 === 0 ? 'bg-[#5B5B7B0D]' : 'bg-white'}`}
                      >
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] font-[510] text-center">
                          {index + 1}
                        </td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] font-[510]">
                          <Image
                            src={
                              it.product?.image_url
                                ? it.product.image_url
                                : it.product?.images?.[0]?.url
                                ? `${process.env.NEXT_PUBLIC_DEV_API}${it.product.images[0].url}`
                                : "/customers/amy-burns.png"
                            }
                            alt={it.product?.name || "product"}
                            width={256}
                            height={256}
                            className="object-cover rounded-md h-8 w-8 aspect-square"
                            //unoptimized
                          />
                        </td>

                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] font-[510] whitespace-pre-wrap">
                          <p
                            className="line-clamp-2 break-all"
                            data-tooltip-id="product-name"
                            data-tooltip-content={
                              it.product?.name || "(No name)"
                            }
                          >
                            {it.product?.name || "(No name)"}
                          </p>
                          <Tooltip id="product-name" place="top" className="z-10"/>
                        </td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] font-[510]">
                          {it.product?.thonhuom_stock || it.product?.terra_stock
                            ? (it.product?.thonhuom_stock || 0) +
                              (it.product?.terra_stock || 0)
                            : "0"}
                        </td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] font-[510]">
                          {it.quantity}
                        </td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] font-[510]">
                          {isEditable ? (
                            <input
                              type="number"
                              className="border border-[#3C3C4359] px-2 rounded-lg w-full h-8 3xl:h-10 text-[13px] 3xl:text-[15px]"
                              value={it.actual_quantity}
                              onChange={(e) => {
                                let val = Number(e.target.value);
                                if (val < 0) val = 0;
                                handleChangeItem(index, "actual_quantity", val);
                              }}
                            />
                          ) : (
                            it.actual_quantity
                          )}
                        </td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] font-[510]">
                          {diff}
                        </td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] font-[510]">
                          {isEditable ? (
                            // <Select
                            //   options={[
                            //     {value: "thừa", label: "Thừa"},
                            //     {value: "thiếu", label: "Thiếu"},
                            //     {value: "khác", label: "Khác"},
                            //   ]}
                            //   //placeholder="--"
                            //   defaultValue={it.reason}
                            //   onSelect={(value) => handleChangeItem(index, "reason", value)}
                            //   btnClassName="!bg-transparent !text-black !text-[15px] font-semibold !border-[#3C3C4359] min-h-10 rounded-lg"
                            //   wrapperClassName="!min-w-28"
                            // />
                            <select
                              className="border border-[#3C3C4359] p-1 rounded-lg w-full h-8 3xl:h-10 text-[13px] 3xl:text-[15px]"
                              value={it.reason}
                              onChange={(e) =>
                                handleChangeItem(
                                  index,
                                  "reason",
                                  e.target.value
                                )
                              }
                            >
                              <option value="đủ">Đủ</option>
                              <option value="vỡ">Vỡ</option>
                              <option value="thiếu">Thiếu</option>
                              <option value="hết hạn">Hết hạn</option>
                              <option value="khác">Khác</option>
                            </select>
                          ) : (
                            it.reason || ""
                          )}
                        </td>
                        <td className="p-1.5 3xl:px-3 3xl:py-2 h-8 3xl:h-[56px] text-[13px] 3xl:text-[15px] font-[510]">
                          {isEditable ? (
                            <input
                              type="text"
                              className="border border-[#3C3C4359] p-1 w-full h-8 3xl:h-10 rounded-lg text-[13px] 3xl:text-[15px]"
                              value={it.note || ""}
                              onChange={(e) =>
                                handleChangeItem(index, "note", e.target.value)
                              }
                            />
                          ) : (
                            it.note || ""
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {report.items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-2 text-gray-400">
                        Chưa có sản phẩm kiểm
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {/* history */}
          {/* {activeTab === "history" && (
            <div className="max-h-[300px] overflow-auto rounded-2xl">
              <table className="w-full">
                <thead className="bg-[#73738721] text-left">
                  <tr>
                    <th className="w-[80px] p-3">Thời gian</th>
                    <th className="w-[60px] p-3">Người thao tác</th>
                    <th className="w-[80px] p-3">Chức năng</th>
                    <th className="w-[200px] p-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((h, i) => (
                      <tr key={i}
                        className={`border-b ${i % 2 === 0 ? 'bg-[#5B5B7B0D]' : 'bg-white'}`}
                      >
                        <td className="px-2 py-1">
                          {new Date(h.created_at).toLocaleString("vi-VN")}
                        </td>
                        <td className="p-3">{h.user_id}</td>
                        <td className="p-3">{h.reason || "-"}</td>
                        <td className="p-3">{h.note || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-2 text-gray-400">
                        Chưa có lịch sử
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )} */}
        </div>
        <div className="flex justify-end mt-3 3xl:mt-4">
          {isEditable && (
            <div className="flex gap-3">
              <button
                className="bg-transparent text-sm text-[#338BFF] px-4 rounded-md border border-[#338BFF] h-8 3xl:min-h-10 3x:py-2.5 text-[13px] 3xl:text-[15px]"
                onClick={handleSave}
              >
                Lưu chỉnh sửa
              </button>
              <button
                className="bg-[#338BFF] hover:bg-[#66b2ff] text-sm text-white px-4 rounded-md h-8 3xl:min-h-10 3x:py-2.5 text-[13px] 3xl:text-[15px]"
                onClick={handleComplete}
              >
                Cân bằng kho
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog 
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onConfirm={confirmSave}
        title="Xác nhận lưu chỉnh sửa phiếu kiểm"
        
      />

      <ConfirmDialog 
        isOpen={isCompleteDialogOpen}
        onClose={() => setIsCompleteDialogOpen(false)}
        onConfirm={confirmComplete}
        title="Xác nhận cân bằng kho"
      />
    </div>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
 
}

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Xác nhận phiếu kiểm", 
 
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed  inset-0 z-50 flex items-center justify-center">
      <div className="rounded-2xl border-2 shadow-2xl flex flex-col gap-4 justify-center items-center bg-white">
        <div className="flex flex-col items-center gap-4 pt-6 px-6 bg-white border-t-2 rounded-t-2xl">
          <ContentPasteSearchOutlined
            sx={{ fontSize: 64 }}
            className="text-blue-500"
          />
          <h2 className="text-2xl font-semibold mb-4">{title}</h2>
          <p className="text-xl mb-6 text-center">
            Vui lòng kiểm tra lại thông tin trước khi xác nhận.
            <br />
            Nhấn “<span className="font-semibold">Xác nhận</span>” để hoàn tất phiếu kiểm
            hoặc “<span className="font-semibold">Hủy</span>” để quay lại.
          </p>
        </div>

        <div className="flex gap-4 bg-[#DFDCE0] w-full px-6 py-4 items-center rounded-b-2xl justify-end ">  
          <button
            className="bg-transparent text-[15px] text-[#338BFF] p-2.5 px-4 rounded-md border border-[#338BFF]"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="bg-[#338BFF] hover:bg-[#66b2ff] text-[15px] text-white p-2.5 px-4 rounded-md"
            onClick={onConfirm}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
