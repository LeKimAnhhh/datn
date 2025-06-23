"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from 'next/image';
import { CloseOutlined, Check, ReportGmailerrorred } from "@mui/icons-material";
import { ProductResponse } from '@/app/lib/definitions';
import { updateProduct, activateProduct, deactivateProduct } from "@/app/lib/data";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ProductGroup from "@/app/components/ProductGroup";
import TextEditor from "@/app/components/des";
import dayjs from 'dayjs';
import { useDropzone } from "react-dropzone";
import { cn } from '@/app/lib/utils';
import { ErrorMessage } from './create-form';

const SunEditorWrapper = dynamic(() => import("@/app/components/SunEditorWrapper"), {
  ssr: false,
});

// Kiểu cho form
interface FormValues {
  name: string;
  product_code: string;
  barcode: string;
  category: string;
  weight: string;
  brand: string;
  expiration_date: string;
  description: string;
  price_retail: string;
  price_wholesale: string;
  price_import: string;
  image_url: string;
  allow_sale: boolean;
  stop_sale: boolean;
}

// Kiểu cho ảnh
interface SelectedImage {
  file: File | null;
  previewURL: string;
  id?: number;
}

interface EditProductFormProps {
  initialData?: ProductResponse; // undefined => chế độ "tạo mới"
}

