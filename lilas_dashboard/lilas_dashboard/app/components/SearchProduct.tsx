import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { SearchOutlined } from "@mui/icons-material";
import PopupProductList from "@/app/components/PopupProductList";
import { Product } from "@/app/lib/definitions";

interface SearchProductProps {
  onSelectProduct: (product: Product) => void;
}

export interface SearchProductHandle {
  focus: () => void;
}

const SearchProduct = forwardRef<SearchProductHandle, SearchProductProps>(
  ({ onSelectProduct }, ref) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Expose the focus method to parent components
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      }
    }));

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setIsPopupVisible(true);
    };

    const closePopup = () => {
      setIsPopupVisible(false);
    };

    const handleProductClick = (product: Product) => {
      onSelectProduct(product);
      closePopup();
    };

    return (
      <div className="relative w-full flex flex-col gap-2">
        <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black font-bold" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          maxLength={500}
          onBlur={() => {
            setTimeout(closePopup, 0);
          }}
          placeholder="Tìm theo tên sản phẩm, mã sản phẩm hoặc quét mã barcode"
          className="w-full px-4 pl-[40px] py-2 bg-[#e9ecf2] border-0 rounded-lg focus:outline-none focus:border-purple-500 text-[14px] 2xl:text-[17px] text-[#3c3c43b2] text-opacity-70 font-normal ml-1"
          onFocus={() => {
            setIsPopupVisible(true);
            setIsFocused(true);
          }}
        />
        {isPopupVisible && (
          <PopupProductList
            searchQuery={searchQuery}
            onSelectProduct={handleProductClick}
            isFocused={isFocused}
          />
        )}
      </div>
    );
  }
);

SearchProduct.displayName = "SearchProduct";

export default SearchProduct;

