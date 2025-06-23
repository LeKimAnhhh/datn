"use client";

import React, { useState, useEffect, useRef } from "react";
import { createCustomer, getCustomerGroups, fetchDistricts, fetchWards, fetchProvinces } from "@/app/lib/data";
import { Customer, CustomerGroup } from "@/app/lib/definitions";
import { CloseOutlined, BookmarkAddedOutlined, CheckCircleOutlined } from "@mui/icons-material";
// import provincesData from "@/app/provinces.json";
import { ReportGmailerrorred } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// const API_BASE_URL = process.env.NEXT_PUBLIC_DEV_API;
// async function fetchDistricts(provinceId: number) {
//   const res = await fetch(`${API_BASE_URL}/deliveries/ghn/districts/${provinceId}`);
//   if (!res.ok) {
//     const error = await res.text();
//     throw new Error(error || "Failed to fetch districts");
//   }
//   const data = await res.json();
//   return data.data; 
// }

// async function fetchWards(districtId: number) {
//   const res = await fetch(`${API_BASE_URL}/deliveries/ghn/wards/${districtId}`);
//   if (!res.ok) {
//     const error = await res.text();
//     throw new Error(error || "Failed to fetch wards");
//   }
//   const data = await res.json();
//   return data.data; 
// }

interface PopupCreateCustomerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess?: (customer: Customer) => void;
}

