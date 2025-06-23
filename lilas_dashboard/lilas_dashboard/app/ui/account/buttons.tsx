"use client";

import React, { useState } from "react";
import PopupCreateAccount from "@/app/ui/account/create-account";
import { PlusIcon } from '@heroicons/react/24/outline';
import { BookmarkAddedOutlined } from '@mui/icons-material';

const CreateAccountButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const handleCreate = () => {
    setMessage(`Tài khoản được tạo thành công!`);
    setMessageType("success");

    setTimeout(() => {
      setMessage("");
    }, 5000);
    // alert("Tài khoản được tạo thành công!");
  };

  return (
    <div>
      {message && (
        <div className="toast-message">
          <BookmarkAddedOutlined style={{ color: "#1A73E8", fontSize: 20 }} />
          <span>{message}</span>
          {/* <span className="close-btn" onClick={handleClose}>✖</span> */}
        </div>
      )}
      <button
        onClick={handleOpen}
        className="flex h-10 items-center rounded-lg bg-[#338BFF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#66B2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66B2FF]"
      >
        <PlusIcon className="h-5 md:mr-4" />
        Tạo tài khoản
      </button>

      <PopupCreateAccount
        isOpen={isOpen}
        onClose={handleClose}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default CreateAccountButton;
