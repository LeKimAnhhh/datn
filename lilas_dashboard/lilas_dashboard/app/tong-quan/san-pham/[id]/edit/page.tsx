"use client";
import { useParams } from "next/navigation"; 
import { useEffect, useState } from "react";
import { ProductResponse } from "@/app/lib/definitions";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import EditProductForm from "@/app/ui/product/edit-form";
import { fetchProductDetail } from "@/app/lib/data";

export default function Page() {
  const params = useParams();
  const productId = params?.id as string;

  const [productData, setProductData] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("access_token") || "";
        const data = await fetchProductDetail(token, productId);
        setProductData(data);
      } catch (err: any) {
        setError(err.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <main className="lg:px-32">
        <div>Đang tải...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="lg:px-32">
        <div>Lỗi: {error}</div>
      </main>
    );
  }

  if (!productData) {
    return (
      <main className="lg:px-32">
        <div>Không tìm thấy sản phẩm với ID {productId}</div>
      </main>
    );
  }

  return (
    <main className="px-0 2xl:px-32">
      <Breadcrumbs
        breadcrumbs={[
          { label: "Sản phẩm", href: "/tong-quan/san-pham" },
          {
            label: `Chỉnh sửa sản phẩm`,
            href: `/tong-quan/san-pham/${productId}/edit`,
            active: true,
          },
        ]}
      />
      <EditProductForm initialData={productData} />
    </main>
  );
}
