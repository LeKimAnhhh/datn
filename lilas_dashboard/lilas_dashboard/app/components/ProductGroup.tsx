"use client";

import React, {
    useState,
    useRef,
    useEffect,
    ChangeEvent,
    FocusEvent,
} from "react";
import { fetchProductGroups } from "@/app/lib/data";
import { ProductGroupResponse } from "@/app/lib/definitions";

interface ProductGroupSelectorProps {
    token: string; 
    value: string; 
    onChange: (value: string) => void; 
}

export default function ProductGroupSelector({
    token,
    value,
    onChange,
}: ProductGroupSelectorProps) {
    const [search, setSearch] = useState(value);
    const [groups, setGroups] = useState<ProductGroupResponse[]>([]);
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState(value); 

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setSearch(value);
    }, [value]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setIsLoading(true);
                const res = await fetchProductGroups(token, 0, 50, debouncedSearch);
                setGroups(res.groups);
            } catch (err) {
                console.error("fetch product groups error:", err);
                setGroups([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGroups();
    }, [debouncedSearch, token]); 

    // debounce
    useEffect(() => {
        const handler = setTimeout(() => {
        setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    // focus vào input => hiện popup
    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
        setShowPopup(true);
        if (groups.length === 0) {
        setDebouncedSearch(search);
        }
    };

    // search
    const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearch(newValue);
        onChange(newValue);
        setShowPopup(true);
        // fetchGroups(newValue);
    };

    // set gr vào input
    const handleSelectGroup = (group: ProductGroupResponse) => {
        setSearch(group.name);
        onChange(group.name);
        setShowPopup(false);
    };

    useEffect(() => {
        const handleClickOutside = (e: Event) => {
        if (
            containerRef.current &&
            !containerRef.current.contains(e.target as Node)
        ) {
            setShowPopup(false);
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside); // mobile
    
        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);
    

  return (
    <div className="relative" ref={containerRef}>
      <input
        ref={inputRef}
        name="category"
        value={search}
        onChange={handleSearch}
        onFocus={handleFocus}
        maxLength={200}
        autoComplete="off" 
        className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 placeholder:text-[#3C3C4380] text-black"
        placeholder="Nhập hoặc chọn loại sản phẩm..."
      />

      {showPopup && (
        <div
          className="absolute left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-[0_2px_0_#D9D9D9] max-h-[334px] overflow-auto z-50 px-2 py-4"
          style={{
            width: inputRef.current
              ? inputRef.current.offsetWidth
              : "100%",
          }}
        >
          {isLoading ? (
            <div className="p-2 text-gray-500 text-sm">Đang tải...</div>
          ) : groups.length === 0 ? (
            <div className="p-2 text-gray-500 text-sm">
              Không tìm thấy loại sản phẩm
            </div>
          ) : (
            groups.map((grp, index) => (
              <div key={grp.name + index} className="border-b last:border-b-0">
                <div                
                  onClick={() => handleSelectGroup(grp)}
                  className="cursor-pointer hover:bg-[#338BFF26] rounded-lg p-4"
                >
                  <div className="text-black">{grp.name}</div>
                  {/* {grp.description && (
                    <div className="text-sm text-gray-500">{grp.description}</div>
                  )} */}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
