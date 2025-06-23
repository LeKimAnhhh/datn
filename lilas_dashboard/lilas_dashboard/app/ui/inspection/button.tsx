"use client";

import { useState } from "react";
import PopupCreateInspection from "@/app/ui/inspection/create-form";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function CreateInspectionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 items-center rounded-lg bg-[#338bff] px-4 text-sm font-medium text-white transition-colors hover:bg-[#66b2ff]"
      >
        <PlusIcon className="h-5 mr-2" />
        Tạo phiếu kiểm
      </button>

      {isOpen && (
        <PopupCreateInspection
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
