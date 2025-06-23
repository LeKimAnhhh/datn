"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  getCustomerById, 
  updateCustomer, 
  getCustomerGroups, 
  fetchDistricts, 
  payCustomerAmount,
  fetchWards, 
  fetchProvinces} from "@/app/lib/data";
import { Customer, CustomerGroup } from "@/app/lib/definitions";
import { CloseOutlined, CheckCircleOutlined, ReportGmailerrorred } from "@mui/icons-material";
// import provincesData from "@/app/provinces.json";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import PaymentModal from "../payment";
import CustomerPopupSkeleton from "@/app/components/CustomerPopupSkeleton";

interface PopupEditCustomerProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
  onSaved: (updated: Customer) => void;
}

export default function PopupEditCustomer({
  isOpen,
  onClose,
  customerId,
  onSaved,
}: PopupEditCustomerProps) {
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [fullName, setFullName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupOptions, setGroupOptions] = useState<CustomerGroup[]>([]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // Tỉnh/Thành
  const [provinceList, setProvinceList] = useState<any[]>([]);
  const [province, setProvincel] = useState("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<{
    ProvinceID: number;
    ProvinceName: string;
  } | null>(null);

  // Quận/Huyện
  const [districtName, setDistrictNname] = useState("");
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [districtList, setDistrictList] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<{
    DistrictID: number;
    DistrictName: string;
  } | null>(null);

  // Phường/Xã
  const [wardName, setWardName] = useState("");
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [wardList, setWardList] = useState<any[]>([]);
  const [selectedWard, setSelectedWard] = useState<{
    WardCode: string;
    WardName: string;
  } | null>(null);

  const provinceDropdownRef = useRef<HTMLDivElement | null>(null);
  const districtDropdownRef = useRef<HTMLDivElement | null>(null);
  const wardDropdownRef = useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isOpenModalPayment, setIsOpenModalPayment] = useState(false);
  const [debt, setDebt] = useState<number>(0);
  const [isProvincesFetched, setIsProvincesFetched] = useState(false);

  useEffect(() => {
    if (isOpen && customerId) {
      setLoading(true);
      const token = localStorage.getItem("access_token") || "";
      getCustomerById(token, customerId)
        .then(async (cus) => {
          setCustomer(cus);
          setFullName(cus.full_name || "");
          setBirthday(cus.date_of_birth || "");
          // setGroupName(cus.group_name || "");
          setPhone(cus.phone || "");
          setEmail(cus.email || "");
          setDebt(cus.debt || 0);
          setProvincel(cus.province || "");
          setDistrictNname(cus.district_name || "");
          setWardName(cus.ward_name || "");
          setAddress(cus.address || "");

          // fill cus group
          const groups = await getCustomerGroups(token);
          setGroupOptions(groups);
          const matchedGroup = groups.find((g) => g.id === cus.group_id);
          setGroupName(matchedGroup ? matchedGroup.name : "");

          // Reset selected
          setSelectedProvince(null);
          setSelectedDistrict(null);
          setSelectedWard(null);
          setDistrictList([]);
          setWardList([]);

          console.log("Customer detail:", cus);
        })
        .catch((err) => {
          console.error("Fetch customer detail error:", err);
          const errorResponse = JSON.parse(err.message);
          setMessage(`Lỗi: ${errorResponse.detail[0]?.msg}`);
          setMessageType("error");

          setTimeout(() => {
            setMessage("");
          }, 5000);
          // alert(err.message);
        });

      getCustomerGroups(token)
        .then((groups) => {
          setGroupOptions(groups);
        })
        .catch((err) => {
          console.error("Fetch group options error:", err);
        })
        .finally(() => setTimeout(() => {
          setLoading(false);
        }, 600));
    }
  }, [isOpen, customerId]);
  

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(e.target as Node)) {
        setShowProvinceDropdown(false);
      }
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(e.target as Node)) {
        setShowDistrictDropdown(false);
      }
      if (wardDropdownRef.current && !wardDropdownRef.current.contains(e.target as Node)) {
        setShowWardDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    const matchByExtension = p.NameExtension?.some((ext: string) => ext.toLowerCase().includes(query));
    return matchByName || matchByExtension;
  });

  const filteredDistricts = districtList.filter((d: any) => {
    const query = districtName.toLowerCase();
    const matchByName = d.DistrictName.toLowerCase().includes(query);
    const matchByExtension = d.NameExtension?.some((ext: string) => ext.toLowerCase().includes(query));
    return matchByName || matchByExtension;
  });

  const filteredWards = wardList.filter((w: any) => {
    const query = wardName.toLowerCase();
    const matchByName = w.WardName.toLowerCase().includes(query);
    const matchByExtension = w.NameExtension?.some((ext: string) => ext.toLowerCase().includes(query));
    return matchByName || matchByExtension;
  });

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
    if (province.ProvinceID) {
      try {
        const d = await fetchDistricts(province.ProvinceID);
        setDistrictList(d);
      } catch (error: any) {
        // alert(error.message);
        const errorResponse = JSON.parse(error.message);
        setMessage(`Lỗi: ${errorResponse.detail[0]?.msg}`);
        setMessageType("error");

        setTimeout(() => {
          setMessage("");
        }, 5000);
      }
    }
  };

  const handleSelectDistrict = async (district: any) => {
    setSelectedDistrict({ DistrictID: district.DistrictID, DistrictName: district.DistrictName });
    setShowDistrictDropdown(false);
    setDistrictNname(district.DistrictName);
    setSelectedWard(null);
    setWardList([]);
    setWardName("");

    if (district.DistrictID) {
      try {
        const w = await fetchWards(district.DistrictID);
        setWardList(w);
      } catch (error: any) {
        // alert(error.message);
        const errorResponse = JSON.parse(error.message);
        setMessage(`Lỗi: ${errorResponse.detail[0]?.msg}`);
        setMessageType("error");

        setTimeout(() => {
          setMessage("");
        }, 5000);
      }
    }
  };

  const handleSelectWard = (ward: any) => {
    setSelectedWard({ WardCode: ward.WardCode, WardName: ward.WardName });
    setShowWardDropdown(false);
    setWardName(ward.WardName);
  };

  const handleSave = async () => {
    if (!customerId) return;

    const token = localStorage.getItem("access_token") || "";
    const payload = {
      full_name: fullName.trim(),
      date_of_birth: birthday || null,
      group_id: groupOptions.find((g) => g.name === groupName)?.id || 1,
      phone: phone.trim(),
      email: email.trim(),
      address: address,
      // province: selectedProvince?.ProvinceName || customer?.province || "",
      // district_id: selectedDistrict?.DistrictID || customer?.district_id || "",
      // district_name: selectedDistrict?.DistrictName || customer?.district_name || "",
      // ward_name: selectedWard?.WardName || customer?.ward_name || "",
      // ward_code: selectedWard?.WardCode || customer?.ward_code || "",

      province: province.trim() || null,
      district_id: districtName ? selectedDistrict?.DistrictID || null : null,
      district_name: districtName.trim() || null,
      ward_name: wardName.trim() || null,
      ward_code: selectedWard?.WardCode || customer?.ward_code || "",
    };

    console.log(payload)

    try {
      const updated = await updateCustomer(token, customerId, payload);
      onSaved(updated);
      setMessage(`Đã lưu thay đổi`);
      setMessageType("success");
      setTimeout(() => {
        onClose();
        // window.location.reload();
      }, 2000); 
    } catch (err: any) {
      console.error("Update customer error:", err.message);
      setMessage(`${err.message}`);
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
      }, 5000);
      // alert(err.message);
    }
  };

  const handleConfirmPayment = async (remainToPay: number) => {
    try {
      const token = localStorage.getItem("access_token") || "";
      if (customer?.id) {
        await payCustomerAmount(token, customer?.id, remainToPay);
        
        const updatedCustomer = await getCustomerById(token, customer.id);
        setDebt(updatedCustomer.debt);
        setCustomer(updatedCustomer);
  
        setMessage("Thanh toán thành công!");
        setMessageType("success");

        setTimeout(() => {
          setMessage("");
        }, 5000);
        setTimeout(() => {
          setIsOpenModalPayment(false);
        }, 1000);
      }
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  if(loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60">
        <CustomerPopupSkeleton />
      </div>
    )
  }

  if (!isOpen) return null;

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
        <div className="flex justify-between mb-2 3xl:mb-6">
          <h2 className="text-2xl font-bold">Chi tiết khách hàng</h2>
          <button onClick={onClose} className="text-gray-600">
            <CloseOutlined />
          </button>
        </div>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="grid grid-cols-6 grid-rows-2 gap-4 max-h-[80vh] 3xl:max-h-none">
            <div className="col-span-3 flex flex-col gap-2 3xl:gap-4 border border-gray-200 rounded-2xl p-6 shadow-[0_2px_0_#D9D9D9]">
              <h3 className="font-semibold text-xl">Thông tin cá nhân</h3>
              <div>
                <label className="text-sm mb-1 font-semibold">Tên khách hàng</label>
                <input
                  className="w-full p-2 border rounded-lg border-gray-300 text-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm mb-1 font-semibold">Ngày sinh</label>
                <div className="relative">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={birthday ? dayjs(birthday) : null}
                      onChange={(date) => setBirthday(date ? date.format("YYYY-MM-DD") : "")}
                      format="DD/MM/YYYY"
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
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="text-sm mb-1">Mã khách hàng</label>
                  <input
                    disabled
                    className="w-full p-2 text-sm border rounded-lg border-gray-300 bg-gray-100"
                    placeholder={customer?.id || ""}
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-sm mb-1">Nhóm khách hàng</label>
                  <select
                    className="w-full text-sm p-2 border rounded-lg border-gray-300"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  >
                    {groupOptions.map((group) => (
                      <option key={group.id} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1">Công nợ</label>
                <div className="flex items-center gap-2">
                  <input
                    disabled
                    className="flex-1 p-2 text-sm text-left w-full border rounded-lg border-gray-300 bg-gray-100"
                    value={debt.toLocaleString("en-US") || "0"}
                  />
                  <button
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium bg-blue-600 hover:bg-blue-700 transition-all"
                    onClick={() => setIsOpenModalPayment(true)} 
                  >
                    Thanh toán
                  </button>
                  <PaymentModal 
                    title="khách hàng" 
                    isOpen={isOpenModalPayment} 
                    onClose={() => setIsOpenModalPayment(false)} 
                    onConfirm={handleConfirmPayment}
                  />
                </div>
              </div>
            </div>

            <div className="col-span-3 row-span-2 col-start-4 row-start-1 flex flex-col gap-2 3xl:gap-4 border border-gray-200 rounded-2xl p-6 shadow-[0_2px_0_#D9D9D9]">
              <h3 className="font-semibold text-xl">Thông tin liên hệ</h3>
              <div>
                <label className="font-semibold text-sm mb-1">Số điện thoại</label>
                <input
                  className="w-full p-2 text-sm border rounded-md border-gray-300"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="font-semibold text-sm mb-1">Email</label>
                <input
                  className="w-full p-2 text-sm border rounded-md border-gray-300"
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
                    // onFocus={() => setShowProvinceDropdown(true)}
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
                    placeholder="Tìm kiếm Quận/Huyện..."
                    value={districtName}
                    onChange={(e) => {
                      setDistrictNname(e.target.value);
                      setShowDistrictDropdown(true);
                    }}
                    onFocus={() => setShowDistrictDropdown(true)}
                    // disabled={!selectedProvince}
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
                    // disabled={!selectedDistrict}
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
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            className="bg-[#338BFF] text-white px-4 py-2 rounded-lg text-[15px]"
          >
            Lưu chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
}