"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  createShop,
  fetchDistricts,
  fetchProvinces,
  fetchWards,
} from "@/app/lib/data";
import { CloseOutlined, CheckCircleOutlined } from "@mui/icons-material";
import { ReportGmailerrorred } from "@mui/icons-material";

interface PopupCreateShopProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PopupCreateShop({
  isOpen,
  onClose,
}: PopupCreateShopProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<{
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    address: string;
  }>({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    address: "",
  });

  // Province
  const [province, setProvince] = useState("");
  const [isProvincesFetched, setIsProvincesFetched] = useState(false);
  const [provinceList, setProvinceList] = useState<any[]>([]);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<{
    ProvinceID: number;
    ProvinceName: string;
  } | null>(null);

  const fetchProvincesData = async () => {
    if (!isProvincesFetched) {
      try {
        const provinces = await fetchProvinces();
        setProvinceList(provinces);
        setIsProvincesFetched(true);
      } catch (error: any) {
        console.error("Lỗi khi tải danh sách tỉnh/thành:", error);
        setMessage(error.message);
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
        }, 5000);
      }
    }
  };
  
  const handleProvinceFocus = () => {
    setShowProvinceDropdown(true);
    fetchProvincesData();
  };

  const filteredProvinces = provinceList.filter((p: any) => {
    const query = province.toLowerCase();
    const matchByName = p.ProvinceName.toLowerCase().includes(query);
    const matchByExtension =
      p.NameExtension &&
      p.NameExtension.some((ext: string) => ext.toLowerCase().includes(query));
    return matchByName || matchByExtension;
  });

  //District
  const [districtName, setDistrictNname] = useState("");
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [districtList, setDistrictList] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<{
    DistrictID: number;
    DistrictName: string;
  } | null>(null);

  const filteredDistricts = districtList.filter((d) => {
    const query = districtName.toLowerCase();
    const matchByName = d.DistrictName.toLowerCase().includes(query);
    const matchByExtension =
      d.NameExtension &&
      d.NameExtension.some((ext: string) => ext.toLowerCase().includes(query));
    return matchByName || matchByExtension;
  });

  // Ward
  const [wardName, setWardName] = useState("");
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [wardList, setWardList] = useState<any[]>([]);
  const [selectedWard, setSelectedWard] = useState<{
    WardCode: string;
    WardName: string;
  } | null>(null);

  const filteredWards = wardList.filter((w) => {
    const query = wardName.toLowerCase();
    const matchByName = w.WardName.toLowerCase().includes(query);
    const matchByExtension =
      w.NameExtension &&
      w.NameExtension.some((ext: string) => ext.toLowerCase().includes(query));
    return matchByName || matchByExtension;
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const provinceDropdownRef = useRef<HTMLDivElement | null>(null);
  const wardDropdownRef = useRef<HTMLDivElement | null>(null);
  const districtDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        provinceDropdownRef.current &&
        !provinceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProvinceDropdown(false);
      }
      if (
        districtDropdownRef.current &&
        !districtDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDistrictDropdown(false);
      }
      if (
        wardDropdownRef.current &&
        !wardDropdownRef.current.contains(event.target as Node)
      ) {
        setShowWardDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectProvince = async (province: any) => {
    setSelectedProvince({
      ProvinceID: province.ProvinceID,
      ProvinceName: province.ProvinceName,
    });
    setShowProvinceDropdown(false);
    setProvince(province.ProvinceName);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistrictList([]);
    setWardList([]);
    setDistrictNname("");
    setWardName("");

    try {
      const districts = await fetchDistricts(province.ProvinceID);
      setDistrictList(districts);
    } catch (error: any) {
      console.error("Error fetch districts:", error.message);
      const errorResponse = JSON.parse(error.message);
      setMessage(`Lỗi: ${errorResponse.detail[0]?.msg}`);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  const handleSelectDistrict = async (district: any) => {
    setSelectedDistrict({
      DistrictID: district.DistrictID,
      DistrictName: district.DistrictName,
    });
    setShowDistrictDropdown(false);
    setDistrictNname(district.DistrictName);
    setSelectedWard(null);
    setWardList([]);
    setWardName("");

    try {
      const wards = await fetchWards(district.DistrictID);
      setWardList(wards);
    } catch (error: any) {
      console.error("Error fetch wards:", error.message);
      const errorResponse = JSON.parse(error.message);
      setMessage(`Lỗi: ${errorResponse.detail[0]?.msg}`);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  const handleSelectWard = (ward: any) => {
    setSelectedWard({ WardCode: ward.WardCode, WardName: ward.WardName });
    setShowWardDropdown(false);
    setWardName(ward.WardName);
  };

  if (!isOpen) return null;

  const handleCreate = async () => {
    const newErrors = {
      fullName: fullName.trim() ? "" : "Tên Shop không hợp lệ.",
      phone: phone.trim() ? "" : "Số điện thoại không hợp lệ.",
      province: selectedProvince ? "" : "Chưa chọn Tỉnh/Thành Phố.",
      district: selectedDistrict ? "" : "Chưa chọn Quận/Huyện.",
      ward: selectedWard ? "" : "Chưa chọn Phường/Xã.",
      address: address.trim() ? "" : "Địa chỉ không hợp lệ.",
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) return;

    try {
      const token = localStorage.getItem("access_token") || "";
      const payload = {
        name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        province_id: selectedProvince?.ProvinceID || 0,
        district_id: selectedDistrict?.DistrictID || 0,
        ward_code: selectedWard?.WardCode || "",
      };
      console.log("Payload:", payload);

      const newCust = await createShop(token, payload);
      setMessage(`Đã thêm mới shop: "${newCust.name}"!`);
      setMessageType("success");
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error("Error creating Shop:", err);
      setMessage(err.message);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60">
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
      <div className="bg-white rounded-3xl shadow-[0_2px_0_#D9D9D9] p-4 3xl:p-6 w-[40vw] max-h-[90vh] 3xl:w-[31vw] 3xl:max-h-[80vh]">
        <div className="flex justify-between mb-2 3xl:mb-6">
          <h2 className="text-xl 3xl:text-2xl font-bold">Tạo Shop</h2>
          <button onClick={onClose} className="text-gray-600">
            <CloseOutlined />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-2 3xl:gap-4 border border-gray-200 rounded-2xl p-4 3xl:p-6 shadow-[0_2px_0_#D9D9D9]">
            <div>
              <label className="text-sm mb-1 font-semibold">Tên shop</label>
              <input
                className="w-full p-2 border rounded-lg border-gray-300 text-sm h-8 3xl:h-10"
                placeholder="Terra"
                value={fullName}
                maxLength={50}
                onChange={(e) => setFullName(e.target.value)}
              />
              <div className="mt-1">
                {errors.fullName && (
                  <p className="text-sm text-red-500 flex items-center">
                    <ReportGmailerrorred className="w-4 h-4 mr-1" />
                    {errors.fullName}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="font-semibold text-sm mb-1">
                Số điện thoại
              </label>
              <input
                className="w-full p-2 border rounded-lg border-gray-300 text-sm h-8 3xl:h-10"
                placeholder="0123-xxx-xxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="mt-1">
                {errors.phone && (
                  <p className="text-sm text-red-500 flex items-center">
                    <ReportGmailerrorred className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div ref={provinceDropdownRef}>
              <label className="font-semibold text-sm mb-1">
                Tỉnh/Thành Phố
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg border-gray-300 text-sm h-8 3xl:h-10"
                  placeholder="Tìm kiếm Tỉnh/Thành..."
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setShowProvinceDropdown(true);
                  }}
                  onFocus={handleProvinceFocus}
                />
                {showProvinceDropdown && (
                  <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-60 overflow-y-auto rounded-lg shadow-[0_2px_0_#D9D9D9]">
                    {filteredProvinces.map((p: any) => (
                      <li
                        key={p.ProvinceID}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                        onClick={() => handleSelectProvince(p)}
                      >
                        {p.ProvinceName}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-1">
                  {errors.province && (
                    <p className="text-sm text-red-500 flex items-center">
                      <ReportGmailerrorred className="w-4 h-4 mr-1" />
                      {errors.province}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div ref={districtDropdownRef}>
              <label className="font-semibold text-sm mb-1">Quận/Huyện</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg border-gray-300 text-sm h-8 3xl:h-10"
                  placeholder="Tìm kiếm Quận/Huyện..."
                  value={districtName}
                  onChange={(e) => {
                    setDistrictNname(e.target.value);
                    setShowDistrictDropdown(true);
                  }}
                  onFocus={() => setShowDistrictDropdown(true)}
                  disabled={!selectedProvince}
                />
                {showDistrictDropdown && selectedProvince && (
                  <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-60 overflow-y-auto rounded-lg shadow-[0_2px_0_#D9D9D9]">
                    {filteredDistricts.map((d: any) => (
                      <li
                        key={d.DistrictID}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                        onClick={() => handleSelectDistrict(d)}
                      >
                        {d.DistrictName}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-1">
                  {errors.district && (
                    <p className="text-sm text-red-500 flex items-center">
                      <ReportGmailerrorred className="w-4 h-4 mr-1" />
                      {errors.district}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div ref={wardDropdownRef}>
              <label className="font-semibold text-sm mb-1">Phường/Xã</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg border-gray-300 text-sm h-8 3xl:h-10"
                  placeholder="Tìm kiếm Phường/Xã..."
                  value={wardName}
                  onChange={(e) => {
                    setWardName(e.target.value);
                    setShowWardDropdown(true);
                  }}
                  onFocus={() => setShowWardDropdown(true)}
                  disabled={!selectedDistrict}
                />
                {showWardDropdown && selectedDistrict && (
                  <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-60 overflow-y-auto rounded-lg shadow-[0_2px_0_#D9D9D9]">
                    {filteredWards.map((w: any) => (
                      <li
                        key={w.WardCode}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                        onClick={() => handleSelectWard(w)}
                      >
                        {w.WardName}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-1">
                  {errors.ward && (
                    <p className="text-sm text-red-500 flex items-center">
                      <ReportGmailerrorred className="w-4 h-4 mr-1" />
                      {errors.ward}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="font-semibold text-sm mb-1">Địa chỉ</label>
              <input
                className="w-full p-2 border rounded-lg border-gray-300 text-sm h-8 3xl:h-10"
                placeholder="Số nhà, ngõ, ngách..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <div className="mt-1">
                {errors.address && (
                  <p className="text-sm text-red-500 flex items-center">
                    <ReportGmailerrorred className="w-4 h-4 mr-1" />
                    {errors.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 3xl:mt-4 flex justify-end">
          <button
            onClick={handleCreate}
            className="bg-[#338BFF] text-white px-4 rounded-lg text-[15px] h-8 3xl:h-10"
          >
            Tạo Shop
          </button>
        </div>
      </div>
    </div>
  );
}
