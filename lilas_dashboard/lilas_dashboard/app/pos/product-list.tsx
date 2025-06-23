"use client";

import React from "react";
import Image from "next/image";
import { DeleteForeverOutlined } from "@mui/icons-material";
import { InvoiceItem } from '@/app/lib/definitions';
import { getApiUrl } from "@/app/lib/utils";
import { Tooltip } from "react-tooltip";

interface ProductListProps {
  invoiceItems: InvoiceItem[];
  calculateTotal: (item: InvoiceItem) => number;
  handleChangeQuantity: (id: number, value: number) => void;
  handleChangeDiscount: (id: number, value: number) => void;
  handleChangeDiscountType: (id: number, newType: "%" | "VND") => void;
  handleRemoveItem: (id: string) => void;
  handleChangePrice: (id: number, value: number) => void;
  handleChangeServiceName?: (id: number, value: string) => void;
  customer_gr_name?: string;
}

const ProductList: React.FC<ProductListProps> = ({
  invoiceItems,
  calculateTotal,
  handleChangeQuantity,
  handleChangeDiscount,
  handleChangeDiscountType,
  handleRemoveItem,
  handleChangePrice,
  handleChangeServiceName,
  customer_gr_name,
}) => {
  return (
    <div className="flex-1 overflow-auto p-[12px] 2xl:p-[24px]">
      <div className="!rounded-t-[8px] overflow-hidden">
        <table className="w-full border-separate border-spacing-y-0 table-fixed">
          <thead className="sticky top-0 bg-[#5B5B7B]/5">
            <tr className="text-left text-[#6B5A6E] p-[8px] 2xl:p-[16px] 2xl:text-[15px] text-xs">
              <th className="border-b py-2 px-4 text-black font-semibold leading-5 relative">STT<span className="absolute right-0 top-1/2 -translate-y-1/2 h-[20px] w-[1px] bg-gray-300"></span></th>
              <th
                className="border-b w-[9  .91%] py-2 px-4 text-black font-semibold leading-5 relative text-center"
                data-tooltip-id="header-tooltip"
                data-tooltip-content="Ảnh sản phẩm"
              >
                <Tooltip id="header-tooltip" place="top" />
                <p className="line-clamp-1">Ảnh sản phầm</p>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-[20px] w-[1px] bg-gray-300"></span>
              </th>
              <th 
                className="border-b w-[11.37%] py-2 px-4 text-black font-semibold leading-5 relative"
                data-tooltip-id="header-tooltip"
                data-tooltip-content="Mã sản phẩm"
              >
                <p className="line-clamp-1">Mã sản phẩm</p>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-[20px] w-[1px] bg-gray-300"></span>
              </th>
              <th 
                className="border-b w-[28.97%] py-2 px-4 text-black font-semibold leading-5 relative"
                data-tooltip-id="header-tooltip"
                data-tooltip-content="Tên sản phẩm"
              >
                Tên sản phẩm
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-[20px] w-[1px] bg-gray-300"></span>
              </th>
              <th  
                className="border-b w-[9.91%] py-2 px-4 text-black font-semibold leading-5 relative"
                data-tooltip-id="header-tooltip"
                data-tooltip-content="Số lượng"
              >
                <p className="line-clamp-1">Số lượng</p>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-[20px] w-[1px] bg-gray-300"></span>
              </th>
              <th 
                className="border-b w-[9.87%] py-2 px-4 text-black font-semibold leading-5 relative"
                data-tooltip-id="header-tooltip"
                data-tooltip-content="Đơn giá"
              >
                <p className="line-clamp-1">Đơn giá</p>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-[20px] w-[1px] bg-gray-300"></span>
              </th>
              <th 
                className="border-b w-[9.91%] py-2 px-4 text-black font-semibold leading-5 relative"
                data-tooltip-id="header-tooltip"
                data-tooltip-content="Chiết khấu"
              >
                  <p className="line-clamp-1">Chiết khấu</p>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-[20px] w-[1px] bg-gray-300"></span>
              </th>
              <th 
                className="border-b w-[10.93%] py-2 px-4 text-black font-semibold leading-5 relative"
                data-tooltip-id="header-tooltip"
                data-tooltip-content="Thành tiền"
              >
                <p className="line-clamp-1">Thành tiền</p>
              </th>
              <th className="border-b w-[3.79%] text-center" />
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, index) => {
              const total = calculateTotal(item);

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-[#6D597314] cursor-pointer 2xl:text-[15px] text-xs ${
                    index % 2 === 0 ? "bg-[#fff]" : "bg-white"
                  }`}
                >
                  <td className="p-[8px] 2xl:p-[16px] border-b">{index + 1}</td>
                  <td className="px-[8px] 2xl:px-[16px] border-b text-center">
                    <Image
                      src={
                        item.image
                          ? getApiUrl(item.image.slice(1))
                          : "/customers/amy-burns.png"
                      }
                      alt="product"
                      width={48}
                      height={48}
                      className="h-12 w-12 object-cover rounded-lg inline-block"
                      onError={(e) => {
                        e.currentTarget.src = "/customers/amy-burns.png";
                      }}
                    />
                  </td>
                  <td className="text-[#100713] p-[8px] 2xl:p-[16px] border-b">
                    <p className="line-clamp-1 ">{item.id}</p>
                  </td>
                  <td className="p-[8px] 2xl:p-[16px] border-b">
                    {item.isService ? (
                      // item.name || (
                      <input
                        placeholder="Tên dịch vụ"
                        required
                        className="border-[rgba(60, 60, 67, 0.35)] w-full px-2 py-1 focus:outline-none focus:ring-0 bg-transparent focus:bg-white rounded-[8px]"
                        value={item.name}
                        onChange={(e) => {
                          handleChangeServiceName?.(
                            item.id as number,
                            e.target.value
                          );
                        }}
                      />
                    ) : (
                      // )
                      <p
                        className="line-clamp-2 text-ellipsis overflow-hidden lg:w-full md:max-w-[20vw]"
                        // data-tooltip-id="product-tooltip"
                        // data-tooltip-content={`${item.name}`}
                        data-tooltip-id={`product-tooltip-${item.id}`}
                        data-tooltip-content={`${item.name}`}
                      >
                        {item.name}
                      </p>
                    )}
                    {/* <Tooltip id="product-tooltip" place="top" /> */}
                    <Tooltip id={`product-tooltip-${item.id}`} place="top" />
                    {/* {item.isService ? (
                      item.name || (
                        <input
                          placeholder="Tên dịch vụ"
                          required
                          className="border-[rgba(60, 60, 67, 0.35)] w-full px-2 py-1 focus:outline-none focus:ring-0 bg-transparent focus:bg-white rounded-[8px] "
                          onChange={(e) => {
                            handleChangeServiceName?.(
                              item.id as number,
                              e.target.value
                            );
                          }}
                        />
                      )
                    ) : (
                    <><p
                          className="line-clamp-2 text-ellipsis overflow-hidden lg:w-full md:max-w-[20vw]"
                          data-tooltip-id="product-tooltip"
                          data-tooltip-content={`${item.name}`}
                        >
                          {item.name}
                        </p><Tooltip id="product-tooltip" place="top" /></>
                    )} */}
                  </td>
                  <td className="p-[8px] 2xl:p-[16px] border-b">
                    <input
                      type="number"
                      className="h-8 w-full max-w-[104px] border-[rgba(60, 60, 67, 0.35)] w-[70px] px-2 py-1 focus:outline-none focus:ring-0 bg-transparent rounded-[8px]"
                      value={item.quantity === 0 ? "" : item.quantity}
                      placeholder="0"
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        let parsed = parseInt(rawValue, 10);
                        if (Number.isNaN(parsed)) {
                          parsed = 0;
                        }
                        parsed = Math.max(0, Math.min(9999, parsed));
                        handleChangeQuantity(item.id as number, parsed);
                      }}
                    />
                  </td>
                  <td className="p-[8px] 2xl:p-[16px] border-b  text-ellipsis overflow-hidden">
                    {/* <input
                      type="text"
                      className={` w-[160px] mr-2 px-2 py-1 border-0 focus:outline-none focus:ring-0 bg-transparent ${!item.isService ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                      value={item.price.toLocaleString("en-US")}
                      readOnly={!item.isService}
                      onChange={(e) =>
                        item.isService &&
                        handleChangePrice(Number(item.id), +e.target.value)
                      }
                    /> */}
                    {item.isService ? (
                      <input
                        type="text"
                        className="w-full border-[rgba(60, 60, 67, 0.35)] w-[70px] px-2 py-1 focus:outline-none focus:ring-0 bg-transparent rounded-[8px]"
                        value={item.price.toLocaleString("en-US")}
                        //readOnly={!item.isService}
                        onChange={
                          (e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            const numericValue = Number(value);
                            if (
                              numericValue >= 0 &&
                              numericValue <= 9999999999999
                            ) {
                              handleChangePrice(Number(item.id), numericValue);
                            }
                          }
                          // item.isService &&
                          // handleChangePrice(Number(item.id), +e.target.value)
                        }
                      />
                    ) : (
                      <p 
                        className="line-clamp-1 break-all"
                        data-tooltip-id={`price-tooltip-${item.id}`}
                        data-tooltip-content={`${item.price.toLocaleString("en-US")} VND`}
                      >
                        {ItemPrice(item, customer_gr_name).toLocaleString("en-US")}
                      </p>
                    )}
                    <Tooltip id={`price-tooltip-${item.id}`} place="top" />
                  </td>
                  <td className="p-[8px] 2xl:p-[16px] border-b">
                    <div className="flex items-center">
                      {/* <input
                        type="number"
                        className="w-full max-w-[104px] border-[rgba(60, 60, 67, 0.35)] w-[50px] px-2 py-1 rounded-[8px] focus:outline-none focus:ring-0 bg-transparent"
                        value={item.discount === 0 ? "" : item.discount}
                        placeholder="0"
                        onChange={(e) => {
                          let parsed = parseFloat(e.target.value);
                          if (Number.isNaN(parsed)) {
                            parsed = 0;
                          }
                          parsed = Math.max(0, Math.min(100, parsed));
                          handleChangeDiscount(item.id as number, parsed);
                        }}
                      />
                      <span className="ml-1">%</span> */}
                      <div className="flex flex-row items-center" 
                        data-tooltip-id={`price-tooltip-${item.id}`}
                        data-tooltip-content={`${item.discount.toLocaleString("en-US")}`}
                      >
                      <input
                        type="text"
                        className="border w-full h-8 rounded-l-md text-center text-[15px] px-1"
                        // disabled={!canEditItems}
                        value={item.discount.toLocaleString("en-ES")}
                        onChange={(e) => {
                          const value = Number(
                            e.target.value.replace(/\D/g, "")
                          );
                          let parsed = Number(value);
                          if (parsed < 0) parsed = 0;

                          const maxValue = item.discount_type === "VND" ? item.price : 100;
                          if (parsed > maxValue) {
                            parsed = maxValue;
                          }
                          
                          handleChangeDiscount(
                            item.id as number,
                            parsed
                          );
                        }}
                      />
                      <button
                        className="bg-gray-500/50 px-1 py-0 rounded-r-md h-8 text-xs"
                        // disabled={!canEditItems}
                        onClick={() => {
                          handleChangeDiscount(item.id as number, 0);
                          handleChangeDiscountType(item.id as number,
                          !item.discount_type ? "VND" :
                            item.discount_type === "%" ? "VND" : "%"
                        );
                        }}
                      >
                        {item.discount_type || "%"}
                      </button>
                      </div>
                    </div>
                  </td>
                  <td
                    className="font-semibold p-[8px] 2xl:p-[16px] border-b text-ellipsis overflow-hidden"
                    data-tooltip-id="product-tooltip"
                    data-tooltip-content={`${total.toLocaleString(
                      "en-US"
                    )} VND`}
                  >
                    {total.toLocaleString("en-US")}

                    <Tooltip id="product-tooltip" place="top" />
                  </td>
                  <td className="text-center border-b">
                    <button
                      onClick={() => handleRemoveItem(String(item.id))}
                      className="text-red-600"
                    >
                      <DeleteForeverOutlined />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export function ItemPrice(item: InvoiceItem, customer_gr_name?: string) {
  if (!!customer_gr_name && customer_gr_name.toLowerCase().includes("khách buôn")) {
    return item.price_wholesale || 0;
  }
  return item.price;
}

export default ProductList;
