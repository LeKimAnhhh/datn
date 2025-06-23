"use client";

import React, { useState } from "react";
import PopupCreateCustomer from "@/app/ui/customer/create-customer";
import { PlusIcon } from '@heroicons/react/24/outline';

interface CreateCustomerButtonProps {
  reloadCustomers: () => Promise<void>;
}

const CreateCustomerButton: React.FC<CreateCustomerButtonProps> = ({ reloadCustomers }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <div>
      <button
        onClick={handleOpen}
        className="flex h-10 items-center rounded-lg bg-[#338BFF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#66B2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66B2FF]"
        >
        <PlusIcon className="h-5 md:mr-4" />
        Tạo khách hàng
      </button>

      <PopupCreateCustomer
        isOpen={isOpen}
        onClose={handleClose}
        onCreateSuccess={() => reloadCustomers()}
      />
    </div>
  );
};

export default CreateCustomerButton;
