"use client";

import React, { useState } from "react";
import PopupCreate from "@/app/ui/supplier/create-form";
import { PlusIcon } from '@heroicons/react/24/outline';

const CreateSupplierButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const handleCreate = () => {
    // alert("Nhà cung cấp được tạo thành công!");
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        className="flex h-10 items-center rounded-lg bg-[#338BFF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#66B2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66B2FF]"
      >
        <PlusIcon className="h-5 md:mr-4" />
        Tạo nhà cung cấp
      </button>

      <PopupCreate
        isOpen={isOpen}
        onClose={handleClose}
        onCreated={handleCreate}
      />
    </div>
  );
};

export default CreateSupplierButton;