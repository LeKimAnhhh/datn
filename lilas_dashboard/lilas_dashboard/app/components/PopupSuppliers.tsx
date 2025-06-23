import React, { useEffect, useState, useRef } from "react";
import { Supplier } from "@/app/lib/definitions";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { fetchSuppliersData } from "@/app/lib/data";
import PopupCreateSupplier from "@/app/ui/supplier/create-form"; 

interface PopupSuppliersProps {
  suppliers: Supplier[];
  onSelectSupplier: (supplier: Supplier) => void;
  onClose: () => void;
}

const PopupSuppliers: React.FC<PopupSuppliersProps> = ({ 
  suppliers,
  onSelectSupplier,
  onClose
}) => {
  // const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  const [isCreateSupplierOpen, setIsCreateSupplierOpen] = useState(false); 
  const popupRef = useRef<HTMLDivElement>(null);

  // const fetchSuppliers = async () => {
  //   const token = localStorage.getItem("access_token") || "";
  //   try {
  //     const { suppliers: supplierList } = await fetchSuppliersData(token, 50, 0);
  //     setSuppliers(supplierList);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchSuppliers();
  // }, []);

  const handleSelect = (supplier: Supplier) => {
    onSelectSupplier(supplier);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      className="absolute w-full mt-2 max-h-[502px] bg-white border border-[#5C555E5C] rounded-[12px] shadow-[0_2px_0_#D9D9D9] overflow-y-auto z-20 text-[17px] text-[#100713]"
    >
      <div className="p-3">
        <button 
            className="w-full bg-[#338bff] text-white text-[15px] px-5 py-2 rounded-md hover:bg-[#66b2ff] flex justify-between"
            onClick={() => setIsCreateSupplierOpen(true)}
        >
          Tạo nhà cung cấp mới
          <AddOutlinedIcon fontSize="small" />
        </button>
      </div>
        {suppliers.length === 0 && (
          <div className="p-2 text-center text-gray-500">Không tìm thấy NCC</div>
        )}

        {suppliers.map((sup) => (
          <div
            key={sup.id}
            className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer border-b"
            onClick={() => handleSelect(sup)}
          >
            <div>{sup.contact_name}</div>
            <div>{sup.phone || "-"}</div>
          </div>
        ))}
        {isCreateSupplierOpen && (
            <PopupCreateSupplier
            isOpen={isCreateSupplierOpen}
            onClose={() => setIsCreateSupplierOpen(false)}
            onCreated={(newSup) => {
                onSelectSupplier(newSup); 
                setIsCreateSupplierOpen(false); 
            }}
            disableReload={true}
            />
        )}
    </div>
  );
};

export default PopupSuppliers;
