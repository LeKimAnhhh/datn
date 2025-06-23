"use client";

import React, { useState } from "react";
import PopupCreateEmployee from "@/app/ui/customer/create-customer";
import { PlusIcon } from '@heroicons/react/24/outline';
import PopupCreateShop from "./create-shop";

const CreateShopButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <div>
      <button
        onClick={handleOpen}
        className="flex h-10 items-center rounded-lg bg-[#338BFF] px-4 gap-2 text-sm font-medium text-white transition-colors hover:bg-[#66B2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66B2FF]"
        >
        <PlusIcon className="h-5" />
        Tạo shop
      </button>

      <PopupCreateShop
        isOpen={isOpen}
        onClose={handleClose}
        // onCreate={handleCreate}
      />
    </div>
  );
};

export default CreateShopButton;
