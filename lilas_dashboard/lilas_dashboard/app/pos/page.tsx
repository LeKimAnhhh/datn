"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  AddOutlined,
  ArrowBackRounded,
  LocationOnOutlined,
  PersonOutlineOutlined,
  CloseRounded,
  ArrowDropDownOutlined,
  ChevronRightOutlined,
  HighlightOffOutlined,
  ReportGmailerrorred,
  EditOutlined,
  Check,
  ExpandMoreOutlined,
  SearchOutlined,
} from "@mui/icons-material";

import PopupDiscount from "@/app/components/PopupDiscount";
import PopupMethod from "@/app/components/PopupMethod";
import PopupPayment from "@/app/components/PopupPayment";
import SearchProduct, { SearchProductHandle } from "@/app/components/SearchProduct";
import PopupCustomers from "@/app/components/PopupCustomers";
import PopupEmployees from "@/app/components/PopupEmployees";
import EmptyState from "@/app/pos/empty";
import ProductList, { ItemPrice } from "@/app/pos/product-list";
import {
  Product,
  CreateInvoice,
  InvoiceItem,
  Customer,
  Employee,
  ShopResponse,
} from "@/app/lib/definitions";
import { createInvoice, fetchEmployeeData, fetchShops } from "@/app/lib/data";
import { useRouter } from "next/navigation";
import Select from "../ui/select";
import { Box, LinearProgress } from "@mui/material";
import { generateInvoiceHTML } from "../ui/invoices/PrintButtonInvoice";
import Error404 from "../ui/404";

