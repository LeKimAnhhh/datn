// import React from "react";
// import clsx from "clsx";

// interface GenericButtonProps {
//   label: string; 
//   onClick: () => void;
//   icon?: React.ReactNode
//   className?: string;
// }

// const GenericButton: React.FC<GenericButtonProps> = ({ label, onClick, icon, className }) => {
//   return (
//     <button
//       onClick={onClick}
//       className={clsx(
//         "flex h-10 items-center rounded-lg bg-[#338BFF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#66B2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66B2FF]",
//         className
//       )}
//     >
//       {icon && <span className="mr-2">{icon}</span>}
//       {label}
//     </button>
//   );
// };

// export default GenericButton;

"use client";

import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import CreateProductGroupPopup from "@/app/ui/product-group/create-product-group";
import PopupCreateEmployee from "@/app/ui/employee/create-employee";

interface ButtonProps {
  type: "createProductGroup" | "createEmployee";
}

const ButtonGroup: React.FC<ButtonProps> = ({ type }) => {
  const [open, setOpen] = useState(false);

  const buttons = {
    createProductGroup: {
      label: "Tạo loại sản phẩm",
      icon: <PlusIcon className="h-5 md:mr-4" />,
      popup: <CreateProductGroupPopup isOpen={open} onClose={() => setOpen(false)} />,
    },
    createEmployee: {
      label: "Tạo nhân viên",
      icon: <PlusIcon className="h-5 md:mr-4" />,
      popup: <PopupCreateEmployee isOpen={open} onClose={() => setOpen(false)} />,
    },
  };

  const buttonConfig = buttons[type];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 items-center rounded-lg bg-[#338BFF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#66B2FF] focus-visible:outline focus-visible-outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66B2FF]"
      >
        {buttonConfig.icon}
        {buttonConfig.label}
      </button>
      {open && buttonConfig.popup}
    </>
  );
};

export default ButtonGroup;
