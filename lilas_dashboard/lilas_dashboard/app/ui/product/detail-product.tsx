"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ProductResponse } from "@/app/lib/definitions";
import { cn, getApiUrl } from "@/app/lib/utils";
import { CloseOutlined, CheckCircleOutlined, ReportGmailerrorred } from "@mui/icons-material";
import StatusBadge from "@/app/ui/status";
import { deactivateProduct } from "@/app/lib/data";
import { Box, LinearProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import EditStock from '@/app/components/editStock';

interface DetailProductProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductResponse;
  userRole?: string;
}

export default function DetailProductPopup({
  isOpen,
  onClose,
  product,
  userRole,
}: DetailProductProps) {
  console.log("🚀 ~ product:", product);
  // console.log("🚀 ~ userRole:", userRole);
  const router = useRouter();
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);
  const [dryStock, setDryStock] = useState(product.dry_stock);
  const [showEditStock, setShowEditStock] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      console.log("Chi tiết sản phẩm:", product);
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleDeactivate = async (productId: string) => {
    try {
      const token = localStorage.getItem("access_token") || "";
      const response = await deactivateProduct(token, productId);
      if (response.success) {
        setMessage(`Ngừng giao dịch sản phẩm thành công!`);
        setMessageType("success");
        setTimeout(() => {
          setMessage("");
        }, 5000);
        setDryStock(false);
      }
    } catch (error: any) {
      setMessage(`Lỗi: ${error.message}`);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      // alert(error.message);
    }
  };

  const handleEdit = () => {
    setLoading(true);
    window.location.href = `/tong-quan/san-pham/${product.id}/edit`;
  };

  const handleOpenImagePreview = (idx: number) => {
    setActiveImageIndex(idx);
    setShowImagePreview(true);
  };

  const handleCloseImagePreview = () => {
    setShowImagePreview(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* Loading overlay hiển thị khi click "Sửa sản phẩm" */}
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

      <div
        className="relative bg-[#F2F2F7] rounded-2xl shadow-xl p-6 w-full xl:w-[60vw] max-h-full 3xl:max-h-[95vh] overflow-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0">
          <button
            className="absolute right-0 top-0 text-gray-600"
            onClick={onClose}
          >
            <CloseOutlined />
          </button>
        </div>
        <div className="flex items-center mb-2 3xl:mb-4 gap-2 pr-8">
          <h2 className="text-xl 3xl:text-2xl font-semibold line-clamp-1">
            {product.name}
          </h2>
          <div className="shrink-0">
            <StatusBadge
              type="product_status"
              value="product_status"
              dry_stock={dryStock}
            />
          </div>
        </div>

        <div className="flex flex-col mb-4 border border-gray-200 rounded-2xl shadow-[0_2px_0_#D9D9D9] bg-white">
          <h2 className="px-4 pt-3 pb-0 font-semibold mb-2 text-[15px] 3xl:text-[17px]">
            Tồn kho
          </h2>
          <div className="flex-1 mb-4 px-4">
            <table className="w-full text-left">
              <thead className="h-8 3xl:h-11 bg-[#f7f7f8]">
                <tr className="border-b text-[#3C3C43B2] text-[13px] 3xl:text-[15px] border-[#4F49502E]">
                  <th className="w-1/5 px-4 py-2 border-r border-[#4F49502E]">Chi nhánh</th>
                  <th className="w-1/5 px-4 py-2 border-r border-[#4F49502E]">Tồn kho</th>
                  <th className="w-1/5 px-4 py-2 border-r border-[#4F49502E]">Có thể bán</th>
                  <th className="w-1/5 px-4 py-2 border-r border-[#4F49502E]">Hàng đang về</th>
                  <th className="w-1/5 px-4 py-2">Hàng đang giao</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-100 border-b cursor-pointer text-[13px] 3xl:text-[15px">
                  <td className="px-4 py-2">Terra</td>
                  <td className="px-4 py-2">{product.terra_stock || 0}</td>
                  <td className="px-4 py-2">{product.terra_can_sell || 0}</td>
                  <td
                    className={cn(
                      "px-4 py-2",
                      !!product.pending_arrival_terra && "hover:bg-gray-300"
                    )}
                  >
                    {/* {product.pending_arrival_terra || 0} */}
                    {product.pending_arrival_terra > 0 ? (
                      <button
                        className="w-full h-full text-start"
                        onClick={() => {
                          console.log("🚀 ~ product.id:", product.id);
                          router.push(
                            `/tong-quan/phieu-nhap?query=${product.id}`
                          );
                        }}
                      >
                        {product.pending_arrival_terra}
                      </button>
                    ) : (
                      0
                    )}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2",
                      !!product.out_for_delivery_terra && "hover:bg-gray-300"
                    )}
                  >
                    {/* {product.out_for_delivery_terra || 0} */}
                    {product.out_for_delivery_terra > 0 ? (
                      <button
                        className="w-full h-full text-start"
                        onClick={() => {
                          console.log("🚀 ~ product.id:", product.id);
                          router.push(
                            `/tong-quan/van-chuyen?query=${product.id}`
                          );
                        }}
                      >
                        {product.out_for_delivery_terra}
                      </button>
                    ) : (
                      0
                    )}
                  </td>
                </tr>
                <tr className="hover:bg-gray-100 cursor-pointer text-[13px] 3xl:text-[15px">
                  <td className="px-4 py-2">Thợ Nhuộm</td>
                  <td className="px-4 py-2">{product.thonhuom_stock || 0}</td>
                  <td className="px-4 py-2">{product.thonhuom_can_sell || 0}</td>
                  <td
                    className={cn(
                      "px-4 py-2",
                      !!product.pending_arrival_thonhuom && "hover:bg-gray-300"
                    )}
                  >
                    {/* {product.pending_arrival_thonhuom || 0} */}
                    {product.pending_arrival_thonhuom > 0 ? (
                      <button
                        className="w-full h-full text-start"
                        onClick={() => {
                          console.log("🚀 ~ product.id:", product.id);
                          router.push(
                            `/tong-quan/phieu-nhap?query=${product.id}`
                          );
                        }}
                      >
                        {product.pending_arrival_thonhuom}
                      </button>
                    ) : (
                      0
                    )}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2",
                      !!product.out_for_delivery_thonhuom && "hover:bg-gray-300"
                    )}
                  >
                    {/* {product.out_for_delivery_thonhuom || 0} */}
                    {product.out_for_delivery_thonhuom > 0 ? (
                      <button
                        className="w-full h-full text-start"
                        onClick={() => {
                          console.log("🚀 ~ product.id:", product.id);
                          router.push(
                            `/tong-quan/van-chuyen?query=${product.id}`
                          );
                        }}
                      >
                        {product.out_for_delivery_thonhuom}
                      </button>
                    ) : (
                      0
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-2 3xl:gap-4 mb-4 border border-gray-200 rounded-2xl p-4 shadow-[0_2px_0_#D9D9D9] bg-white">
          <h2 className="font-semibold text-[15px] 3xl:text-[17px]">
            Thông tin sản phẩm
          </h2>

          <div className="flex gap-10">
            {product.images?.slice(0, 5).map((img, idx) => (
              <div
                key={idx}
                className="relative border border-gray-200 rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => handleOpenImagePreview(idx)}
              >
                <Image
                  src={getApiUrl(img.url.slice(1))}
                  alt=""
                  width={160}
                  height={160}
                  className="object-cover size-28 3xl:size-40"
                  //unoptimized
                />
                {idx === 4 && product.images.length > 5 && (
                  <div className="absolute inset-0 bg-[#399CFFCC]/80 bg-opacity-80 flex items-center justify-center text-white text-3xl font-semibold">
                    +{product.images.length - 5}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4 3xl:gap-6 text-[#3C3C43B2] font-semibold text-[13px] 3xl:text-[15px]">
            <div className="border border-gray-200 rounded-xl p-2 3xl:p-4">
              <div className="flex justify-between py-1 3xl:py-[7px] border-b">
                <p>Mã sản phẩm</p>
                <p className="text-black">{product.id}</p>
              </div>
              <div className="flex justify-between py-1 3xl:py-[7px] border-b">
                <p>Mã barcode</p>
                <p className="text-black">{product.barcode || "..."}</p>
              </div>
              <div className="flex justify-between py-1 3xl:py-[7px] border-b">
                <p>Khối lượng</p>
                <p className="text-black">{product.weight || 0}g</p>
              </div>
              <div className="flex justify-between py-1 3xl:py-[7px] border-b">
                <p>Loại sản phẩm</p>
                <p className="text-black">{product.group_name || "..."}</p>
              </div>
              <div className="flex justify-between py-1 3xl:py-[7px]">
                <p>Nhãn hiệu</p>
                <p className="text-black">{product.brand || "..."}</p>
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl p-1.5 3xl:p-4">
              <div className="flex justify-between py-1 3xl:py-[7px]   border-b">
                <p>Giá bán lẻ</p>
                <p className="text-black">
                  {product.price_retail.toLocaleString()}
                </p>
              </div>
              {userRole === "1" && (
                <div className="flex justify-between py-1 3xl:py-[7px]   border-b">
                  <p>Giá nhập</p>
                  <p className="text-red-500">
                    {product.price_import.toLocaleString()}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between py-1 3xl:py-[7px]   border-b">
                <p>Giá buôn</p>
                <p className="text-black">
                  {product.price_wholesale.toLocaleString()}
                </p>
              </div>

              <div className="flex justify-between py-1 3xl:py-[7px]   border-b">
                <p>Hạn sử dụng</p>
                <p className="text-black">
                  {product.expiration_date
                    ? new Date(product.expiration_date).toLocaleDateString(
                        "vi-VN"
                      )
                    : "..."}
                </p>
              </div>
              <div className="flex justify-between py-1 3xl:py-[7px]  ">
                <p>Ngày tạo</p>
                <p className="text-black">
                  {new Date(product.created_at).toLocaleDateString("vi-VN") ||
                    "..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center justify-end">
          {userRole === '0' && (
            <button
              onClick={() => setShowEditStock(true)}
              className="text-[13px] 3xl:text-[15px] border border-black text-black px-4 py-1 rounded-lg h-8 3xl:h-10"
            >
              Sửa kho
            </button>
          )}
          <button
            onClick={() => handleDeactivate(product.id)}
            disabled={product.dry_stock === false}
            className={`text-[13px] 3xl:text-[15px] px-4 py-1 rounded-lg border h-8 3xl:h-10 ${
              product.dry_stock === false
                ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                : "bg-[#E50000] hover:bg-[#f75c5c] text-white"
            }`}
          >
            Ngừng giao dịch
          </button>

          <button
            onClick={handleEdit}
            className="text-[13px] 3xl:text-[15px] bg-[#338BFF] hover:bg-[#66B2FF] text-white px-4 py-1 rounded-lg h-8 3xl:h-10"
          >
            Sửa sản phẩm
          </button>
        </div>
      </div>

      {showImagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={handleCloseImagePreview}
        >
          <div
            className="relative flex flex-col items-center max-h-[95vh] 3xl:max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-0 right-0 mt-4 mr-4 hover:scale-105 z-10"
              onClick={handleCloseImagePreview}
            >
              <CloseOutlined />
            </button>

            <div className="w-[1076px] h-[500px] 3xl:h-[660px] flex items-center justify-center bg-white rounded-lg overflow-hidden">
              <Image
                src={getApiUrl(
                  product.images[activeImageIndex].url.slice(1) || ""
                )}
                alt=""
                width={1076}
                height={660}
                className="object-contain w-[1076px] h-[660px]"
                //unoptimized
              />
            </div>

            <div className="flex gap-[44px] overflow-x-auto py-1.5 3xl:py-4">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className="cursor-pointer flex-shrink-0 border-2 border-transparent hover:border-purple-500 rounded-lg"
                  onClick={() => setActiveImageIndex(i)}
                >
                  <Image
                    src={getApiUrl(img.url.slice(1))}
                    alt=""
                    width={180}
                    height={180}
                    className="object-cover size-32 3xl:size-[180px] rounded-md"
                    //unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <EditStock
        isOpen={showEditStock}
        onClose={() => setShowEditStock(false)}
        productName={product.name}
        productId={product.id}
        initialValues={{
          terra_stock: product.terra_stock || 0,
          terra_can_sell: product.terra_can_sell || 0,
          thonhuom_stock: product.thonhuom_stock || 0,
          thonhuom_can_sell: product.thonhuom_can_sell || 0,
        }}
      />
    </div>
  );
}
