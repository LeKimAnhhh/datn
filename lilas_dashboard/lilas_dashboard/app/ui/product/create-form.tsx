"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { CloseOutlined, ReportGmailerrorred, Check } from "@mui/icons-material";
import { createProduct } from "@/app/lib/data";
import ProductGroup from "@/app/components/ProductGroup";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import TextEditor from "@/app/components/des";
import { useDropzone } from "react-dropzone";
import { ProductResponse } from '@/app/lib/definitions';
import { cn } from "@/app/lib/utils";
// import DetailProductPopup from "@/app/ui/product/detail-product";

const SunEditorWrapper = dynamic(() => import("@/app/components/SunEditorWrapper"), {
  ssr: false,
});

interface FormValues {
  name: string;
  category: string;           // group_name
  price_retail: string;
  price_wholesale: string;
  price_import: string;

  barcode: string;
  brand: string;
  expiration_date: string;
  description: string;
  weight: string;
  allow_sale: boolean;
  stop_sale: boolean;
}

interface SelectedImage {
  file: File;
  previewURL: string;
}

export default function CreateProductForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({
    name: "",
    category: "",
    price_retail: "",
    price_wholesale: "",
    price_import: "",
    barcode: "",
    brand: "",
    expiration_date: "",
    description: "",
    weight: "",
    allow_sale: true,
    stop_sale: false,
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quản lý ảnh
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [productDetail, setProductDetail] = useState<ProductResponse | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : "";
  const handleCategoryChange = (value: string) => {
    setValues((prev) => ({
      ...prev,
      category: value,
    }));
    setErrors((prev) => ({ ...prev, category: null }));
  };

  // thay đổi input 
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  //description 
  const handleDescriptionChange = (content: string) => {
    setValues((prev) => ({ ...prev, description: content }));
    setErrors((prev) => ({ ...prev, description: null }));
  };

  // Validate
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
  
    if (!values.name.trim()) {
      newErrors.name = "Vui lòng nhập tên sản phẩm";
    }
    if (!values.category.trim()) {
      newErrors.category = "Vui lòng nhập loại sản phẩm";
    }
    if (!values.price_retail.trim()) {
      newErrors.price_retail = "Vui lòng nhập giá bán lẻ";
    } else if (+values.price_retail <= 0) {
      newErrors.price_retail = "Giá bán lẻ phải lớn hơn 0";
    }
    if (!values.price_wholesale.trim()) {
      newErrors.price_wholesale = "Vui lòng nhập giá bán buôn";
    } else if (+values.price_wholesale <= 0) {
      newErrors.price_wholesale = "Giá bán buôn phải lớn hơn 0";
    }
    if (!values.price_import.trim()) {
      newErrors.price_import = "Vui lòng nhập giá nhập";
    } else if (+values.price_import <= 0) {
      newErrors.price_import = "Giá nhập phải lớn hơn 0";
    }
  
    // Kiểm tra tối thiểu phải có 1 ảnh sản phẩm
    if (selectedImages.length === 0) {
      setImageError("Vui lòng tải lên ít nhất một ảnh sản phẩm.");
    } else {
      setImageError(null);
    }
  
    setErrors(newErrors);
  
    // Trả về false nếu có lỗi hoặc không có ảnh
    return Object.keys(newErrors).length === 0 && selectedImages.length > 0;
  };

  // Upload file
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
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
      const clone = [...prev];
      clone.splice(index, 1);
      return clone;
    });
  };
  const handleRemoveALlImages = () => {
    setSelectedImages([]);
  }

  // Submit
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!validate()) return;
  //   setIsSubmitting(true);
  
  //   const token = localStorage.getItem("access_token") || "";
  
  //   const queryParams = new URLSearchParams();
  //   queryParams.set("name", values.name.trim());
  //   queryParams.set("group_name", values.category.trim());
  //   queryParams.set("price_retail", values.price_retail.replace(/,/g, ""));
  //   queryParams.set("price_wholesale", values.price_wholesale.replace(/,/g, ""));
  //   queryParams.set("price_import", values.price_import.replace(/,/g, ""));

  //       // Optional
  //   if (values.barcode) queryParams.set("barcode", values.barcode);
  //   if (values.brand) queryParams.set("brand", values.brand);
  //   if (values.expiration_date) queryParams.set("expiration_date", values.expiration_date);
  //   if (values.description) queryParams.set("description", values.description);
  //   if (values.weight) queryParams.set("weight", values.weight);

  //   // can_sell, stock, dry_stock
  //   queryParams.set("can_sell", "0");
  //   queryParams.set("stock", "0");
  //   queryParams.set("dry_stock", "true");
  
  //   const formData = new FormData();
  //   selectedImages.forEach((img) => {
  //     formData.append("images", img.file, img.file.name);
  //   });
  
  //   try {
  //     const newProduct = await createProduct(token, queryParams, formData);
  //     setMessage(`Thêm thành công ${values.name}!`);
  //     setMessageType("success");
  //     setProductDetail(newProduct);
  //     setIsDetailPopupOpen(true);
  //   } catch (error: any) {
  //     setMessage(`${error.message}`);
  //     setMessageType("error");
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const productPayload = {
      name: values.name.trim(),
      group_name: values.category.trim(),
      price_retail: +values.price_retail.replace(/,/g, ""),
      price_wholesale: +values.price_wholesale.replace(/,/g, ""),
      price_import: +values.price_import.replace(/,/g, ""),
      barcode: values.barcode.trim() || null,
      brand: values.brand.trim() || null,
      expiration_date: values.expiration_date || null,
      description: values.description || null,
      weight: +values.weight || 0,
      dry_stock: values.allow_sale,
    };

    console.log(productPayload)

    const formData = new FormData();
    formData.append("product_data", JSON.stringify(productPayload));
    selectedImages.forEach((img) => {
      formData.append("images", img.file, img.file.name);
    });

    try {
      const newProduct = await createProduct(token, formData);
      setMessage(`Thêm thành công sản phẩm: ${values.name}`);
      setMessageType("success");

      setTimeout(() => {
        setMessage("");
      }, 5000);
      setProductDetail(newProduct);
      setIsDetailPopupOpen(true);

      //reset form
      setValues({
        name: "",
        category: "",
        price_retail: "",
        price_wholesale: "",
        price_import: "",
        barcode: "",
        brand: "",
        expiration_date: "",
        description: "",
        weight: "",
        allow_sale: true,
        stop_sale: false,
      });
      setSelectedImages([]);
    } catch (error: any) {
      setMessage(`${error.message}`);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (status: "allow_sale" | "stop_sale") => {
    setValues((prev) => ({
      ...prev,
      allow_sale: status === "allow_sale",
      stop_sale: status === "stop_sale",
    }));
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
          className={`absolute top-0 right-0 w-full h-[36px] flex items-center justify-center text-white ${
            messageType === "success" ? "bg-[#3AA207]" : "bg-[#D37E09]"
          }`}
        >
          {messageType === "success" ? (
            <Check className="mr-2" />
          ) : (
            <ReportGmailerrorred className="mr-2" />
          )}
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-6">
        {/* Left */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-6"> Thông tin chung </h2>
          {/* Tên sản phẩm */}
          <div className="mb-6">
            <label className="text-base font-semibold">Tên sản phẩm</label>
            <input
              name="name"
              value={values.name}
              onChange={handleChange}
              className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 placeholder:text-[#3C3C4380] text-black"
              placeholder="Nước hoa AAA"
            />
            {errors.name && (
              <ErrorMessage message={errors.name} />
            )}
          </div>

          {/* Loại sản phẩm => group_name */}
          <div className="mb-6">
            <label className="text-base font-semibold">Loại sản phẩm </label>
            <ProductGroup
              token={token}
              value={values.category}
              onChange={handleCategoryChange}
            />
            {errors.category && (
              // <p className="text-red-500 text-sm">{errors.category}</p>
              <ErrorMessage message={errors.category} />
            )}
          </div>

          {/* Barcode (option) */}
          <div className="mb-6">
            <label className="text-base font-semibold">Mã barcode </label>
            <input
              name="barcode"
              value={values.barcode}
              onChange={handleChange}
              placeholder="893603428001"
              className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 placeholder:text-[#3C3C4380] text-black"
            />
          </div>

          {/* brand (option) */}
          <div className="mb-6">
            <label className="text-base font-semibold">Nhãn hiệu </label>
            <input
              name="brand"
              value={values.brand}
              onChange={handleChange}
              className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 placeholder:text-[#3C3C4380] text-black"
              placeholder="Gucci"
            />
          </div>

          {/* weight (option) */}
          <div className="mb-6">
            <label className="text-base font-semibold">Khối lượng (g)</label>
            <input
              name="weight"
              value={values.weight}
              onChange={handleChange}
              className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 placeholder:text-[#3C3C4380] text-black"
              placeholder="10"
            />
          </div>

          <div className="mb-6">
            <label className="text-base font-semibold">Hạn sử dụng </label>
            <div className="relative">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={
                    values.expiration_date
                      ? dayjs(values.expiration_date, "DD/MM/YYYY")
                      : null
                  }
                  onChange={(newValue) => {
                    setValues((prev) => ({
                      ...prev,
                      expiration_date: newValue
                        ? newValue.format("DD-MM-YYYY")
                        : "",
                    }));
                  }}
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

          {/* description (option) */}
          {/* <div className="mb-4">
          <label className="text-base font-semibold">Mô tả sản phẩm</label>
          <TextEditor value={description} onChange={setDescription} />
        </div> */}
          <div className="mb-4">
            <label className="text-base font-semibold">Mô tả sản phẩm</label>
            <div className="mt-2">
              {/* <SunEditorWrapper
                value={values.description}
                onChange={handleDescriptionChange}
                // height={300}
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
              /> */}
              <TextEditor
                value={values.description}
                onChange={handleDescriptionChange}
              />
            </div>
            {errors.description && (
              // <p className="text-red-500 text-sm">{errors.description}</p>
              <ErrorMessage message={errors.description} />
            )}
          </div>
        </div>

        {/* Right */}
        <div className="w-[40%] flex flex-col gap-4">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold text-xl mb-6">Giá sản phẩm</h2>
            {/* Bắt buộc price_retail */}
            <div className="mb-6">
              <label className="text-base font-semibold">Giá bán lẻ </label>
              <input
                name="price_retail"
                value={values.price_retail}
                onChange={handleChange}
                // onBlur={handleBlur}
                maxLength={15}
                placeholder="0.000"
                className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 text-black"
              />

              {errors.price_retail && (
                // <p className="text-red-500 text-sm">{errors.price_retail}</p>
                <ErrorMessage message={errors.price_retail} />
              )}
            </div>

            <div className="mb-6">
              <label className="text-base font-semibold">Giá bán buôn </label>
              <input
                name="price_wholesale"
                value={values.price_wholesale}
                onChange={handleChange}
                // onBlur={handleBlur}
                maxLength={15}
                placeholder="0.000"
                className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 text-black"
              />

              {errors.price_wholesale && (
                // <p className="text-red-500 text-sm">{errors.price_wholesale}</p>
                <ErrorMessage message={errors.price_wholesale} />
              )}
            </div>

            <div>
              <label className="text-base font-semibold">Giá nhập </label>
              <input
                name="price_import"
                value={values.price_import}
                onChange={handleChange}
                // onBlur={handleBlur}
                maxLength={15}
                placeholder="0.000"
                className="w-full h-10 rounded-lg border border-[#3C3C4359] p-2 text-black"
              />

              {errors.price_import && (
                // <p className="text-red-500 text-sm">{errors.price_import}</p>
                <ErrorMessage message={errors.price_import} />
              )}
            </div>
          </div>

          <div
            className={`bg-white p-6 rounded-xl shadow ${
              imageError ? "border border-red-500" : ""
            }`}
          >
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

            <div
              {...getRootProps()}
              className={cn(
                "border-dashed border-2 rounded flex flex-wrap gap-4 p-2",
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
                        <CloseOutlined
                          style={{ color: "white", fontSize: 12 }}
                        />
                      </button>
                    </div>
                  ))}

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

            {imageError && (
              // <p className="text-red-500 text-sm mt-1">{imageError}</p>
              <ErrorMessage message={imageError} />
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#338BFF] text-white py-2 px-4 rounded-lg hover:bg-[#66B2FF] w-full"
            >
              {isSubmitting ? "Đang thêm..." : "Thêm sản phẩm"}
            </button>
          </div>
        </div>
      </form>

      {/* {productDetail && (
        <DetailProductPopup isOpen={isDetailPopupOpen} onClose={() => setIsDetailPopupOpen(false)} product={productDetail} />
      )} */}
    </>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-1 text-red-500 text-sm">
      <ReportGmailerrorred fontSize="small" />
      <p>{message}</p>
    </div>
  );
}