"use client";

import React, { useState, useEffect } from "react";
import { DeliveryCreate, ShopResponse } from "@/app/lib/definitions";
import {
  fetchShops,
  createTransportOrder,
  fetchPickShifts,
  fetchInvoiceDetail,
} from "@/app/lib/data";
import {
  CloseOutlined,
  LocationOnOutlined,
  CallOutlined,
  PersonOutlineOutlined,
  CheckCircleOutlined,
  ReportGmailerrorred,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { cn } from "@/app/lib/utils";
import { Box, LinearProgress } from "@mui/material";
import { Tooltip } from "react-tooltip";

interface CreateTransportFormProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;

  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerWardName: string;
  customerDistrictName: string;
  customerProvince: string;
  customerWardCode: string;
  customerDistrictId: number;
  codToPaid?: number;
}

export default function CreateTransportForm({
  isOpen,
  onClose,
  invoiceId,
  customerName,
  customerPhone,
  customerAddress,
  customerWardName,
  customerDistrictName,
  customerProvince,
  customerWardCode,
  customerDistrictId,
  codToPaid,
}: CreateTransportFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<ShopResponse[]>([]);
  const [pickShifts, setPickShifts] = useState<
    { id: number; title: string; from_time: number; to_time: number }[]
  >([]);

  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [selectedReturnShopId, setSelectedReturnShopId] = useState<
    number | null
  >(null);
  const [selectedPickShiftId, setSelectedPickShiftId] = useState<number | null>(
    null
  );
  
  const [codAmount, setCodAmount] = useState<number>(0);
  
  const [weight, setWeight] = useState<number>(500);
  const [length, setLength] = useState<number>(5);
  const [width, setWidth] = useState<number>(5);
  const [height, setHeight] = useState<number>(5);

  // Update codAmount whenever codToPaid changes
  useEffect(() => {
    if (codToPaid) {
      setCodAmount(codToPaid);
    }
  }, [codToPaid]);

  const [deliveryRequest, setDeliveryRequest] = useState<string>(
    "Cho xem hàng, không cho thử"
  );
  const [note, setNote] = useState<string>("");

  const [partner, setPartner] = useState<string>("Giao hàng nhanh");
  const [servicePackage, setServicePackage] = useState<
    "Hàng nhẹ" | "Hàng nặng"
  >("Hàng nhẹ");
  const [pickupMethod, setPickupMethod] = useState<
    "Lấy hàng tại kho hàng" | "Lấy hàng tại bưu cục"
  >("Lấy hàng tại kho hàng");
  const [declaredValue, setDeclaredValue] = useState<number>(0);
  const [promoCode, setPromoCode] = useState<string>("");
  const [failedCollectChecked, setFailedCollectChecked] =
    useState<boolean>(false);
  const [failedCollectAmount, setFailedCollectAmount] = useState<number>(0);
  const [partialDelivery, setPartialDelivery] = useState<boolean>(false);
  const [estimatedPartnerFee, setEstimatedPartnerFee] = useState<number>(24000);

  const [paymentTypeId, setPaymentTypeId] = useState<number>(1);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    if (!isOpen) return;
    loadShopsAndPickShifts();
  }, [isOpen]);

  async function loadShopsAndPickShifts() {
    try {
      const [shopsData, pickData] = await Promise.all([
        fetchShops(),
        fetchPickShifts(),
      ]);
      setShops(shopsData);
      setPickShifts(pickData);

      if (shopsData.length > 0) {
        setSelectedShopId(shopsData[0].shop_id);
        setSelectedReturnShopId(shopsData[0].shop_id);
      }
    } catch (err) {
      console.error("loadShopsAndPickShifts error:", err);
    }
  }

  if (!isOpen) return null;
  function mapRequiredNote(value: string) {
    switch (value) {
      case "Cho xem hàng, không cho thử":
        return "CHOXEMHANGKHONGTHU";
      case "Cho xem hàng, cho thử":
        return "CHOTHUHANG";
      case "Không cho xem hàng":
        return "KHONGCHOXEMHANG";
      default:
        return "KHONGCHOXEMHANG";
    }
  }

  const finalRequiredNote = mapRequiredNote(deliveryRequest);
  const serviceTypeId = servicePackage === "Hàng nặng" ? 5 : 2;
  let pickStationId: number | undefined = undefined;
  if (pickupMethod === "Lấy hàng tại bưu cục") {
    pickStationId = 999;
  }

  const returnShop = shops.find(
    (shop) => shop.shop_id === selectedReturnShopId
  );
  const returnPhone = returnShop?.phone;
  const returnAddress = returnShop?.address;
  const returnWardName = returnShop?.ward_code;
  const returnDistrictName = returnShop?.district_id;
  const pickShiftValue: number = selectedPickShiftId ?? 2;

  const handleCreateTransport = async () => {
    try {
      if (!selectedShopId) {
        //alert("Chưa chọn kho lấy hàng!");
        setMessage("Chưa chọn kho lấy hàng!");
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
        }, 5000);
        return;
      }
      setLoading(true);
      const token = localStorage.getItem("access_token") || "";
      const productsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_DEV_API}/invoices/invoices/${invoiceId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const products = await productsResponse.json();
      const productList =
        products?.items && Array.isArray(products.items) ? products.items : [];

      if (productList.length === 0) {
        setMessage("Danh sách sản phẩm không hợp lệ");
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
        }, 5000);
        throw new Error("Danh sách sản phẩm không hợp lệ");
      }
      const items =
        serviceTypeId === 5
          ? productList.map((item: any) => ({
              name: item.product.name,
              code: item.product_id,
              quantity: item.quantity,
              price: item.price,
              length: item.product.length || 20,
              width: item.product.width || 15,
              height: item.product.height || 10,
              weight: item.product.weight || 100,
              category: { level1: item.product.group_name || "Mỹ phẩm" },
            }))
          : [];
      console.log("SP gửi GHN:", items);

      const payload: DeliveryCreate = {
        payment_type_id: paymentTypeId,
        note: note,
        required_note: finalRequiredNote,
        weight,
        length,
        width,
        height,
        service_type_id: serviceTypeId,
        pick_station_id: pickStationId,
        insurance_value: declaredValue,
        amount_due: 0,
        cod_amount: codAmount,
        pick_shift: pickShiftValue,
        cupon: promoCode,
        return_phone: returnPhone,
        return_address: returnAddress,
        return_ward_name: returnWardName,
        return_district_name: returnDistrictName,
        cod_failed_amount: failedCollectChecked ? failedCollectAmount : 0,
        items,
      };

      console.log("payload:", payload);
      const res = await createTransportOrder(
        invoiceId,
        selectedShopId,
        payload
      );
      console.log("KQ create_order:", res);
      //alert("Tạo đơn thành công!");
      setMessage("Tạo đơn thành công!");
      setMessageType("success");
    
      setTimeout(() => {
        onClose();
        router.push("/tong-quan/van-chuyen");
      }, 1500);
    } catch (err: any) {
      console.error("CreateTransport Error:", err);
      setMessage(err.message);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 1100,
          }}
        >
          <LinearProgress />
        </Box>
      )}
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
        {message && (
          <div
            className={cn(
              "toast-message",
              messageType === "success"
                ? "success"
                : messageType === "error"
                ? "error"
                : ""
            )}
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
        <div className="flex flex-col gap-2 3xl:gap-4 bg-[#F2F2F7] p-3 3xl:p-6 rounded-2xl shadow-[0_2px_0_#D9D9D9] w-[80vw] 3xl:w-[70vw] max-h-[97vh]">
          <div className="flex justify-between">
            <h2 className="2xl:text-xl font-semibold">
              Tạo đơn vận chuyển -{" "}
              <span className="text-[#3C3C43B2]"> Đơn hàng {invoiceId}</span>
            </h2>
            <button onClick={onClose} className="text-gray-600">
              <CloseOutlined />
            </button>
          </div>

          {/* <div className="grid grid-cols-10 grid-rows-5 gap-2 2xl:gap-4"> */}
          <div className="grid grid-cols-2 gap-2 2xl:gap-4">
            <div className="flex flex-col gap-2 2xl:gap-4">
              <div className="flex flex-col gap-1 3xl:gap-4 border rounded-2xl p-2 2xl:p-4 bg-white shadow-[0_2px_0_#D9D9D9]">
                <h3 className="font-semibold xl:text-[15px] 3xl:text-[17px]">
                  Địa chỉ giao hàng
                </h3>
                <div className="flex items-center text-[13px] xl:text-[14px] 3xl:text-[15px]">
                  <PersonOutlineOutlined className="text-[#3C3C4380] mr-2 h-5 w-5" />
                  <span className="text-black">{customerName}</span>
                  <span className="mx-4 text-[#3C3C4380]">|</span>
                  <CallOutlined className="text-[#3C3C4380] mr-2 h-5 w-5" />
                  <span className="text-black">{customerPhone}</span>
                </div>
                <div
                  data-tooltip-id="address-tooltip"
                  data-tooltip-content={`${customerAddress} ${customerWardName} ${customerDistrictName} ${customerProvince}`}
                  className="flex items-center text-[13px] xl:text-[14px] 3xl:text-[15px]"
                >
                  <LocationOnOutlined className="text-[#3C3C4380] mr-2 h-5 w-5" />
                  <span className="text-black line-clamp-1 break-all">
                    {customerAddress} {customerWardName} {customerDistrictName}{" "}
                    {customerProvince}
                  </span>
                </div>
                 <Tooltip id="address-tooltip" place="top" />
              </div>

              <div className="flex flex-col gap-1 3xl:gap-4 border rounded-2xl p-2 2xl:p-4 bg-white shadow-[0_2px_0_#D9D9D9]">
                <h3 className="font-semibold xl:text-[15px] 3xl:text-[17px]">
                  Thông tin giao hàng
                </h3>
                <label className="text-[13px] xl:text-[14px] 3xl:text-[15px]">
                  Tiền thu hộ (COD)
                </label>
                <input
                  type="text"
                  className="border p-1 w-full rounded-md border-[#3C3C4359] h-8 text-[13px] xl:text-[14px] 3xl:text-[15px]"
                  value={
                    codAmount === 0 ? "0" : codAmount.toLocaleString("en-ES")
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    let cod = Number(value);
                    if (isNaN(cod)) cod = 0;
                    if (cod < 0) cod = 0;
                    if (cod > 999999999999) cod = 999999999999;
                    setCodAmount(cod);
                  }}
                />

                <label className="block text-[13px] xl:text-[14px] 3xl:text-[15px]">
                  Khối lượng (g)
                </label>
                <input
                  type="text"
                  className="border p-1 w-full rounded-md border-[#3C3C4359] h-8 text-[13px] xl:text-[14px] 3xl:text-[15px]"
                  value={weight.toLocaleString("en-ES")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    let n = Number(value);
                    if (isNaN(n)) n = 0;
                    if (n < 0) n = 0;
                    if (n > 999999999999) n = 999999999999;
                    setWeight(n);
                  }}
                />

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[13px] xl:text-[14px] 3xl:text-[15px]">
                      Dài (cm)
                    </label>
                    <input
                      type="text"
                      className="border p-1 w-full rounded-md border-[#3C3C4359] h-8 text-[13px] xl:text-[14px] 3xl:text-[15px]"
                      value={length.toLocaleString("en-ES")}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, "");
                        let n = Number(value);
                        if (isNaN(n)) n = 0;
                        if (n < 0) n = 0;
                        if (n > 999999999999) n = 999999999999;
                        setLength(n);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] xl:text-[14px] 3xl:text-[15px]">
                      Rộng (cm)
                    </label>
                    <input
                      type="text"
                      className="border p-1 w-full rounded-md border-[#3C3C4359] h-8 text-[13px] xl:text-[14px] 3xl:text-[15px]"
                      value={width.toLocaleString("en-ES")}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, "");
                        let n = Number(value);
                        if (isNaN(n)) n = 0;
                        if (n < 0) n = 0;
                        if (n > 999999999999) n = 999999999999;
                        setWidth(n);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] xl:text-[14px] 3xl:text-[15px]">
                      Cao (cm)
                    </label>
                    <input
                      type="text"
                      className="border p-1 w-full rounded-md border-[#3C3C4359] h-8 text-[13px] xl:text-[14px] 3xl:text-[15px]"
                      value={height.toLocaleString("en-ES")}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, "");
                        let n = Number(value);
                        if (isNaN(n)) n = 0;
                        if (n < 0) n = 0;
                        if (n > 999999999999) n = 999999999999;
                        setHeight(n);
                      }}
                    />
                  </div>
                </div>

                <label className="block text-[13px] xl:text-[14px] 3xl:text-[15px]">
                  Yêu cầu giao hàng
                </label>
                <select
                  className="border p-1 w-full rounded-md border-[#3C3C4359] h-8 text-[13px] xl:text-[14px] 3xl:text-[15px] font-medium"
                  value={deliveryRequest}
                  onChange={(e) => setDeliveryRequest(e.target.value)}
                >
                  <option>Cho xem hàng, không cho thử</option>
                  <option>Cho xem hàng, cho thử</option>
                  <option>Không cho xem hàng</option>
                </select>

                <label className="block text-[13px] xl:text-[14px] 3xl:text-[15px]">
                  Ghi chú
                </label>
                <textarea
                  className="border p-1 w-full rounded-md border-[#3C3C4359] text-[13px] xl:text-[14px] 3xl:text-[15px]"
                  rows={4}
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 3xl:gap-4 text-[15px] border rounded-2xl p-2 2xl:p-4 bg-white shadow-[0_2px_0_#D9D9D9]">
              <h3 className="font-semibold xl:text-[15px] 3xl:text-[17px]">
                Gói dịch vụ
              </h3>

              <div className="flex flex-col">
                <label className="text-[13px] xl:text-[14px] 3xl:text-[15px]">
                  Đối tác
                </label>
                <select
                  className="border p-1 rounded-md w-full border-[#3C3C4359] h-8 text-[13px] xl:text-[14px] 3xl:text-[15px] font-medium"
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                >
                  <option value="Giao hàng nhanh">Giao hàng nhanh</option>
                  <option value="Giao hàng A">SPX</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[13px] xl:text-[14px] 3xl:text-[15px]">
                  Kho lấy hàng
                </label>
                <select
                  className="border p-1 rounded-md w-full border-[#3C3C4359] pr-8 h-8 text-[13px] xl:text-[14px] 3xl:text-[15px] font-medium"
                  value={selectedShopId || ""}
                  onChange={(e) => setSelectedShopId(+e.target.value)}
                >
                  {shops.map((s) => (
                    <option key={s.shop_id} value={s.shop_id}>
                      {s.shop_id} - {s.name} - {s.address}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 2xl:gap-4">
                <div className="flex flex-col w-1/2">
                  <label className="text-[13px] xl:text-[14px] 3xl:text-[15px]">
                    Gói dịch vụ
                  </label>
                  <select
                    className="border p-1 rounded-md w-full border-[#3C3C4359] h-8 text-[13px] xl:text-[14px] 3xl:text-[15px] font-medium"
                    value={servicePackage}
                    onChange={(e) => {
                      const val = e.target.value as "Hàng nhẹ" | "Hàng nặng";
                      setServicePackage(val);
                      setEstimatedPartnerFee(
                        val === "Hàng nhẹ" ? 21000 - 24000 : 30000 - 50000
                      );
                    }}
                  >
                    <option>Hàng nhẹ</option>
                    <option>Hàng nặng</option>
                  </select>
                </div>
                <div className="flex flex-col w-1/2">
                  <label className="text-[13px] xl:text-[14px] 3xl:text-[15px]">
                    Hình thức
                  </label>
                  <select
                    className="border p-1 rounded-md w-full border-[#3C3C4359] pr-8 h-8 text-[13px] xl:text-[14px] 3xl:text-[15px] font-medium"
                    value={pickupMethod}
                    onChange={(e) => setPickupMethod(e.target.value as any)}
                  >
                    <option value="Lấy hàng tại kho hàng">
                      Lấy hàng tại kho hàng
                    </option>
                    <option value="Lấy hàng tại bưu cục">
                      Lấy hàng tại bưu cục
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[13px] xl:text-[14px] 3xl:text-[15px]">
                  Địa chỉ trả hàng
                </label>
                <select
                  className="border p-1 rounded-md w-full border-[#3C3C4359] pr-8 h-8 text-[13px] xl:text-[14px] 3xl:text-[15px] font-medium"
                  value={selectedReturnShopId ?? ""}
                  onChange={(e) =>
                    setSelectedReturnShopId(Number(e.target.value))
                  }
                >
                  {shops.map((s) => (
                    <option key={s.shop_id} value={s.shop_id}>
                      {s.name} - {s.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 2xl:gap-4">
                <div className="flex flex-col">
                  <label className="text-[13px] xl:text-[14px] 3xl:text-[15px]">
                    Ca lấy hàng
                  </label>
                  <select
                    className="border p-1 rounded-md w-full border-[#3C3C4359] h-8 text-[13px] xl:text-[14px] 3xl:text-[15px] font-medium"
                    value={selectedPickShiftId || ""}
                    onChange={(e) => {
                      const val = +e.target.value;
                      setSelectedPickShiftId(val !== 0 ? val : null);
                    }}
                  >
                    <option value={0}>Chọn ca lấy hàng</option>
                    {pickShifts.map((sh) => (
                      <option key={sh.id} value={sh.id}>
                        {sh.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] xl:text-[14px] 3xl:text-[15px]">
                    Khai báo giá trị
                  </label>
                  <input
                    type="text"
                    className="border p-1 rounded-md w-full border-[#3C3C4359] h-8 text-[13px] xl:text-[14px] 3xl:text-[15px]"
                    value={declaredValue.toLocaleString("en-ES")}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      let n = Number(value);
                      if (isNaN(n)) n = 0;
                      if (n < 0) n = 0;
                      if (n > 999999999999) n = 999999999999;
                      setDeclaredValue(n);
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 items-center gap-2 2xl:gap-4 border-b border-[#D9D9D9] pb-2 3xl:pb-4">
                <div className="flex flex-col">
                  <label className="text-[13px] xl:text-[14px] 3xl:text-[15px]">
                    Người trả phí
                  </label>
                  <div className="flex gap-10">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={paymentTypeId === 1}
                        onChange={() => setPaymentTypeId(1)}
                      />
                      <span className="text-[13px] xl:text-[14px] 3xl:text-[15px]">
                        Shop trả
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={paymentTypeId === 2}
                        onChange={() => setPaymentTypeId(2)}
                      />
                      <span className="text-[13px] xl:text-[14px] 3xl:text-[15px]">
                        Khách trả
                      </span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 2xl:gap-4">
                  <div className="flex flex-col w-2/3">
                    <label className="text-[13px] xl:text-[14px] 3xl:text-[15px]">
                      Mã giảm giá
                    </label>
                    <input
                      type="text"
                      className="border p-2 rounded-md  border-[#3C3C4359] h-8 3xl:h-10 text-[13px] xl:text-[14px] 3xl:text-[15px]"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                  </div>
                  <button className="self-end h-8 3xl:h-10 w-full text-[13px] xl:text-[14px] 3xl:text-[15px] rounded-md text-[#338BFF] border border-[#338BFF]">
                    Kiểm tra
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 2xl:gap-4 pt-1">
                <div className="flex items-center gap-2 w-1/2">
                  <input
                    type="checkbox"
                    className="rounded-[4px]"
                    checked={failedCollectChecked}
                    onChange={(e) => setFailedCollectChecked(e.target.checked)}
                  />
                  <span className="text-[13px] xl:text-[14px] 3xl:text-[15px]">
                    Giao thất bại - thu tiền
                  </span>
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    value={failedCollectAmount.toLocaleString("en-ES")}
                    className="border p-2 rounded-md  border-[#3C3C4359] w-full h-8 3xl:h-10 text-[13px] xl:text-[14px] 3xl:text-[15px]"
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      let n = Number(value);
                      if (isNaN(n)) n = 0;
                      if (n < 0) n = 0;
                      if (n > 999999999999) n = 999999999999;
                      setFailedCollectAmount(n);
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded-[4px]"
                  checked={partialDelivery}
                  onChange={(e) => setPartialDelivery(e.target.checked)}
                />
                <span className="text-[13px] xl:text-[14px] 3xl:text-[15px]">
                  Giao hàng 1 phần
                </span>
              </div>

              <div className="flex justify-between border-t border-[#D9D9D9] pt-2 2xl:pt-4 font-semibold xl:text-[15px] 3xl:text-[17px]">
                <h2>Phí trả đối tác vận chuyển</h2>
                <p>{estimatedPartnerFee.toLocaleString("en-ES")}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCreateTransport}
              className="bg-[#338BFF] text-white items-center rounded-lg px-16 h-8 3xl:h-10 text-[13px] xl:text-[14px] 3xl:text-[15px]"
            >
              Tạo đơn
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
