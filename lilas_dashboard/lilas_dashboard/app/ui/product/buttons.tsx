"use client";
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useState } from "react";
import Link from 'next/link';
import CreateProductGroupPopup from "@/app/ui/product-group/create-product-group";
import { Box, LinearProgress } from "@mui/material";

export function CreateProduct() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
  };
  return (
    <>
      {loading && (
        <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1100 }}>
          <LinearProgress />
        </Box>
      )}
    <Link
      href="/tong-quan/san-pham/create"
      onClick={handleClick}
      className="flex h-10 items-center rounded-lg bg-[#338BFF] px-4 font-medium text-white transition-colors hover:bg-[#66B2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66B2FF]"
    >
      <PlusIcon className="h-5 md:mr-2" />
      <span className="hidden md:block">Tạo sản phẩm </span>
    </Link>
    </>
  );
}

export function UpdateProduct({ id }: { id: string }) {
  return (
    <Link
      href={`/tong-quan/san-pham/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteProduct({ id }: { id: string }) {
  return (
    <form action={`/api/products/${id}/delete`} method="post">
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Xóa</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}

export function CreateProductGroupButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 items-center rounded-lg bg-[#338BFF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#66B2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66B2FF]"
        >
        <PlusIcon className="h-5 md:mr-4" />
        Tạo loại sản phẩm
      </button>
      {open && (
        <CreateProductGroupPopup
          isOpen={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

