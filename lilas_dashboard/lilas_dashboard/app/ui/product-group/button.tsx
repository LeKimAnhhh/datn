// app/ui/product-group/create-group-button.tsx
"use client";

import React, { useState } from "react";
import CreateProductGroupPopup from "@/app/ui/product-group/create-product-group";
import { PlusIcon } from '@heroicons/react/24/outline';


export default function CreateProductGroupButton() {
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
