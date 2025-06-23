import React, { useEffect, useState, useRef, useCallback } from "react";
import { Customer } from "@/app/lib/definitions";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { fetchCustomersData } from "@/app/lib/data";
import PopupCreateCustomer from "@/app/ui/customer/create-customer";
import NoData from "./NoData";

interface PopupCustomersProps {
  searchQuery?: string;
  onSelectCustomer: (customer: Customer) => void;
  onClose: () => void;
}

const PopupCustomers: React.FC<PopupCustomersProps> = ({ searchQuery, onSelectCustomer, onClose }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const popupRef = useRef<HTMLDivElement>(null);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState<boolean>(false);

  const fetchCustomers = useCallback(async () => {
    const token = localStorage.getItem("access_token") || "";
    try {
      const { customers: customerList } = await fetchCustomersData(token, 50, 1, searchQuery);
      setCustomers(customerList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSelect = (customer: Customer) => {
    onSelectCustomer(customer);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isCreatePopupOpen && popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (!isCreatePopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, isCreatePopupOpen]);

  const handlePopupCloseAll = () => {
    setIsCreatePopupOpen(false);
    onClose();
  };
  
  const handleCreateSuccess = (newCustomer: Customer) => {
    onSelectCustomer(newCustomer);
    setIsCreatePopupOpen(false);
  };

  return (
    <>
    <div
      ref={popupRef}
      className="absolute top-[70%] w-full mt-5 ml-1 max-h-[502px] bg-white border border-[#5C555E5C] rounded-[12px]   overflow-y-auto z-20 text-[17px] text-[#100713]"
    >
      <div className="p-3">
        <button 
          className="w-full bg-[#338BFF] text-white text-[15px] px-5 py-2 rounded-md hover:bg-[#66B2FF] flex justify-between"
          onClick={() => setIsCreatePopupOpen(true)}       
          >
          Tạo khách hàng mới
          <AddOutlinedIcon fontSize="small" />
        </button>
      </div>
      {loading && <div className="p-4 text-center">Đang tải danh sách...</div>}
      {!loading && customers.length === 0 && <NoData message="Không có khách hàng nào" className="py-4" />}
      {!loading &&
        customers.map((customer) => (
          <div
            key={customer.id}
            className="flex justify-between items-center p-3 hover:bg-[#338BFF26] cursor-pointer border-b border-[#5C555E5C]"
            onClick={() => handleSelect(customer)}
          >
            <div>{customer.full_name}</div>
            <div>{customer.phone}</div>
          </div>
        ))}
    </div>

    {isCreatePopupOpen && (
      <PopupCreateCustomer 
        isOpen={isCreatePopupOpen} 
        onClose={handlePopupCloseAll}
        onCreateSuccess={handleCreateSuccess}
      />
    )}
    </>
  );
};

export default PopupCustomers;
