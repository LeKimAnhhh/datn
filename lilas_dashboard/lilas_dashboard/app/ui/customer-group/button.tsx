"use client";

import React, { useState } from "react";
import PopupCreateCustomerGroup from "@/app/ui/customer-group/create-customer-group";
import { PlusIcon } from '@heroicons/react/24/outline';
import { CheckCircleOutlined, BookmarkAddedOutlined } from '@mui/icons-material';

export default function CreateCustomerGroupButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleCreated = () => {
    setMessage(`Tạo nhóm khách hàng thành công!`);
    setMessageType("success");

    setTimeout(() => {
      setMessage("");
    }, 5000);
    // alert("Tạo nhóm khách hàng thành công!");
    // window.location.reload();
  };

  return (
    <>
      {message && (
          <div
            className={`toast-message ${
              messageType === "success" ? "success" : messageType === "error" ? "error" : ""
            }`}
          >
            {messageType === "success" ? (
              <CheckCircleOutlined style={{ color: "#3AA207", fontSize: 20 }} />
            ) : (
              <BookmarkAddedOutlined style={{ color: "#D93025", fontSize: 20 }} />
            )}
            <span>{message}</span>
            {/* <CloseOutlined
              className="close-btn"
              style={{ fontSize: 16, cursor: "pointer", color: "#5F6368" }}
              onClick={() => setMessage("")}
            /> */}
          </div>
        )}
      <button
        onClick={handleOpen}
        className="flex h-10 items-center rounded-lg bg-[#338BFF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#66B2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66B2FF]"
      >
        <PlusIcon className="h-5 md:mr-4" />
        Thêm nhóm khách hàng
      </button>
      {isOpen && (
        <PopupCreateCustomerGroup
          isOpen={isOpen}
          onClose={handleClose}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