export default function EditProductForm({ initialData }: EditProductFormProps) {
  const [values, setValues] = useState<FormValues>({
    name: initialData?.name ?? '',
    product_code: initialData ? String(initialData.id) : '',
    barcode: initialData?.barcode ?? '',
    category: initialData?.group_name ?? '',
    weight: initialData?.weight ? String(initialData.weight) : '',
    brand: initialData?.brand ?? '',
    expiration_date: initialData?.expiration_date ?? '',
    description: initialData?.description ?? '',
    price_retail: initialData ? initialData.price_retail.toLocaleString("en-ES") : '',
    price_wholesale: initialData ? initialData.price_wholesale.toLocaleString("en-ES") : '',
    price_import: initialData ? initialData.price_import.toLocaleString("en-ES") : '',
    image_url: '',
    allow_sale: initialData?.dry_stock === true, // Nếu dry_stock = 1 => Cho phép bán
    stop_sale: initialData?.dry_stock === false, // Nếu dry_stock = 0 => Ngừng bán
  });
  console.log('Initial Data:', initialData);

  // Quản lý list ảnh
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_DEV_API || "";
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Nếu có initialData.images => push vào selectedImages (chỉ preview)
  useEffect(() => {
    if (initialData?.images?.length) {
      const arr = initialData.images.map((imgObj) => ({
        file: null,
        previewURL: `${apiBaseUrl}${imgObj.url}`,
        id: imgObj.id,
      }));
      setSelectedImages(arr);
    }
  }, [initialData, apiBaseUrl]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (value.length > 500) return; //giới hạn ký tự là 500 cho handleChange
    if (["price_retail", "price_wholesale", "price_import"].includes(name)) {
      const numericValue = value.replace(/\D/g, "");
      const formattedValue = numericValue ? Number(numericValue).toLocaleString("en-ES") : "";
      setValues((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
    // setValues((prev) => ({ ...prev, [name]: value }));
  };

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : "";
  const handleCategoryChange = (value: string) => {
    setValues((prev) => ({
      ...prev,
      category: value,
    }));
  };

  //description 
  const handleDescriptionChange = (content: string) => {
    setValues((prev) => ({ ...prev, description: content }));
  };

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (files: FileList | File[]) => {
    setImageError(null);
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5MB
  
    const newSelectedImages: SelectedImage[] = [];
    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        setImageError("Định dạng ảnh không hợp lệ. Chỉ chấp nhận jpg, png, jpeg.");
        continue;
      }
      if (file.size > maxSize) {
        setImageError("Kích thước ảnh vượt quá 5MB.");
        continue;
      }
      const previewURL = URL.createObjectURL(file);
      newSelectedImages.push({ file, previewURL });
    }
    if (newSelectedImages.length > 0) {
      setSelectedImages((prev) => [...prev, ...newSelectedImages]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleFileUpload(e.target.files);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => {
      const newArr = [...prev];
      const removed = newArr.splice(index, 1)[0];
      // ảnh cũ, đưa ID vào removedImageIds
      if (removed.id) {
        setRemovedImageIds((prevIds) => [...prevIds, removed.id!]);
      }
      return newArr;
    });
  };

  const handleRemoveALlImages = () => {
    setSelectedImages([]);
    if (selectedImages.length > 0) {
      const oldImageIds = selectedImages
        .filter((img) => img.id)
        .map((img) => img.id as number);
  
      setRemovedImageIds((prev) => [...prev, ...oldImageIds]);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
  
    if (!values.name.trim()) {
      newErrors.name = "Vui lòng nhập tên sản phẩm";
    }
    if (!values.price_retail.trim()) {
      newErrors.price_retail = "Vui lòng nhập giá bán lẻ";
    } else if (+values.price_retail.replace(/\./g, "") <= 0) {
      newErrors.price_retail = "Giá bán lẻ phải lớn hơn 0";
    }
    if (!values.price_wholesale.trim()) {
      newErrors.price_wholesale = "Vui lòng nhập giá bán buôn";
    } else if (+values.price_wholesale.replace(/\./g, "") <= 0) {
      newErrors.price_wholesale = "Giá bán buôn phải lớn hơn 0";
    }
    if (!values.price_import.trim()) {
      newErrors.price_import = "Vui lòng nhập giá nhập";
    } else if (+values.price_import.replace(/\./g, "") <= 0) {
      newErrors.price_import = "Giá nhập phải lớn hơn 0";
    }
  
    if (selectedImages.length === 0) {
      setImageError("Vui lòng tải lên ít nhất một ảnh sản phẩm.");
    } else {
      setImageError(null);
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && selectedImages.length > 0;
  };
  

  // Xác định mode (edit / create)
  const isEditing = !!initialData?.id;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
  
    const token = localStorage.getItem("access_token") || "";
    const productUpdatePayload = {
      name: values.name.trim(),
      brand: values.brand.trim(),
      barcode: values.barcode.trim(),
      group_name: values.category.trim(),
      weight: Number(values.weight),
      expiration_date: values.expiration_date || null,
      description: values.description || null,
      price_retail: Number(values.price_retail.replace(/,/g, "")),
      price_wholesale: Number(values.price_wholesale.replace(/,/g, "")),
      price_import: Number(values.price_import.replace(/,/g, "")),
      dry_stock: values.allow_sale ? true : false,
    };
  
    console.log('Payload:', productUpdatePayload);
  
    try {
      const formData = new FormData();
      formData.append("product_data", JSON.stringify(productUpdatePayload));
  
      if (removedImageIds.length > 0) {
        formData.append("removed_image_ids", JSON.stringify(removedImageIds));
      }
      selectedImages.forEach((img) => {
        if (img.file) {
          formData.append("images", img.file, img.file.name);
        }
      });
  
      await updateProduct(token, String(initialData?.id), formData);
      setMessage(`Cập nhật sản phẩm thành công!`);
      setMessageType("success");
      window.location.reload();
    } catch (err: any) {
      setMessage(`${err.message}`);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }
  };

  // const handleStatusChange = (status: "allow_sale" | "stop_sale") => {
  //   setValues((prev) => ({
  //     ...prev,
  //     allow_sale: status === "allow_sale",
  //     stop_sale: status === "stop_sale",
  //   }));
  // };

  const handleStatusChange = async (status: "allow_sale" | "stop_sale") => {
    if (!initialData?.id) return;
    const token = localStorage.getItem("access_token") || "";
    try {
      if (status === "allow_sale") {
        await activateProduct(token, initialData.id);
        setValues((prev) => ({
          ...prev,
          allow_sale: true,
          stop_sale: false,
        }));
      } else if (status === "stop_sale") {
        await deactivateProduct(token, initialData.id);
        setValues((prev) => ({
          ...prev,
          allow_sale: false,
          stop_sale: true,
        }));
      }
    } catch (error: any) {
      setMessage(error.message || "Không thể cập nhật trạng thái sản phẩm.");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      // alert(error.message || "Không thể cập nhật trạng thái sản phẩm.");
    }
  };

  const handleDrop = (acceptedFiles: File[]) => {
    handleFileUpload(acceptedFiles);
  };
    
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop: handleDrop,
    onDropRejected: () => setImageError("Kích thước ảnh vượt quá 5MB."),
    accept: { "image/*": [".jpeg", ".png", ".jpg"] },
    maxSize: 5 * 1024 * 1024,
    multiple: true,
    noClick: true,
  });

  return (
    <>
      {message && (
        <div
          className={`absolute top-0 right-0 w-full h-[36px] flex items-center justify-center text-white ${messageType === 'success' ? 'bg-[#3AA207]' : 'bg-[#D37E09]'
            }`}
        >
          {messageType === 'success' ? (
            <Check className="mr-2" />
          ) : (
            <ReportGmailerrorred className="mr-2" />
          )}
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-6">
        {/* LEFT COLUMN */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-6">
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
          </h2>

          {/* name */}
          <div className="mb-6">
            <label className="text-base font-semibold">
              Tên sản phẩm
            </label>
            <input
              name="name"
              value={values.name}
              onChange={handleChange}
              placeholder='Nước hoa AAA'
              className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 placeholder:text-[#3C3C4380] text-black"
            />
            {errors.name && 
              // <p className="text-red-500 text-sm">{errors.name}</p>
              <ErrorMessage message={errors.name} />
            }
          </div>

          {/* product_code (id) */}
          <div className="mb-6">
            <label className="text-base font-semibold">
              Mã sản phẩm
            </label>
            <input
              name="product_code"
              value={values.product_code}
              onChange={handleChange}
              disabled={isEditing}
              className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 bg-gray-200"
            />
          </div>

          {/* barcode */}
          <div className="mb-6">
            <label className="text-base font-semibold">Barcode</label>
            <input
              name="barcode"
              value={values.barcode}
              onChange={handleChange}
              placeholder="893603428001"
              className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 placeholder:text-[#3C3C4380] text-black"
            />
          </div>

          {/* category => group_name */}
          <div className="mb-6">
            <label className="text-base font-semibold">Loại sản phẩm</label>
            <ProductGroup
              token={token}
              value={values.category}
              onChange={handleCategoryChange}
            />
          </div>

          {/* weight */}
          <div className="mb-6">
            <label className="text-base font-semibold">Khối lượng</label>
            <input
              name="weight"
              value={values.weight}
              onChange={handleChange}
              className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 placeholder:text-[#3C3C4380] text-black"
              placeholder="10"
            />
          </div>

          {/* brand */}
          <div className="mb-6">
            <label className="text-base font-semibold">Nhãn hiệu</label>
            <input
              name="brand"
              value={values.brand}
              onChange={handleChange}
              className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 placeholder:text-[#3C3C4380] text-black"
              placeholder="Gucci"
            />
          </div>

          {/* expiration_date */}
          <div className="mb-6">
            <label className="text-base font-semibold">Hạn sử dụng</label>
            <div className="relative">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={values.expiration_date ? dayjs(values.expiration_date) : null}
                  onChange={(newValue) => {
                    setValues((prev) => ({
                      ...prev,
                      expiration_date: newValue ? newValue.format("YYYY-MM-DD") : "",
                    }));
                  }}
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
            {/* <input
            type="date"
            name="expiration_date"
            value={values.expiration_date}
            onChange={handleChange}
            className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 text-black"
          /> */}
          </div>

          {/* status */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <label className="text-base font-semibold">Trạng thái</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="allow_sale"
                  checked={values.allow_sale}
                  onChange={() => handleStatusChange("allow_sale")}
                  className="h-5 w-5 rounded bg-white border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0 checked:bg-[#338BFF] checked:hover:bg-[#338BFF] checked:focus:bg-[#338BFF]"
                />
                Cho phép giao dịch
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="stop_sale"
                  checked={values.stop_sale}
                  onChange={() => handleStatusChange("stop_sale")}
                  className="h-5 w-5 rounded bg-white border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0 checked:bg-[#338BFF] checked:hover:bg-[#338BFF] checked:focus:bg-[#338BFF]"
                />
                Ngừng giao dịch
              </label>
            </div>
          </div>

          {/* description */}
          <div className="mb-4">
            <label className="text-base font-semibold">Mô tả sản phẩm</label>
            {/* <div className="mt-2">
              <SunEditorWrapper
                value={values.description}
                onChange={handleDescriptionChange}
                height="auto"
                buttonList={[
                  ["undo", "redo"],
                  ["bold", "italic", "underline", "strike"],
                  ["fontColor", "hiliteColor"],
                  ["align", "list", "table"],
                  ["link", "image", "video"],
                  ["removeFormat"],
                ]}
                setOptions={{
                  minHeight: "300px",
                  resizingBar: false,
                }}
              />
            </div> */}
            <TextEditor value={values.description} onChange={handleDescriptionChange} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-[40%] flex flex-col gap-4">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-[17px] font-bold mb-6">Giá sản phẩm</h2>

            {/* price_retail */}
            <div className="mb-4">
              <label>Giá bán lẻ</label>
              <input
                name="price_retail"
                value={values.price_retail}
                onChange={handleChange}
                // onBlur={handleBlur}
                maxLength={15}
                placeholder="0.000"
                className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 text-black"
              />
              {errors.price_retail && 
                // <p className="text-red-500 text-sm">{errors.price_retail}</p>
                <ErrorMessage message={errors.price_retail} />
              }
            </div>

            {/* price_wholesale */}
            <div className="mb-4">
              <label>Giá bán buôn</label>
              <input
                name="price_wholesale"
                value={values.price_wholesale}
                onChange={handleChange}
                // onBlur={handleBlur}
                maxLength={15}
                placeholder="0.000"
                className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 text-black"
              />
              {errors.price_wholesale && 
                // <p className="text-red-500 text-sm">{errors.price_wholesale}</p>
                <ErrorMessage message={errors.price_wholesale} />
              }
            </div>

            {/* price_import */}
            <div className="mb-4">
              <label>Giá nhập</label>
              <input
                name="price_import"
                value={values.price_import}
                onChange={handleChange}
                // onBlur={handleBlur}
                maxLength={15}
                placeholder="0.000"
                className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 text-black"
              />
              {errors.price_import && 
                //<p className="text-red-500 text-sm">{errors.price_import}</p>
                <ErrorMessage message={errors.price_import} />
              }
            </div>
          </div>


          {/* Upload ảnh */}
          <div className={`bg-white p-6 rounded-xl shadow ${imageError ? "border border-red-500" : ""}`}>
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold">Ảnh sản phẩm</h2>
              <button
                type="button"
                onClick={handleRemoveALlImages}
                className="text-[#E50000]"
              >
                Xóa tất cả
              </button>
            </div>

            {/* Drag-and-Drop Zone */}
            <div
              {...getRootProps()}
              className={cn(
                `border-dashed border-2 rounded flex flex-wrap gap-4 p-2`,
                imageError ? "border-red-500" : "border-gray-300",
                selectedImages.length > 0 ? "justify-start" : "justify-center"
              )}
              style={{ minHeight: "180px", cursor: "pointer" }}
              onClick={(e) => {
                if (selectedImages.length === 0) {
                  open();
                }
              }}
            >
              <input {...getInputProps()} onChange={handleFileChange} />

              {selectedImages.length > 0 ? (
                <>
                  {selectedImages.map((img, index) => (
                    <div key={index} className="relative flex-shrink-0 group">
                      <Image
                        src={img.previewURL}
                        alt="preview"
                        width={62}
                        height={62}
                        className="w-[62px] h-[62px] object-cover rounded-lg border border-gray-300"
                        //unoptimized
                      />

                      {/* Hover effect for remove button restored */}
                      <div className="absolute inset-0 w-[62px] h-[62px] rounded-lg bg-[#5c555e] bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                        className="absolute top-0.5 right-0.5 bg-[#E50000] w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <CloseOutlined style={{ color: "white", fontSize: 12 }} />
                      </button>
                    </div>
                  ))}

                  {/* "+" Button to Add More Images */}
                  <div
                    className="w-[62px] h-[62px] bg-gray-100 border border-dashed border-gray-400 flex items-center justify-center rounded-lg cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      open();
                    }}
                  >
                    <span className="text-gray-500 text-2xl font-bold">+</span>
                  </div>
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    open();
                  }}
                >
                  <button
                    type="button"
                    className="bg-[#338BFF26] text-[#338BFF] px-4 py-2 rounded hover:bg-[#66B2FF]"
                  >
                    + Tải ảnh lên
                  </button>
                  <p className="text-center text-gray-500 mt-2 text-sm">
                    Kéo thả hoặc tải ảnh từ thiết bị
                  </p>
                </div>
              )}
            </div>

            {imageError && 
              //<p className="text-red-500 text-sm mt-1">{imageError}</p>
              <ErrorMessage message={imageError} />
            }
          </div>

          {/* Nút Submit */}
          <div>
            <button
              type="submit"
              className="bg-[#338BFF] text-white py-2 px-4 rounded-lg hover:bg-[#66B2FF] w-full"
            >
              {isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}