export default function PopupCreateCustomer({
  isOpen,
  onClose,
  onCreateSuccess,
}: PopupCreateCustomerProps) {
  const [fullName, setFullName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupOptions, setGroupOptions] = useState<CustomerGroup[]>([]);
  const [phone, setPhone] = useState("");
  const [debt, setDebt] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<{ fullName: string}>({ fullName: ""});
  const [isProvincesFetched, setIsProvincesFetched] = useState(false);

  // Province
  const [provinceList, setProvinceList] = useState<any[]>([]);
  const [province, setProvincel] = useState("");
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

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("access_token") || "";
      getCustomerGroups(token)
        .then((groups) => setGroupOptions(groups))
        .catch((err) => {
          console.error("Fetch group options error:", err.message);
        });
    }
  }, [isOpen]);

  const provinceDropdownRef = useRef<HTMLDivElement | null>(null);
  const wardDropdownRef = useRef<HTMLDivElement | null>(null);
  const districtDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(event.target as Node)) {
        setShowProvinceDropdown(false);
      }
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target as Node)) {
        setShowDistrictDropdown(false);
      }
      if (wardDropdownRef.current && !wardDropdownRef.current.contains(event.target as Node)) {
        setShowWardDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectProvince = async (province: any) => {
    setSelectedProvince({ ProvinceID: province.ProvinceID, ProvinceName: province.ProvinceName });
    setShowProvinceDropdown(false);
    setProvincel(province.ProvinceName);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistrictList([]);
    setWardList([]);
    setDistrictNname("");
    setWardName("");

    try {
      const districts = await fetchDistricts( province.ProvinceID);
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
    setSelectedDistrict({ DistrictID: district.DistrictID, DistrictName: district.DistrictName });
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

  const handleResetForm = () => {
    setFullName("");
    setBirthday("");
    setGroupName("");
    setPhone("");
    setDebt("");
    setEmail("");
    setAddress("");
    setErrors({ fullName: "" });
    setProvincel("");
    setSelectedProvince(null);
    setDistrictNname("");
    setSelectedDistrict(null);
    setWardName("");
    setSelectedWard(null);
  }

  const handleCreate = async () => {
    const newErrors = {
      fullName: fullName.trim() ? "" : "Tên khách hàng không hợp lệ.",
      // phone: phone.trim() ? "" : "Số điện thoại không hợp lệ.",
    };
    setErrors(newErrors);
    if (newErrors.fullName) return;

    try {
      const token = localStorage.getItem("access_token") || "";
      const payload = {
        full_name: fullName.trim(),
        date_of_birth: birthday || null,
        group_id: groupOptions.find((group) => group.name === groupName)?.id || null,
        phone: phone.trim(),
        email: email.trim() || null,
        address: address,
        province: selectedProvince?.ProvinceName || "",
        district_name: selectedDistrict?.DistrictName || "",
        district_id: selectedDistrict?.DistrictID || 0,
        ward_code: selectedWard?.WardCode || "",
        ward_name: selectedWard?.WardName || "",
        debt: parseFloat(debt) || 0.0,
      };
      console.log("Payload:", payload);

      const newCust = await createCustomer(token, payload);
      setMessage(`Đã thêm mới thành công khách hàng "${newCust.full_name}"!`);
      setMessageType("success");
      
      setTimeout(() => {
        if (onCreateSuccess) {
          onCreateSuccess(newCust);
        }
        setMessage("");
        handleResetForm();
        
        onClose();
      }, 1500); 
    } catch (err: any) {
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
      <div className="bg-white rounded-3xl shadow-[0_2px_0_#D9D9D9] p-6 w-full xl:w-[75%] 2xl:w-[60%] max-h-[95vh]">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold">Thêm khách hàng</h2>
          <button onClick={onClose} className="text-gray-600">
            <CloseOutlined />
          </button>
        </div>

        <div className="grid grid-cols-6 grid-rows-2 gap-4 max-h-[80vh] 3xl:max-h-none">
          <div className="col-span-3 flex flex-col gap-2 3xl:gap-4 border border-gray-200 rounded-2xl p-6 shadow-[0_2px_0_#D9D9D9]">
            <h3 className="font-semibold text-xl">Thông tin cá nhân</h3>
            <div>
              <label className="text-sm mb-1 font-semibold">Tên khách hàng</label>
              <input
                className="w-full p-2 border rounded-lg border-gray-300 text-sm"
                // placeholder="Tên khách hàng"
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
              <label className="text-sm mb-1 font-semibold">Ngày sinh</label>
              {/* <input
                type="date"
                className="w-full p-2 border rounded-lg border-gray-300 text-sm"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              /> */}
              <div className="relative">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={birthday ? dayjs(birthday) : null}
                  onChange={(date) => setBirthday(date ? date.format("YYYY-MM-DD") : "")}
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
                          gap: "2px",
                        },
                      },
                      inputProps: {
                        className: "placeholder-gray-400 focus:ring-0",
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
            </div>
          </div>

          <div className="col-span-3 col-start-1 row-start-2 flex flex-col gap-2 3xl:gap-4 border border-gray-200 rounded-2xl p-6 shadow-[0_2px_0_#D9D9D9]">
            <h3 className="font-semibold text-xl">Thông tin quản lý</h3>
            <div>
              <label className="text-sm mb-1 font-semibold">Nhóm khách hàng</label>
              <select
                className="w-full p-2 border rounded-lg border-gray-300 text-sm"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              >
                <option value="" disabled>
                  Chọn nhóm khách hàng
                </option>
                {groupOptions.map((group) => (
                  <option key={group.id} value={group.name}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-sm mb-1">Công nợ</label>
              <input
                type="text"
                value={Number(debt).toLocaleString("en-ES")}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length > 12) value = value.slice(0, 12);
                  setDebt(value);
                }}
                // placeholder="Số công nợ"
                className="w-full p-2 border rounded-md border-gray-300 text-sm"
              />
            </div>
          </div>

          <div className="col-span-3 row-span-2 col-start-4 row-start-1 flex flex-col gap-2 3xl:gap-4 border border-gray-200 rounded-2xl p-6 shadow-[0_2px_0_#D9D9D9]">
            <h3 className="font-semibold text-xl">Thông tin liên hệ</h3>
            <div>
              <label className="font-semibold text-sm mb-1">Số điện thoại</label>
              <input
                className="w-full p-2 border rounded-lg border-gray-300 text-sm"
                // placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {/* <div className="mt-1">
                {errors.phone && (
                  <p className="text-sm text-red-500 flex items-center">
                    <ReportGmailerrorred className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div> */}
              </div>
            <div>
              <label className="font-semibold text-sm mb-1">Email</label>
              <input
                className="w-full p-2 border rounded-lg border-gray-300 text-sm"
                // placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div ref={provinceDropdownRef}>
              <label className="font-semibold text-sm mb-1">Tỉnh/Thành Phố</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg border-gray-300 text-sm"
                  placeholder="Tìm kiếm Tỉnh/Thành..."
                  value={province}
                  onChange={(e) => {
                    setProvincel(e.target.value);
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
              </div>
            </div>

            <div ref={districtDropdownRef}>
              <label className="font-semibold text-sm mb-1">Quận/Huyện</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg border-gray-300 text-sm"
                  // placeholder="Tìm kiếm Quận/Huyện..."
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
              </div>
            </div>

            <div ref={wardDropdownRef}>
              <label className="font-semibold text-sm mb-1">Phường/Xã</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg border-gray-300 text-sm"
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
              </div>
            </div>

            <div>
              <label className="font-semibold text-sm mb-1">Địa chỉ</label>
              <input
                className="w-full p-2 border rounded-lg border-gray-300 text-sm"
                placeholder="Ví dụ: Số 12, ngõ 24 Vạn Phúc..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCreate}
            className="bg-[#338BFF] text-white px-4 py-2 rounded-lg text-[15px]"
          >
            Tạo khách hàng
          </button>
        </div>
      </div>
    </div>
  );
}
