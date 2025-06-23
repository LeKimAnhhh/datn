"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import PopupCreateReturn from "./create-form";

export default function CreateTransferButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 items-center rounded-lg bg-[#338bff] px-4 text-sm font-medium text-white transition-colors hover:bg-[#66b2ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b33ee6]"
      >
        <PlusIcon className="h-5 md:mr-4" />
        Tạo phiếu chuyển
      </button>

      {isOpen && (
        <PopupCreateReturn isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