const CreateInvoiceForm: React.FC = () => {
  const router = useRouter();
  const [invoices, setInvoices] = useState<CreateInvoice[]>([
    {
      id: 1,
      name: "Đơn 1",
      items: [],
      discount: 0,
      discountType: "%",
      customerPaid: 0,
      customerDeposit: 0,
      depositMethod: "cash",
      customer: null,
      branch: "Thợ Nhuộm",
      isDelivery: false,
      orderSource: null,
    },
  ]);

  const [isLoading, setIsLoaiding] = useState(false);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number>(1);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isDiscountPopupOpen, setIsDiscountPopupOpen] = useState(false);
  const [isMethodPopupOpen, setIsMethodPopupOpen] = useState(false);
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);
  const [orderNote, setOrderNote] = useState<string>("");

  const [isEmployeePopupVisible, setIsEmployeePopupVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [employeeResults, setEmployeeResults] = useState<Employee[]>([]);
  const [shops, setShops] = useState<ShopResponse[]>([]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const orderSource = selectedInvoice?.orderSource ?? "facebook";
  const setOrderSource = (newValue: string | null) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === selectedInvoiceId ? { ...inv, orderSource: newValue } : inv
      )
    );
  };
  
  const [searchCustomerQuery, setSearchCustomerQuery] = useState("");
  const handleSearchCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCustomerQuery(e.target.value);
    setIsPopupVisible(true);
  };
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      async function loadShops() {
        try {
          // throw new Error("Test error");
          const shopData = await fetchShops();
          setShops(shopData);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách cửa hàng:", error);
          setError("Lỗi khi lấy danh sách cửa hàng");
        }
      }
      loadShops();
      // if (isOpen) {
      //   loadShops();
      // }
    }, []);

  const selectedShop = shops.find((shop) => shop.name === selectedInvoice?.branch);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const token = localStorage.getItem("access_token") || "";
        const { users } = await fetchEmployeeData(token, 50, 1, "");
        setEmployeeResults(users);
      } catch (err) {
        console.error("Lỗi khi tải danh sách nhân viên:", err);
        setError("Lỗi khi tải danh sách nhân viên");
      }
    };
    loadEmployees();
  }, []);

  // Thêm 1 hoá đơn mới
  const handleAddInvoice = () => {
    setInvoices((prev) => {
      if (prev.length >= 15) {
        // alert("Bạn chỉ có thể tạo tối đa 15 đơn.");
        return prev;
      }

      const newId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
      const newInvoice: CreateInvoice = {
        id: newId,
        name: `Đơn ${newId}`,
        items: [],
        discount: 0,
        discountType: "%",
        customerPaid: 0,
        customerDeposit: 0,
        depositMethod: "cash",
        customer: null,
        branch: "Thợ Nhuộm",
        isDelivery: false,
        orderSource: null,
      };
      // setInvoices((prev) => [...prev, newInvoice]);
      // setSelectedInvoiceId(newId);
      return [...prev, newInvoice];
    });
  };

  // Chọn sang hoá đơn khác
  const handleSelectInvoice = (id: number) => {
    setSelectedInvoiceId(id);
  };

  // const handleDeleteInvoice = (id: number) => {
  //   if (invoices.length > 1) {
  //     const updated = invoices.filter((inv) => inv.id !== id);
  //     setInvoices(updated);
  //     // xoá hoá đơn đang hiển thị, chuyển sang hoá đơn đầu còn lại
  //     if (id === selectedInvoiceId) {
  //       setSelectedInvoiceId(updated[0].id);
  //     }
  //   }
  // };
  const handleDeleteInvoice = (id: number, e:React.MouseEvent) => {
    e.stopPropagation();
    if (invoices.length <= 1) return;
    const updated = invoices.filter((inv) => inv.id !== id);  
    if (id === selectedInvoiceId) {
      setSelectedInvoiceId(updated[updated.length - 1].id);
      setTimeout(() => {
        setInvoices(updated);
      }, 50);
    } else {
      setInvoices(updated);
    }
    // xoá hoá đơn đang hiển thị, chuyển sang hoá đơn đầu còn lại
    // if (id === selectedInvoiceId) {
    //   setSelectedInvoiceId(updated[0].id);
    // }
  };

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  const handleSelectCustomer = (customer: Customer) => {
    if (!selectedInvoice) return;
    console.log("SelectCustomer:", customer);

    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        // inv.id === selectedInvoiceId ? { ...inv, customer } : inv
        inv.id === selectedInvoiceId
          ? {
              ...inv,
              customer,
              discount: customer.group?.discount ?? 0,
              discountType: customer.group?.discount_type === "percent" ? "%" : "value",
            }
          : inv
      )
    );

    setIsPopupVisible(false);
  };

  // Xoá khách hàng khỏi đơn
  const handleRemoveCustomer = () => {
    if (!selectedInvoice) return;
    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv.id === selectedInvoiceId ? { ...inv, customer: null } : inv
      )
    );
  };

  const handleSelectProduct = (product: Product) => {
    if (!selectedInvoice) return;

    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv.id === selectedInvoiceId
          ? {
              ...inv,
              items: inv.items.some((it) => it.id === product.id)
                ? inv.items.map((it) =>
                    it.id === product.id
                      ? { ...it, quantity: it.quantity + 1 }
                      : it
                  )
                : [
                    ...inv.items,
                    {
                      id: product.id,
                      barcode: product.barcode,
                      name: product.name,
                      image:
                        product.images?.[0]?.url ?? 
                        "http://localhost:3000/customers/amy-burns.png",
                      price: product.price_retail,
                      price_wholesale: product.price_wholesale,
                      quantity: 1,
                      discount: 0,
                      isService: false,
                    },
                  ],
            }
          : inv
      )
    );
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // const handleSelectProduct = (product: Product) => {
  //   const invoiceIdx = invoices.findIndex((inv) => inv.id === selectedInvoiceId);
  //   if (invoiceIdx === -1) return;

  //   setInvoices((prevInvoices) => {
  //     return prevInvoices.map((inv) => {
  //       if (inv.id !== selectedInvoiceId) return inv;

  //       // Kiểm tra đã tồn tại item?
  //       const existingIdx = inv.items.findIndex(
  //         (it) => it.product_id === product.id && !it.isService
  //       );
  //       if (existingIdx >= 0) {
  //         // Tăng quantity
  //         const newItems = [...inv.items];
  //         newItems[existingIdx] = {
  //           ...newItems[existingIdx],
  //           quantity: newItems[existingIdx].quantity + 1,
  //         };
  //         return { ...inv, items: newItems };
  //       } else {
  //         // Thêm item mới
  //         const newItem: InvoiceItem = {
  //           id: 0,                    // default = 0
  //           product_id: product.id,   // "SP7"...
  //           barcode: product.barcode,
  //           name: product.name,
  //           image: product.images?.[0]?.url ?? "http://localhost:3000/customers/amy-burns.png",
  //           price: product.price_retail,
  //           quantity: 1,
  //           discount: 0,
  //           isService: false,
  //         };
  //         return { ...inv, items: [...inv.items, newItem] };
  //       }
  //     });
  //   });
  // };

  // service
  const handleAddService = () => {
    if (!selectedInvoice) return;

    const newItem: InvoiceItem = {
      id: Date.now(),
      barcode: "",
      name: "",
      image: `/static/images/dich-vu.png`,
      price: 1,
      quantity: 1,
      discount: 0,
      isService: true,
    };

    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv.id === selectedInvoiceId
          ? { ...inv, items: [...inv.items, newItem] }
          : inv
      )
    );
  };

  const searchProductRef = useRef<SearchProductHandle>(null);

  const handleAddProduct = () => {
    // Focus on the search input when the "Add product" button is clicked
    searchProductRef.current?.focus();
  };

  // const handleAddService = () => {
  //   const invoiceIdx = invoices.findIndex((inv) => inv.id === selectedInvoiceId);
  //   if (invoiceIdx === -1) return;

  //   setInvoices((prevInvoices) => {
  //     return prevInvoices.map((inv) => {
  //       if (inv.id !== selectedInvoiceId) return inv;

  //       const newItem: InvoiceItem = {
  //         id: 0,
  //         product_id: `DV_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  //         barcode: "",
  //         name: "Tên dịch vụ",
  //         image: "http://localhost:3000/customers/dich-vu.png",
  //         price: 1,
  //         quantity: 1,
  //         discount: 0,
  //         isService: true,
  //       };
  //       return { ...inv, items: [...inv.items, newItem] };
  //     });
  //   });
  // };

  // xoá dòng
  const handleRemoveItem = (itemId: string) => {
    if (!selectedInvoice) return;

    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv.id === selectedInvoiceId
          ? {
              ...inv,
              items: inv.items.filter((it) => String(it.id) !== String(itemId)),
            }
          : inv
      )
    );
  };

  // xoá full
  const handleRemoveAllItems = () => {
    if (!selectedInvoice) return;

    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv.id === selectedInvoiceId ? { ...inv, items: [] } : inv
      )
    );
  };

  // Sửa số lượng
  const handleChangeQuantity = (itemId: number, value: number) => {
    if (!selectedInvoice) return;
    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv.id === selectedInvoiceId
          ? {
              ...inv,
              items: inv.items.map((it) =>
                it.id === itemId ? { ...it, quantity: value } : it
              ),
            }
          : inv
      )
    );
  };

  // chiết khấu từng dòng
  const handleChangeDiscount = (itemId: number, value: number) => {
    if (!selectedInvoice) return;

    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv.id === selectedInvoiceId
          ? {
              ...inv,
              items: inv.items.map((it) =>
                it.id === itemId ? { ...it, discount: value } : it
              ),
            }
          : inv
      )
    );
  };

  const handleChangeDiscountType = (itemId: number, newType: "%" | "VND") => {
    console.log("handleChangeDiscountType", itemId, newType);
    if (!selectedInvoice) return;

    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv.id === selectedInvoiceId
          ? {
              ...inv,
              items: inv.items.map((it) =>
                it.id === itemId ? { ...it, discount_type: newType } : it
              ),
            }
          : inv
      )
    );
  };

  // Sửa đơn giá
  const handleChangePrice = (itemId: number, value: number) => {
    if (!selectedInvoice) return;

    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv.id === selectedInvoiceId
          ? {
              ...inv,
              items: inv.items.map((it) =>
                it.id === itemId && it.isService ? { ...it, price: value } : it
              ),
            }
          : inv
      )
    );
  };

  const handleServiceNameChange = (itemId: number, value: string) => {
    if (!selectedInvoice) return;

    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv.id === selectedInvoiceId
          ? {
              ...inv,
              items: inv.items.map((it) =>
                it.id === itemId ? { ...it, name: value } : it
              ),
            }
          : inv
      )
    );
  }

  //chi phí
  const calculateLineTotal = (item: InvoiceItem) =>{
    // item.quantity * item.price * (1 - item.discount / 100);
    // item.quantity * ItemPrice(item, selectedInvoice?.customer?.group_name || "") * (1 - item.discount / 100);
    if(item.discount_type === "VND") {
      return item.quantity * ItemPrice(item, selectedInvoice?.customer?.group_name || "") - item.discount;
    }
    return item.quantity * ItemPrice(item, selectedInvoice?.customer?.group_name || "") * (1 - item.discount / 100);
  }
  const totalAll = selectedInvoice
    ? selectedInvoice.items.reduce((acc, it) => acc + calculateLineTotal(it), 0)
    : 0;

  // tổng tiền sau ck toàn đơn
  const finalTotal =
    selectedInvoice?.discountType === "%"
      ? totalAll * (1 - (selectedInvoice?.discount || 0) / 100)
      : totalAll - (selectedInvoice?.discount || 0);

  // Tiền thừa trả khách
  const changeDue = selectedInvoice
    ? Math.max(
        selectedInvoice.customerPaid +
          selectedInvoice.customerDeposit - 
          finalTotal,
        0
      )
    : 0;

  // ck tổng đơn
  const handleShowDiscountPopup = () => {
    setIsDiscountPopupOpen(true);
  };
  const handleCloseDiscountPopup = () => {
    setIsDiscountPopupOpen(false);
  };
  const handleShowPaymentPopup = () => {
    setIsPaymentPopupOpen(true);
  };
  const handleClosePaymentPopup = () => {
    setIsPaymentPopupOpen(false);
  };

  const handleShowMethodPopup = () => {
    setIsMethodPopupOpen(true);
  };
  const handleCloseMethodPopup = () => {
    setIsMethodPopupOpen(false);
  };
  const handleApplyDiscountPopup = (
    discountValue: number,
    type: "%" | "value"
  ) => {
    if (!selectedInvoice) return;

    // update ck cho hoá đơn đang chọn
    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv.id === selectedInvoiceId
          ? { ...inv, discount: discountValue, discountType: type }
          : inv
      )
    );
  };

  //Tiền khách đưa
  const handleChangeCustomerPaid = (value: number) => {
    if (!selectedInvoice) return;
    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) =>
        inv.id === selectedInvoiceId ? { ...inv, customerPaid: value } : inv
      )
    );
  };

  // popup nhân viên
  const toggleEmployeePopup = () => {
    setIsEmployeePopupVisible(!isEmployeePopupVisible);
  };

  // Employee
  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEmployeePopupVisible(false);
  };

  const handlePrint = (inv:any, shop:any) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";

    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(generateInvoiceHTML(inv, shop));
      doc.close();

      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  const handlePayment = async () => {
    if (!selectedInvoice) return;
    if (!selectedEmployee || !selectedEmployee.id) {
      setMessage("Chọn nhân viên trước khi thanh toán!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 10000);
      // alert("Chọn nhân viên trước khi thanh toán!");
      return;
    }
    if (!selectedInvoice.items || selectedInvoice.items.length === 0) {
      setMessage("Đơn hàng phải có ít nhất một sản phẩm trước khi thanh toán!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 10000);
      // alert("Hóa đơn phải có ít nhất một sản phẩm trước khi thanh toán!");
      return;
    }
    const hasInvalidQuantity = selectedInvoice.items.some(
      (item) => item.quantity <= 0
    );
    const hasInvalidPrice = selectedInvoice.items.some(
      (item) => item.price <= 0
    );
    if (hasInvalidQuantity) {
      setMessage("Số lượng sản phẩm phải lớn hơn 0!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 10000);
      return;
    }

    if (hasInvalidPrice) {
      setMessage("Giá sản phẩm phải lớn hơn 0!");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 10000);
      return;
    }

    const token = localStorage.getItem("access_token");

    // payload backend
    const payload = {
      customer_id: selectedInvoice.customer
        ? selectedInvoice.customer.id
        : null,
      user_id: selectedEmployee.id,
      branch: selectedInvoice.branch,
      discount: selectedInvoice.discount,
      discount_type: selectedInvoice.discountType,
      deposit: selectedInvoice.customerDeposit, // tiền cọc
      deposit_method: selectedInvoice.depositMethod,
      // is_delivery: selectedInvoice.isDelivery,
      is_delivery: false,
      // order_source: selectedInvoice.orderSource,
      order_source: selectedInvoice.orderSource || "facebook",
      note: orderNote,
      items: selectedInvoice.items
        .filter((item) => !item.isService)
        .map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          // price: item.price,
          price: ItemPrice(item, selectedInvoice.customer?.group_name || ""),
          discount: item.discount,
          discount_type: item.discount_type || "%",
        })),
      service_items: selectedInvoice.items
        .filter((item) => item.isService)
        .map((srv) => ({
          id: `DV_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          // product_id: srv.product_id,
          name: srv.name,
          quantity: srv.quantity,
          price: srv.price,
          discount: srv.discount,
        })),
    };
    console.log("payload:", payload);

    try {
      const data = await createInvoice(token || "", payload);
      console.log("Tạo hoá đơn thành công:", data);
      setMessage("Thanh toán thành công!");
      setMessageType("success");

      setTimeout(() => {
        setMessage("");
      }, 10000);
      // alert("Hoá đơn đã được tạo thành công!");
      resetInvoiceForm();

      setTimeout(() => {
        handlePrint(data, selectedShop);
      }, 500);

    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Không thể tạo hoá đơn");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 10000);
      // alert("Không thể tạo hoá đơn");
    }
  };

  // reset
  const resetInvoiceForm = () => {
    // setInvoices([
    //   {
    //     id: 1,
    //     name: "Đơn 1",
    //     items: [],
    //     discount: 0,
    //     discountType: "%",
    //     customerPaid: 0,
    //     customerDeposit: 0,
    //     depositMethod: "cash",
    //     customer: null,
    //     branch: "Thợ Nhuộm",
    //     isDelivery: false,
    //     orderSource: null,
    //   },
    // ]);
    // setSelectedInvoiceId(1);
    // setOrderNote("");
    // setSelectedEmployee(null)
    const resetInvoice = {
      id: selectedInvoiceId,
      name: `Đơn ${selectedInvoiceId}`,
      items: [],
      discount: 0,
      discountType: "%",
      customerPaid: 0,
      customerDeposit: 0,
      depositMethod: "cash",
      customer: null,
      branch: "Thợ Nhuộm",
      isDelivery: false,
      orderSource: null,
    };
    
    setInvoices((prevInvoices) =>
      prevInvoices.map((inv:any) =>
        inv.id === selectedInvoiceId ? resetInvoice : inv
      )
    );
    
    setOrderNote("");
    setSelectedEmployee(null);
  };

  if(error) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="relative mx-auto flex w-full max-w-[530px]">
          <Error404 />
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 1000,
          }}
        >
          <LinearProgress />
        </Box>
      )}
      <div className="flex flex-col h-screen bg-[#F2F2F7]">
        {message && (
          <div
            className={` h-[36px] flex items-center justify-center text-white ${
              messageType === "success" ? "bg-[#17489E]" : "bg-[#D37E09]"
            }`}
          >
            {messageType === "success" ? (
              <Check className="mr-2" />
            ) : (
              <ReportGmailerrorred className="mr-2" />
            )}
            {message}
          </div>
        )}
        <div className="flex items-center justify-between px-6 pt-4">
          <div className="flex items-center gap-2 h-10">
            <button
              onClick={() => {
                // router.push("/dashboard/invoices");
                setIsLoaiding(true);
                router.push("/tong-quan/don-hang");
              }}
              className="flex items-center justify-center h-[28px] w-[28px] bg-[#0061fd] bg-opacity-15 rounded-full text-[#338BFF]"
            >
              <ArrowBackRounded fontSize="small" />
            </button>
            <div className="flex items-center self-end h-full">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={`relative flex items-center justify-between w-32 px-3 rounded-t-lg h-full cursor-pointer ${
                    invoice.id === selectedInvoiceId
                      ? "bg-white"
                      : "bg-[#F1EEF2]"
                  }`}
                  onClick={() => handleSelectInvoice(invoice.id)}
                >
                  <span
                    className={`text-[15px] font-normal ${
                      invoice.id === selectedInvoiceId
                        ? "text-[#000]"
                        : "text-[#6E5973]"
                    }`}
                  >
                    {invoice.name}
                  </span>
                  <button
                    className="text-[#3C3C43B2] hover:text-gray-500"
                    onClick={(e) => handleDeleteInvoice(invoice.id, e)}
                  >
                    <CloseRounded
                      fontSize="small"
                      className="text-[#3c3c43b2] text-opacity-70"
                    />
                  </button>
                </div>
              ))}
              <button
                className="flex items-center ml-3 justify-center h-[28px] w-[28px] hover:text-gray-500 border-l border-[#4F49502E]"
                onClick={handleAddInvoice}
              >
                <AddOutlined fontSize="small" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center border-b border-gray-200 flex-shrink-0 bg-white px-3 2xl:px-6 py-4">
          <div className="w-[74%]">
            <SearchProduct
              ref={searchProductRef}
              onSelectProduct={handleSelectProduct}
            />
          </div>
          <div className="flex items-center w-[26%] pl-3 2xl:pl-6">
            <div className="relative flex items-center text-sm text-blue-900 w-1/2">
              <LocationOnOutlined
                fontSize="small"
                className="absolute left-2 text-blue-900"
              />
              <Select
                key={`branch-select-${selectedInvoiceId}-${
                  selectedInvoice?.branch || "default"
                }`}
                options={[
                  { value: "Thợ Nhuộm", label: "Thợ Nhuộm" },
                  { value: "Terra", label: "Terra" },
                ]}
                defaultValue={selectedInvoice?.branch || "Thợ Nhuộm"}
                onSelect={(value) =>
                  setInvoices((prev) =>
                    prev.map((inv) =>
                      inv.id === selectedInvoiceId
                        ? { ...inv, branch: value }
                        : inv
                    )
                  )
                }
                btnClassName="text-blue-900 bg-transparent pl-8 font-medium hover:border-transparent text-[12px] 2xl:text-[16px]"
                wrapperClassName="w-full !min-w-min"
              />
              {/* <button
              className="appearance-none bg-transparent text-blue-900 font-medium pl-8 w-full focus:outline-none cursor-pointer text-left"
              onClick={toggleEmployeePopup}
            >
              {selectedInvoice ? selectedInvoice.branch : "Thợ nhuộm"}
            </button>
            {isEmployeePopupVisible && (
              <div className="absolute left-0 top-[200%] w-full">
                <PopupEmployees
                  // employees={employeeResults}
                  // onSelectEmployee={handleSelectEmployee}
                  onClose={() => setIsEmployeePopupVisible(false)}
                  value={selectedInvoice?.branch ?? "Thợ Nhuộm"}
                  onChange={(e) => {
                    const br = e.target.value;
                    setInvoices((prev) =>
                      prev.map((inv) =>
                        inv.id === selectedInvoiceId ? { ...inv, branch: br } : inv
                      )
                    );
                  }}
                />
              </div>
            )} */}
              {/* <span className="absolute right-2 pointer-events-none"> */}
              {/* <ArrowDropDownOutlined fontSize="medium" className="text-blue-900" /> */}
              {/* </span> */}
              {/* <select
              className="border-0 appearance-none bg-transparent bg-none text-blue-900 font-medium pl-8 w-full text-[12px] 2xl:text-[16px] focus:outline-none cursor-pointer"
              value={selectedInvoice?.branch ?? "Thợ Nhuộm"}
              onChange={(e) => {
                const br = e.target.value;
                setInvoices((prev) =>
                  prev.map(
                    (inv) =>
                      inv.id === selectedInvoiceId
                        ? { ...inv, branch: br }
                        : inv
                  )
                );
              }}
            >
              <option value="Thợ Nhuộm">Thợ Nhuộm</option>
              <option value="Terra">Terra</option>
            </select> */}
            </div>

            {/* Divider */}
            <div className="w-px h-9 bg-gray-400"></div>
            <div className="relative flex items-center text-sm text-blue-900 w-1/2">
              <PersonOutlineOutlined
                fontSize="small"
                className="absolute left-2 text-blue-900"
              />
              <button
                className="appearance-none bg-transparent text-blue-900 font-medium pl-8 w-full text-[12px] 2xl:text-[16px] focus:outline-none cursor-pointer text-left"
                onClick={toggleEmployeePopup}
              >
                {selectedEmployee ? selectedEmployee.full_name : "Nhân viên"}
              </button>
              {isEmployeePopupVisible && (
                <div className="absolute left-0 top-7 w-full">
                  <PopupEmployees
                    employees={employeeResults}
                    onSelectEmployee={handleSelectEmployee}
                    onClose={() => setIsEmployeePopupVisible(false)}
                  />
                </div>
              )}
              <span className="absolute right-2 pointer-events-none">
                <ArrowDropDownOutlined
                  fontSize="small"
                  className="text-blue-900"
                />
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-1 bg-white overflow-hidden">
          <div className="flex flex-col w-[74%] border-r border-gray-200 h-full">
            {selectedInvoice && selectedInvoice.items.length === 0 ? (
              <EmptyState onAddProdcut={handleAddProduct} />
            ) : (
              <ProductList
                invoiceItems={selectedInvoice?.items || []}
                calculateTotal={calculateLineTotal}
                handleChangeQuantity={handleChangeQuantity}
                handleChangeDiscount={handleChangeDiscount}
                handleChangeDiscountType={handleChangeDiscountType}
                handleRemoveItem={handleRemoveItem}
                handleChangePrice={handleChangePrice}
                handleChangeServiceName={handleServiceNameChange}
                customer_gr_name={selectedInvoice?.customer?.group_name || ""}
              />
            )}
          </div>
          {/* Summary */}
          <div className="w-[26%] overflow-scroll flex flex-col scrollbar-hide">
            <div className="relative">
              {selectedInvoice?.customer ? (
                <div className="flex justify-between items-start border-b p-3 2xl:p-6 border-gray-200 w-full">
                  <div>
                    <div className="text-[17px] font-semibold">
                      <span className="underline decoration-blue-500 text-blue-500 cursor-pointer">
                        {selectedInvoice.customer.full_name}
                      </span>{" "}
                      -{" "}
                      <span className="">{selectedInvoice.customer.phone}</span>
                    </div>
                    <div className="text-[15px] text-gray-700 mt-1">
                      Công nợ:{" "}
                      <span className="text-red-500 font-bold">
                        {selectedInvoice.customer.debt.toLocaleString(
                          "en-ES"
                        ) || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <button onClick={handleRemoveCustomer}>
                      <HighlightOffOutlined
                        fontSize="small"
                        className="text-red-500"
                      />
                    </button>
                    <div className="text-[15px] text-gray-700 mt-1">
                      Điểm hiện tại:{" "}
                      {selectedInvoice.customer.loyalty_points || 0}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-[12px] 2xl:py-[24px] px-[10px] 2xl:px-[15px] border-b border-gray-200 ">
                  {/* <button
                  className="flex items-center justify-between p-3 bg-[#e9ecf2] rounded-lg text-[#3c3c43ad] text-opacity-70 text-[17px] font-semibold hover:text-gray-800 w-full"
                  onClick={togglePopup}
                >
                  Thêm khách hàng vào đơn hàng
                  <AddOutlined fontSize="small" className="text-black" />
                </button> */}

                  <div className="relative w-full">
                    <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black font-bold" />
                    <input
                      type="text"
                      value={searchCustomerQuery}
                      onChange={handleSearchCustomerChange}
                      maxLength={500}
                      placeholder="Tìm kiếm khách hàng"
                      className="w-full px-4 pl-[40px] py-2 bg-[#e9ecf2] border-0 rounded-lg focus:outline-none focus:border-purple-500 text-[17px] text-[#3c3c43b2] text-opacity-70 font-normal ml-1"
                      onFocus={() => {
                        setIsPopupVisible(true);
                      }}
                    />
                  </div>
                </div>
              )}

              {isPopupVisible && (
                <PopupCustomers
                  onSelectCustomer={handleSelectCustomer}
                  onClose={() => setIsPopupVisible(false)}
                  searchQuery={searchCustomerQuery}
                />
              )}
            </div>

            <div className="flex items-center px-3 2xl:px-6 py-2 2xl:py-4 border-b border-gray-200 justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[17px]">Nguồn: </span>
                <Select
                  options={[
                    { label: "Facebook", value: "facebook" },
                    { label: "Shopee", value: "shopee" },
                    { label: "Tiktok", value: "tiktok" },
                    { label: "Web", value: "web" },
                    { label: "Khác", value: "#" },
                  ]}
                  onSelect={(value) => setOrderSource(value)}
                  defaultValue={orderSource ?? "facebook"}
                  btnClassName="!bg-transparent !text-black !text-[17px] !py-0 h-full"
                  wrapperClassName="h-10 w-[127px] !min-w-0"
                />
              </div>
              {/* <div className="flex justify-center items-center text-center">
                <input
                  type="checkbox"
                  checked={selectedInvoice?.isDelivery ?? false}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setInvoices((prev) =>
                      prev.map((inv) =>
                        inv.id === selectedInvoiceId
                          ? {
                              ...inv,
                              isDelivery: checked,
                              orderSource: checked ? orderSource : null,
                            }
                          : inv
                      )
                    );
                  }}
                  className="w-[22px] h-[22px] mr-2 rounded-[4px] text-[#3c3c4359]"
                />
                <label
                  htmlFor="delivery"
                  className="text-[17px] font-bold text-[#100713]"
                >
                  Giao hàng
                </label>
              </div>
              <div>
                {selectedInvoice?.isDelivery && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[17px]">Nguồn: </span>
                    <Select
                      options={[
                        { label: "Facebook", value: "facebook" },
                        { label: "Shopee", value: "shopee" },
                        { label: "Tiktok", value: "tiktok" },
                        { label: "Web", value: "web" },
                        { label: "Khác", value: "#" },
                      ]}
                      onSelect={(value) => setOrderSource(value)}
                      defaultValue={orderSource ?? "facebook"}
                      btnClassName="!bg-transparent !text-black !text-[17px] !py-0 h-full"
                      wrapperClassName="h-10 w-[127px] !min-w-0"
                    />
                  </div>
                )}
              </div> */}
            </div>

            <div className="flex px-3 2xl:px-6 justify-between items-center mt-2 2xl:mt-4">
              <span className="text-[14px] 2xl:text-[17px] font-normal leading-[11px] 2xl:leading-[22px]">
                Tổng tiền (số lượng:
                <span className="text-[14px] 2xl:text-[17px] font-semibold leading-[11px] 2xl:leading-[22px]">
                  {" "}
                  {selectedInvoice
                    ? selectedInvoice.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )
                    : 0}
                </span>
                )
              </span>
              <span>{finalTotal.toLocaleString("en-US")}</span>
            </div>

            <div
              className="flex px-3 2xl:px-6 justify-between items-center mt-2 2xl:mt-4 text-[14px] 2xl:text-[17px] hover:text-gray-700 cursor-pointer"
              onClick={handleShowDiscountPopup}
            >
              <span className="font-normal text-[14px] 2xl:text-[17px] leading-[11px] 2xl:leading-[22px] text-black">
                Chiết khấu tổng đơn
              </span>
              {/* <span>
              {selectedInvoice?.discountType === "%"
                ? `${selectedInvoice?.discount ?? 0}%`
                : `${(selectedInvoice?.discount ?? 0).toLocaleString("en-ES")} VNĐ`}
              <ChevronRightOutlined />
            </span> */}
              <div className="flex items-center">
                <div
                  className={`relative flex items-center justify-center h-[35px] bg-[#3AA207] text-white font-bold rounded-[4px] pr-[10px] overflow-hidden
                ${
                  selectedInvoice?.discount && selectedInvoice?.discount > 0
                    ? "bg-[#3AA207]"
                    : "bg-gray-400"
                }`}
                  style={{ width: "auto", minWidth: "48px", padding: "0 10px" }}
                >
                  <div className="absolute w-[7px] h-[13px] bg-white left-0 rounded-r-full"></div>
                  <div className="absolute w-[7px] h-[13px] bg-white right-0 rounded-l-full"></div>

                  <span className="text-[15px]">
                    {selectedInvoice?.discountType === "%"
                      ? `${selectedInvoice?.discount ?? 0}%`
                      : `${(selectedInvoice?.discount ?? 0).toLocaleString(
                          "en-ES"
                        )} VND`}
                  </span>
                </div>

                {/* <ChevronRightOutlined className="ml-2 text-gray-500" /> */}
              </div>
            </div>

            <PopupDiscount
              isOpen={isDiscountPopupOpen}
              onClose={handleCloseDiscountPopup}
              onApply={handleApplyDiscountPopup}
            />

            <div>
              <div className="px-3 2xl:px-6 flex justify-between items-center mt-2 2xl:mt-4 text-[14px] 2xl:text-[17px] font-semibold">
                <span className="text-[14px] 2xl:text-[17px] leading-[11px] 2xl:leading-[22px] font-normal">
                  Tiền khách cọc
                </span>
                <input
                  type="text"
                  value={
                    selectedInvoice?.customerDeposit === 0
                      ? ""
                      : selectedInvoice?.customerDeposit.toLocaleString("en-US")
                  }
                  placeholder="0"
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    let deposit = Number(value);
                    if (deposit < 0) deposit = 0;
                    if (deposit > 999999999999) deposit = 999999999999;
                    setInvoices((prev) =>
                      prev.map((inv) =>
                        inv.id === selectedInvoiceId
                          ? { ...inv, customerDeposit: deposit }
                          : inv
                      )
                    );
                  }}
                  className="px-2 py-1 border border-[#3C3C4359] max-w-[170px] focus:outline-none focus:ring-0 bg-transparent rounded-md text-end text-[#100713] text-[14px] 2xl:text-[17px] font-semibold leading-[11px] 2xl:leading-[22px]"
                />
              </div>
              <div className="px-3 2xl:px-6 flex items-center text-sm">
                <select
                  className="text-[#6E5973] text-[14px] 2xl:text-[17px] pl-0 py-0 pr-6 border-none shadow-none focus:ring-0 focus:border-transparent cursor-pointer"
                  style={{
                    backgroundImage: "none",
                  }}
                  value={selectedInvoice?.depositMethod ?? "bank"}
                  onChange={(e) => {
                    const method = e.target.value;
                    setInvoices((prev) =>
                      prev.map((inv) =>
                        inv.id === selectedInvoiceId
                          ? { ...inv, depositMethod: method }
                          : inv
                      )
                    );
                  }}
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="bank">Chuyển khoản</option>
                  <option value="pos">POS</option>
                </select>
                <ArrowDropDownOutlined
                  fontSize="small"
                  className="text-gray-500 -ml-6 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <div className="px-3 2xl:px-6 flex justify-between items-center mt-2 2xl:mt-4 text-[14px] 2xl:text-[17px] font-semibold">
                <span className="text-[14px] 2xl:text-[17px] leading-[11px] 2xl:leading-[22px] font-normal">
                  Tiền khách đưa
                </span>
                <input
                  type="text"
                  value={
                    selectedInvoice?.customerPaid === 0
                      ? ""
                      : selectedInvoice?.customerPaid.toLocaleString("en-US")
                  }
                  placeholder="0"
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    let paid = Number(value);
                    if (paid < 0) paid = 0;
                    if (paid > 999999999999) paid = 999999999999;
                    handleChangeCustomerPaid(paid);
                  }}
                  className="border border-[#3C3C4359] px-2 py-1 focus:outline-none focus:ring-0 bg-transparent max-w-[170px] rounded-md text-end text-[#100713] text-[14px] 2xl:text-[17px] font-semibold leading-[11px] 2xl:leading-[22px]"
                />
              </div>
              <div className="px-3 2xl:px-6 flex items-center text-sm">
                <select
                  className="text-[#6E5973] text-[14px] 2xl:text-[17px] pl-0 py-0 pr-6 border-none shadow-none focus:ring-0 focus:border-transparent cursor-pointer"
                  style={{
                    backgroundImage: "none",
                  }}
                  defaultValue="bank"
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="bank">Chuyển khoản</option>
                  <option value="pos">POS</option>
                </select>
                <ArrowDropDownOutlined
                  fontSize="small"
                  className="text-gray-500 -ml-6 pointer-events-none"
                />
              </div>
            </div>

            {/* <div className="px-6 flex justify-between items-center mt-6 pt-4 text-[17px] border-t border-gray-200">
            <span>Khách phải trả</span>
            <span>{finalTotal.toLocaleString("en-US")}</span>
          </div> */}

            <div className="px-3 2xl:px-6 flex justify-between items-center mt-2 2xl:mt-4 pt-2 2xl:pt-4 text-[14px] 2xl:text-[17px] border-t border-gray-200">
              <span className="font-normal text-[14px] 2xl:text-[17px] leading-[11px] 2xl:leading-[22px] text-black">
                Tiền thừa trả khách
              </span>
              <span className="font-semibold text-[14px] 2xl:text-[17px] leading-[11px] 2xl:leading-[22px] text-black">
                {changeDue.toLocaleString("en-US")}
              </span>
            </div>

            <div className="relative px-3 2xl:px-6">
              {orderNote.length === 0 && (
                <div className="absolute top-[39px] 2xl:top-[63px] px-2 py-3 transform -translate-y-1/2 text-gray-500">
                  <EditOutlined />
                </div>
              )}
              <textarea
                placeholder="      Ghi chú đơn hàng"
                className="w-full h-[120px] p-3 border border-[#3c3c4359] border-opacity-35 rounded-xl text-[14px] 2xl:text-[17px] font-[510] text-[#3c3c4366] mt-4 2xl:mt-10 placeholder:text-[#3c3c4359] placeholder:text-opacity-40"
                value={orderNote}
                maxLength={500}
                onChange={(e) => setOrderNote(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center text-center gap-4 bg-white border-t border-gray-200 -ml-1">
          <div className="p-3 2xl:p-6 flex justify-between gap-2 2xl:gap-4 flex-shrink-0 w-[72.1%] 2xl:w-[73.1%]">
            {/* Nút nằm bên trái */}
            <button
              className="text-[#e50000] hover:underline text-[14px] 2xl:text-[17px] font-semibold leading-[11px] 2xl:leading-[22px] w-[290px]"
              onClick={handleRemoveAllItems}
            >
              Xóa toàn bộ sản phẩm
            </button>

            {/* Wrapper chứa hai nút bên phải */}
            <div className="flex gap-6">
              <button className="bg-none py-[14px] 2xl:py-[17px] rounded-[10px] border border-[#338bff] text-[14px] 2xl:text-[17px] text-[#338bff] font-semibold leading-[11px] 2xl:leading-[22px] w-[290px]">
                Đổi trả hàng
              </button>
              {/* <button
                className="bg-none text-[#338bff] py-[14px] 2xl:py-[17px] rounded-[10px] border border-[#338bff] text-[14px] 2xl:text-[17px] font-semibold leading-[11px] 2xl:leading-[22px] w-[290px]"
                onClick={handleAddService}
              >
                Thêm dịch vụ
              </button> */}
            </div>
          </div>
          <div className="flex justify-center gap-2 2xl:gap-4 w-[26%] border-l border-gray-200 p-3 2xl:p-6">
            <button
              className="bg-[#DEE9FC] text-[#17489E] px-3 py-[8px] 2xl:py-[17px] rounded-[10px] hover:bg-blue-200 text-[13px] 2xl:text-[15px] font-semibold leading-[15px] 2xl:leading-[22px] w-[218px]"
              onClick={handleShowMethodPopup}
            >
              Phương thức thanh toán
            </button>
            <PopupMethod
              isOpen={isMethodPopupOpen}
              onClose={handleCloseMethodPopup}
              finalTotal={finalTotal}
            />
            <button
              className="bg-[#0061FD] text-white px-3 py-[17px] rounded-[10px] hover:bg-blue-400 text-[15px] font-semibold leading-[22px] w-[218px]"
              onClick={handleShowPaymentPopup}
            >
              Thanh toán
            </button>
            <PopupPayment
              isOpen={isPaymentPopupOpen}
              onClose={handleClosePaymentPopup}
              onConfirm={handlePayment}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const POSPage: React.FC = () => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error(event.error);
      setHasError(true);
      event.preventDefault();
    };

    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="relative mx-auto flex w-full max-w-[530px]">
          <Error404 />
        </div>
      </div>
    );
  }

  try {
    return <CreateInvoiceForm />;
  } catch (error) {
    console.error(error);
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="relative mx-auto flex w-full max-w-[530px]">
          <Error404 />
        </div>
      </div>
    );
  }
};

export default POSPage;