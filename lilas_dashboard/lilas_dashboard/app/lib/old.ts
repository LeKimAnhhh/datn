import {
    Account,
    Supplier,
    Customer,
    CustomerGroup,
    Invoice,
    InvoiceListResponse,
    Employee,
    Product,
    ProductResponse,
    ProductGroupResponse,
    Purchase,
    DeliveryListResponse,
    DeliveryResponse,
    ShopResponse,
    DeliveryCreate,
    RevenueSummary,
    ReturnBill,
    TransactionTranferCreate, 
    TransactionTranferUpdate,
    TransactionTranferResponse,
    TransactionTranferListResponse,
  } from "@/app/lib/definitions";
  import { getApiUrl } from "@/app/lib/utils";
  import { getErrorMessage, getDynamicErrorMessage } from "@/app/lib/errorMessages";
  
  //Product
  export async function fetchProducts(
    token: string,
    skip: number,
    limit: number,
    search?: string
  ): Promise<{ total_products: number; products: Product[] }> {
    let url = `${getApiUrl("products/products")}?skip=${skip}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
  
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch products"));
    }
    return await res.json();
  }
  
  export async function fetchProductsName(
    token: string,
    skip: number = 0,
    limit: number = 10,
    search?: string
  ): Promise<{ total_products: number; products: any[] }> {
    let url = getApiUrl(`products/products_name?skip=${skip}&limit=${limit}`);
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể lấy danh sách sản phẩm"));
    }
    return await res.json();
  }
  
  export async function fetchProductsNameImport(
    token: string,
    skip: number = 0,
    limit: number = 10,
    search?: string
  ): Promise<{ total_products: number; products: any[] }> {
    let url = getApiUrl(`products/products_name_import?skip=${skip}&limit=${limit}`);
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể lấy danh sách sản phẩm"));
    }
    return await res.json();
  }
  
  export async function fetchProductDetail(
    token: string,
    productId: string
  ): Promise<ProductResponse> {
    const url = getApiUrl(`products/product/${productId}`);
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || `Không tìm thấy sản phẩm ID = ${productId}`));
    }
    return await res.json();
  }
  
  // export async function createProduct(
  //   token: string,
  //   queryParams: URLSearchParams,
  //   formData: FormData
  // ): Promise<ProductResponse> {
  //   const url = `${getApiUrl("products/products")}?${queryParams.toString()}`;
  //   const res = await fetch(url, {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: formData,
  //   });
  //   if (!res.ok) {
  //     const errorData = await res.json();
  //     throw new Error(errorData.detail || "Failed to create product");
  //   }
  //   return await res.json();
  // }
  
  export async function createProduct(
    token: string,
    formData: FormData
  ): Promise<ProductResponse> {
    const url = getApiUrl("products/products");
  
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Tạo sản phẩm thất bại."));
    }
    return await res.json();
  }
  
  export async function updateProduct(
    token: string,
    productId: string,
    formData: FormData
  ): Promise<ProductResponse> {
    const url = getApiUrl(`products/products/${productId}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Cập nhật tài khoản thất bại."));
    }
    return await res.json();
  }
  
  export async function deleteProductAPI(
    token: string,
    productId: string
  ): Promise<ProductResponse> {
    const url = getApiUrl(`products/products/${productId}`);
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Xóa sản phẩm thất bại."));
    }
    return await res.json();
  }
  
  export async function activateProduct(
    token: string,
    productId: string
  ): Promise<ProductResponse> {
    const url = getApiUrl(`products/products/${productId}/activate`);
  
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || `Không thể kích hoạt sản phẩm ID = ${productId}`
      ));
    }
  
    return await res.json();
  }
  
  export async function deactivateProduct(
    token: string,
    productId: string
  ): Promise<{ success: boolean; msg?: string }> {
    const url = getApiUrl(`products/deactivate_product/${productId}`);
  
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || `Không thể vô hiệu hóa sản phẩm ID = ${productId}`
      ));
    }
    return { success: true, ...(await res.json()) };
  }
  
  export async function fetchProductGroups(
    token: string,
    skip: number,
    limit: number,
    search?: string
  ): Promise<{
    total_groups: number;
    groups: ProductGroupResponse[];
  }> {
    let url = `${getApiUrl(
      "products/get_groups_product"
    )}?skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
  
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch product groups"));
    }
    return await res.json();
  }
  
  export async function createProductGroup(
    token: string,
    payload: { name: string; description?: string }
  ) {
    const url = getApiUrl("products/create_group_product");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to create product group"));
    }
    return await res.json();
  }
  
  export async function updateProductGroup(
    token: string,
    oldGroupName: string,
    payload: { name: string; description?: string }
  ) {
    const url = getApiUrl(`products/update_groups_product/${oldGroupName}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to update product group"));
    }
    return await res.json();
  }
  
  export async function deleteProductGroup(token: string, groupName: string) {
    const url = getApiUrl(`products/delete_group_product/${groupName}`);
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to delete product group"));
    }
    return await res.json();
  }
  
  export async function fetchTotalInventoryValue(warehouse?: string): Promise<{
    warehouse: string;
    total_products: number;
    total_stock: number;
    total_stock_value: number;
  }> {
    let url = getApiUrl(`products/total_inventory_value`);
    if (warehouse) {
      url += `?warehouse=${encodeURIComponent(warehouse)}`;
    }
  
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể lấy tổng giá trị hàng tồn kho"));
    }
    return await res.json();
  }
  
  // invoices
  export async function createInvoice(token: string, payload: any): Promise<any> {
    const url = getApiUrl("invoices/invoices");
  
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      const dynamicErrorMessage = getDynamicErrorMessage(detail);    
      if (dynamicErrorMessage) {
          throw new Error(dynamicErrorMessage);
      }
      throw new Error(getErrorMessage(detail|| "Failed to fetch invoice details"));
    }
  
    return await res.json();
  }
  
  export async function updateInvoice(
    token: string,
    invoiceId: string,
    payload: any
  ): Promise<any> {
    const url = getApiUrl(`invoices/invoices/${invoiceId}`);
  
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      const dynamicErrorMessage = getDynamicErrorMessage(detail);    
      if (dynamicErrorMessage) {
          throw new Error(dynamicErrorMessage);
      }
      throw new Error(getErrorMessage(detail|| "Cập nhật đơn hàng thất bại"));
    }
    return await res.json();
  }
  
  export async function fetchInvoices(
    token: string,
    rowsPerPage: number,
    currentPage: number,
    search?: string
  ): Promise<InvoiceListResponse> {
    const skip = (currentPage - 1) * rowsPerPage;
    let url = `${getApiUrl(
      "invoices/invoices"
    )}?limit=${rowsPerPage}&skip=${skip}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
  
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch invoices"));
    }
    return await res.json();
  }
  
  export async function fetchInvoiceDetail(
    token: string,
    invoiceId: string
  ): Promise<Invoice> {
    try {
      const url = getApiUrl(`invoices/invoices/${invoiceId}`);
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
  
      if (!res.ok) {
        const { detail } = await res.json();
        throw new Error(getErrorMessage(detail || "Failed to fetch invoice details"));
      }
  
      return await res.json();
    } catch (error) {
      console.error("Fetch Invoice Detail Error:", error);
      throw error;
    }
  }
  
  export async function cancelInvoice(
    token: string,
    invoiceId: string
  ): Promise<void> {
    const url = getApiUrl(`invoices/invoices/cancel/${invoiceId}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to cancel invoice"));
    }
  }
  
  export async function getActiveTransactionsInvoices(
    token: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<InvoiceListResponse> {
    const url = getApiUrl(`invoices/active-transactions?limit=${limit}&skip=${skip}`);
  
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || 'Failed to fetch active transactions invoices'));
    }
    return await res.json() as InvoiceListResponse;
  }
  //employee
  export async function fetchEmployeeData(
    token: string,
    rowsPerPage: number,
    currentPage: number,
    query?: string
  ): Promise<{ total_users: number; users: Employee[] }> {
    const skip = (currentPage - 1) * rowsPerPage;
    let url = `${getApiUrl("users/get_user")}?limit=${rowsPerPage}&skip=${skip}`;
    if (query) {
      url += `&search=${encodeURIComponent(query)}`;
    }
  
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!response.ok) {
      const { detail } = await response.json();
      throw new Error(getErrorMessage(detail || "Lấy danh sách nhân viên thất bại"));
    }
  
    const data = await response.json();
    return data;
  }
  
  export async function createEmployee(
    token: string,
    payload: Omit<
      Employee,
      "id" | "active" | "total_orders" | "total_revenue" | "created_at"
    >
  ): Promise<Employee> {
    const url = getApiUrl("users/users");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      const { detail } = await response.json();
      throw new Error(getErrorMessage(detail || "Tạo nhân viên thất bại"));
    }
  
    return await response.json();
  }
  
  export async function fetchEmployeeDetails(employeeId: string, token: string) {
    const url = getApiUrl(`users/employee/${employeeId}?user_id=${employeeId}`);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      const { detail } = await response.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch employee details"));
    }
  
    return await response.json();
  }
  
  export async function updateEmployeeDetails(
    employeeId: string,
    payload: any,
    token: string
  ) {
    const url = getApiUrl(`users/user/${employeeId}`);
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      const { detail } = await response.json();
      throw new Error(getErrorMessage(detail || "Failed to update employee details"));
    }
  
    return await response.json();
  }
  
  // CUSTOMER
  export async function fetchCustomersData(
    token: string,
    rowsPerPage: number,
    currentPage: number,
    query?: string
  ): Promise<{
    total_customers: number;
    customers: Customer[];
  }> {
    const skip = (currentPage - 1) * rowsPerPage;
    let url = `${getApiUrl(
      "customers/customers"
    )}?limit=${rowsPerPage}&skip=${skip}`;
    if (query) {
      url += `&search=${encodeURIComponent(query)}`;
    }
  
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch customer data"));
    }
    return await res.json();
  }
  
  export async function fetchTopCustomers(token: string): Promise<Customer[]> {
    const url = getApiUrl("customers/top?limit=5");
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch top customers"));
    }
  
    return await res.json();
  }
  
  export async function createCustomer(
    token: string,
    payload: any
  ): Promise<Customer> {
    const url = getApiUrl("customers/customers");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Tạo khách hàng thất bại."));
    }
    return await res.json();
  }
  
  export async function getCustomerById(
    token: string,
    customerId: string
  ): Promise<Customer> {
    const url = getApiUrl(`customers/customers/${customerId}`);
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch customer detail"));
    }
    return await res.json();
  }
  
  export async function updateCustomer(
    token: string,
    customerId: string,
    payload: any
  ): Promise<Customer> {
    const url = getApiUrl(`customers/customers/${customerId}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to update customer"));
    }
    return await res.json();
  }
  
  export async function payCustomerAmount(
    token: string,
    customerId: string,
    payAmount: number
  ): Promise<{ msg: string }> {
    const url = getApiUrl(`customers/customers/${customerId}/pay-amount?pay_for_customer=${payAmount}`);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to process payment amount"));
    }
    return await res.json();
  }
  
  export async function payCustomerTransaction(
    token: string,
    customerId: string,
    invoiceId: string
  ): Promise<any> {
    const url = getApiUrl(`customers/customers/${customerId}/pay?invoice_id=${invoiceId}`);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to process payment transaction"));
    }
    return await res.json();
  }
  
  // SUPPLIER
  export async function fetchSuppliersData(
    token: string,
    rowsPerPage: number,
    currentPage: number,
    query?: string
  ): Promise<{
    total_suppliers: number;
    suppliers: Supplier[];
  }> {
    const skip = (currentPage - 1) * rowsPerPage;
    let url = `${getApiUrl(
      "suppliers/suppliers"
    )}?limit=${rowsPerPage}&skip=${skip}`;
    if (query) {
      url += `&search=${encodeURIComponent(query)}`;
    }
  
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch supplier data"));
    }
    return await res.json();
  }
  
  export async function createSuppliers(
    token: string,
    payload: any
  ): Promise<Supplier> {
    const url = getApiUrl("suppliers/suppliers");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to create supplier"));
    }
    return await res.json();
  }
  
  export async function getSuppliersById(
    token: string,
    supplierId: string
  ): Promise<Supplier> {
    const url = getApiUrl(`suppliers/suppliers/${supplierId}`);
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch supplier detail"));
    }
    return await res.json();
  }
  
  export async function updateSupplier(
    token: string,
    supplierId: string,
    payload: any
  ): Promise<Supplier> {
    const url = getApiUrl(`suppliers/suppliers/${supplierId}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to update supplier"));
    }
    return await res.json();
  }
  
  export async function deactivateSupplier(
    token: string,
    supplierId: string
  ): Promise<void> {
    const url = getApiUrl(`suppliers/deactivate_supplier/${supplierId}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to deactivate supplier"));
    }
  }
  
  export async function paySupplierAmount(
    token: string,
    supplierId: string,
    payAmount: number
  ): Promise<{ msg: string }> {
    const url = getApiUrl(`suppliers/suppliers/${supplierId}/pay-amount?pay_for_supplier=${payAmount}`);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to process payment"));
    }
    return await res.json();
  }
  
  export async function payImportBill(
    token: string,
    billId: string,
    payAmount: number
  ): Promise<{ msg: string; bill_status: string; paid_amount: number }> {
    const url = getApiUrl(`import_inspection/import_bills/${billId}/pay?amount=${payAmount}`);
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to process payment for import bill"));
    }
  
    return await res.json();
  }
  
  // CUSTOMER GROUP
  export async function fetchCustomerGroupsData(
    token: string,
    rowsPerPage: number,
    currentPage: number,
    query?: string
  ): Promise<{
    total_groups: number;
    groups: CustomerGroup[];
  }> {
    const skip = (currentPage - 1) * rowsPerPage;
    let url = `${getApiUrl(
      "customers/groups"
    )}?limit=${rowsPerPage}&skip=${skip}`;
    if (query) {
      url += `&search=${encodeURIComponent(query)}`;
    }
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch customer groups"));
    }
    return await res.json();
  }
  
  export async function createCustomerGroup(
    token: string,
    payload: any
  ): Promise<CustomerGroup> {
    const url = getApiUrl("customers/groups");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to create customer group"));
    }
    return await res.json();
  }
  
  export async function getCustomerGroups(
    token: string
  ): Promise<CustomerGroup[]> {
    const url = getApiUrl("customers/groups");
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const { detail } = await response.json();
      throw new Error(getErrorMessage(detail || "Failed to get customer group"));
    }
    const data = await response.json();
    return data.groups;
  }
  
  export async function getCustomerGroupById(
    token: string,
    groupId: number
  ): Promise<CustomerGroup> {
    const url = getApiUrl(`customers/groups/${groupId}`);
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch group detail"));
    }
    return await res.json();
  }
  
  export async function updateCustomerGroup(
    token: string,
    groupId: number,
    payload: any
  ): Promise<CustomerGroup> {
    const url = getApiUrl(`customers/groups/${groupId}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to update group"));
    }
    return await res.json();
  }
  
  export async function deleteCustomerGroup(token: string, groupId: number) {
    const url = getApiUrl(`customers/groups/${groupId}`);
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const { detail } = await response.json();
      throw new Error(getErrorMessage(detail || "Failed to delete group"));
    }
  }
  
  // Account
  export async function fetchAccountsData(
    token: string,
    rowsPerPage: number,
    currentPage: number,
    query?: string
  ): Promise<{
    total_accounts: number;
    accounts: Account[];
  }> {
    const skip = (currentPage - 1) * rowsPerPage;
    let url = `${getApiUrl("users/accounts")}?limit=${rowsPerPage}&skip=${skip}`;
    if (query) {
      url += `&search=${encodeURIComponent(query)}`;
    }
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch accounts"));
    }
  
    return await res.json();
  }
  
  export async function fetchAccountById(
    token: string,
    accountId: string
  ): Promise<Account> {
    const url = getApiUrl(`users/account/${accountId}`);
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch account"));
    }
  
    return await res.json();
  }
  
  export async function createAccount(
    token: string,
    payload: any
  ): Promise<Account> {
    const url = getApiUrl("users/signup");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to create account"));
    }
  
    return await res.json();
  }
  
  export async function loginUser(
    username: string,
    password: string
  ): Promise<Account> {
    const url = getApiUrl("users/signin");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to login"));
    }
  
    return res.json();
  }
  
  export async function signOutUser(): Promise<void> {
    const url = getApiUrl("users/signout");
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
    });
  
    if (!response.ok) {
      const { detail } = await response.json();
      throw new Error(getErrorMessage(detail || "Sign-out failed"));
    }
  }
  
  export async function updateAccount(
    token: string,
    accountId: string,
    payload: any
  ): Promise<Account> {
    const url = getApiUrl(`users/update_account/${accountId}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to update account"));
    }
  
    return await res.json();
  }
  
  export async function changeAccountPassword(
    token: string,
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
  ): Promise<Account> {
    const url = getApiUrl("users/change_password");
    const payload = {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword,
    };
  
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to change password"));
    }
  
    return await res.json();
  }
  
  //import bill
  export async function fetchPurchases(
    token: string,
    skip: number,
    limit: number,
    search?: string
  ): Promise<{
    total_import_bills: number;
    import_bills: Purchase[];
  }> {
    let url = `${getApiUrl(
      "import_inspection/import_bills"
    )}?skip=${skip}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch purchases"));
    }
    return await res.json();
  }
  
  export async function createPurchase(token: string, payload: any) {
    const url = getApiUrl("import_inspection/import_bills");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to create purchase"));
    }
    return await res.json();
  }
  
  export async function getPurchaseById(
    token: string,
    billId: string
  ): Promise<Purchase> {
    const url = getApiUrl(`import_inspection/import_bills/${billId}`);
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch purchase detail"));
    }
    return await res.json();
  }
  
  export async function updatePurchase(
    token: string,
    billId: string,
    payload: any
  ): Promise<Purchase> {
    const url = getApiUrl(`import_inspection/import_bills/${billId}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to update purchase"));
    }
    return await res.json();
  }
  
  export async function cancelPurchase(
    token: string,
    billId: string
  ): Promise<Purchase> {
    const url = getApiUrl(`import_inspection/import_bills/${billId}/cancel`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to cancel purchase"));
    }
    return await res.json();
  }
  
  export async function confirmImportBill(
    token: string, 
    billId: string
  ): Promise<Purchase> {
    const url = getApiUrl(`import_inspection/import_bills/${billId}/confirm_import`);
    const res = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to confirm import bill"));
    }
    return await res.json();
  }
  
  //inspection
  export async function fetchInspections(
    token: string,
    skip: number,
    limit: number,
    search?: string
  ) {
    const params = new URLSearchParams();
    params.set("skip", String(skip));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
  
    const url = getApiUrl(`import_inspection/inspection_reports?${params}`);
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Fetch inspection reports failed"));
    }
    return await res.json();
  }
  
  export async function createInspection(token: string, data: any) {
    const url = getApiUrl(`import_inspection/inspection_reports`);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Create inspection failed"));
    }
    return await res.json();
  }
  
  export async function getInspectionById(token: string, reportId: string) {
    const url = getApiUrl(`import_inspection/inspection_reports/${reportId}`);
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Get inspection detail failed"));
    }
    return await res.json();
  }
  
  export async function updateInspection(
    token: string,
    reportId: string,
    data: any
  ) {
    const url = getApiUrl(`import_inspection/inspection_reports/${reportId}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Update inspection failed"));
    }
    return await res.json();
  }
  
  export async function getInspectionHistory(token: string, reportId: string) {
    const url = getApiUrl(
      `import_inspection/inspection_reports/${reportId}/history`
    );
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      return [];
    }
    return await res.json();
  }
  
  export async function completeInspection(token: string, reportId: string) {
    const url = getApiUrl(
      `import_inspection/inspection_reports/${reportId}/complete`
    );
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Complete inspection failed"));
    }
    return await res.json();
  }
  
  // delivery
  // export async function fetchDeliveries(): Promise<DeliveryListResponse[]> {
  //   const url = getApiUrl(`deliveries/deliveries`);
  //   const res = await fetch(url, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  //   if (!res.ok) {
  //     const errText = await res.text();
  //     throw new Error(errText || "Không thể lấy danh sách đơn vận chuyển");
  //   }
  //   return res.json();
  // }
  
  export async function fetchDeliveries(
    token: string,
    skip: number,
    limit: number,
    search?: string
  ): Promise<{ total_deliveries: number; deliveries: DeliveryListResponse[] }> {
    let url = `${getApiUrl("deliveries/deliveries")}?skip=${skip}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
  
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể lấy danh sách đơn vận chuyển"));
    }
    return await res.json();
  }
  
  export async function fetchDeliveryDetail(
    orderCode: string
  ): Promise<DeliveryResponse> {
    const url = getApiUrl(`deliveries/deliveries/${orderCode}`);
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      // const { detail } = await res.json();
      // throw new Error(getErrorMessage(detail || "Không thể load chi tiết đơn vận chuyển"));
      const error = await res.json();
      throw new Error(error.detail);
    }
    return res.json();
  }
  
  export async function createShop(token: string, shopData: {
    name: string;
    address: string;
    province_id: number;
    district_id: number;
    ward_code: string;
    phone: string;
  }): Promise<ShopResponse> {
    const url = getApiUrl("deliveries/create_shop");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(shopData),
    });
  
    if (!res.ok) {
      // const error = await res.json();
      // throw new Error(error.detail);
      const error = await res.json();
      const errorMessage = getErrorMessage(error.detail);
      throw new Error(errorMessage !== error.detail ? errorMessage : error.detail);
    }
    return res.json();
  }
  
  export async function fetchShops(): Promise<ShopResponse[]> {
    const url = getApiUrl(`deliveries/list_shop?skip=0&limit=10`);
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      // const error = await res.json();
      // throw new Error(error.detail);
      const error = await res.json();
      const errorMessage = getErrorMessage(error.detail);
      throw new Error(errorMessage !== error.detail ? errorMessage : error.detail);
    }
    return res.json();
  }
  
  export async function createTransportOrder(
    invoiceId: string,
    shopID: number,
    payload: DeliveryCreate
  ) {
    const url = getApiUrl(
      `deliveries/create_order/${invoiceId}?shop_id=${encodeURIComponent(shopID)}`
    );
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      // const { detail } = await res.json();
      // throw new Error(getErrorMessage(detail || "Tạo đơn vận chuyển thất bại"));
      // const error = await res.json();
      // throw new Error(error.detail);
      const error = await res.json();
      const errorMessage = getErrorMessage(error.detail);
      throw new Error(errorMessage !== error.detail ? errorMessage : error.detail);
    }
    return res.json();
  }
  
  export async function fetchPickShifts(): Promise<
    { id: number; title: string; from_time: number; to_time: number }[]
  > {
    const url = getApiUrl(`deliveries/ghn/pickshifts`);
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể lấy danh sách ca lấy"));
    }
    const data = await res.json();
    return data?.data || [];
  }
  
  export async function fetchProvinces(): Promise<{ ProvinceID: number; ProvinceName: string }[]> {
    const url = getApiUrl(`deliveries/ghn/provinces`);
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể lấy danh sách tỉnh"));
    }
    const data = await res.json();
    return data?.data || [];
  }
  
  export async function fetchDistricts(provinceId: number): Promise<{ DistrictID: number; DistrictName: string }[]> {
    const url = getApiUrl(`deliveries/ghn/districts/${provinceId}`);
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể lấy danh sách quận/huyện"));
    }
    const data = await res.json();
    return data?.data || [];
  }
  
  export async function fetchWards(districtId: number): Promise<{ WardCode: string; WardName: string }[]> {
    const url = getApiUrl(`deliveries/ghn/wards/${districtId}`);
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể lấy danh sách phường/xã"));
    }
    const data = await res.json();
    return data?.data || [];
  }
  
  export async function fetchPickupTime(orderCode: string): Promise<string> {
    const url = getApiUrl(`deliveries/pickup_time/${orderCode}`);
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail|| "Không thể lấy thời gian dự kiến lấy hàng"));
    }
    const data = await res.json();
    return data?.pickup_time || "";
  }
  
  export async function fetchRevenueSummary(
    token: string,
    date: number = 0
  ): Promise<RevenueSummary> {
    const url = `${getApiUrl("invoices/revenue")}?days=${date}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể lấy dữ liệu doanh thu"));
    }
  
    return await res.json();
  }
  
  export async function fetchTotalRevenueByDelivery(
    token: string,
    date: number = 0
  ): Promise<{
    date_range: string;
    total_revenue_by_group: Record<string, number>;
    total_od_by_group: Record<string, number>;
  }> {
    const url = `${getApiUrl("deliveries/total_revenue_delivery")}?date=${date}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể lấy dữ liệu doanh thu vận chuyển"));
    }
    return await res.json();
  }
  
  export async function updateOrderFee(
    shopId: number,
    orderCode: string
  ): Promise<{ message: string; order_code: string; service_fee: number }> {
    const url = getApiUrl("deliveries/update-order-fee/");
    const res = await fetch(
      `${url}?shop_id=${shopId}&order_code=${encodeURIComponent(orderCode)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể cập nhật phí dịch vụ"));
    }
    return await res.json();
  }
  
  export async function fetchTopRevenue(
    token: string,
    date: number = 0
  ): Promise<{
    revenue_per_period: Record<string, number>;
    total_deliveries_per_period: Record<string, number>;
    profit_per_period: Record<string, number>;
    top_product_per_period: { product: string; quantity: number }[];
  }> {
    const url = `${getApiUrl("invoices/top_revenue")}?date=${date}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể lấy dữ liệu doanh thu"));
    }
    return await res.json();
  }
  
  // return
  export async function fetchReturnBills(
    token: string,
    skip: number,
    limit: number,
    search?: string
  ): Promise<{
    total_return_bills: number;
    return_bills: ReturnBill[];
  }> {
    let url = `${getApiUrl("import_inspection/return_bills")}?skip=${skip}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể lấy dữ liệu phiếu trả hàng"));
    }
    return await res.json();
  }
  
  export async function createReturnBill(token: string, payload: any) {
    const url = getApiUrl("import_inspection/return_bills");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const { detail } = await res.json();
      const dynamicErrorMessage = getDynamicErrorMessage(detail);    
      if (dynamicErrorMessage) {
          throw new Error(dynamicErrorMessage);
      }
      throw new Error(getErrorMessage(detail|| "Không thể tạo phiếu trả hàng"));
    }
    return await res.json();
  }
  
  export async function getReturnBillById(token: string, returnId: string) {
    const url = getApiUrl(`import_inspection/return_bills/${returnId}`);
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể lấy chi tiết phiếu trả hàng"));
    }
    return await res.json();
  }
  
  export async function updateReturnBill(token: string, returnId: string, payload: any) {
    const url = getApiUrl(`import_inspection/return_bills/${returnId}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const { detail } = await res.json();
      const dynamicErrorMessage = getDynamicErrorMessage(detail);    
      if (dynamicErrorMessage) {
          throw new Error(dynamicErrorMessage);
      }
      throw new Error(getErrorMessage(detail|| "Không thể cập nhật phiếu trả hàng"));
    }
    return await res.json();
  }
  
  export async function confirmReturnBill(token: string, returnId: string) {
    const url = getApiUrl(`import_inspection/return_bills/${returnId}/confirm`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Không thể xác nhận phiếu trả hàng"));
    }
    return await res.json();
  }
  
  export async function cancelReturnBill(
    token: string,
    returnBillId: string
  ): Promise<ReturnBill> {
    const url = getApiUrl(`import_inspection/return_bills/${returnBillId}/cancel`);
  
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || 'Failed to cancel return bill'));
    }
    return await res.json();
  }
  
  export async function printOrder(
    token: string,
    orderCode: string
  ): Promise<string> {
    const url = getApiUrl(`deliveries/print_order/${orderCode}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || 'Failed to get print order token'));
    }
    return await res.text();
  }
  
  //Transfer
  export async function createTransferStock(
    token: string,
    payload: TransactionTranferCreate
  ): Promise<TransactionTranferResponse> {
    const url = getApiUrl("products/transfer_stock");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const { detail } = await res.json();
      const dynamicErrorMessage = getDynamicErrorMessage(detail);
      if (dynamicErrorMessage) {
        throw new Error(dynamicErrorMessage);
      }
      throw new Error(getErrorMessage(detail || "Failed to create transfer"));
    }
    return await res.json();
  }
  
  export async function fetchTransferStocks(
    token: string,
    skip: number,
    limit: number,
    search?: string
  ): Promise<TransactionTranferListResponse> {
    let url = `${getApiUrl("products/transfer_stock")}?limit=${limit}&skip=${skip}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to fetch transfer stocks"));
    }
    return await res.json();
  }
  
  export async function getTransferStockById(
    token: string,
    id: string
  ): Promise<TransactionTranferResponse> {
    const url = getApiUrl(`products/transfer_stock/${id}`);
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Transfer stock not found"));
    }
  
    return await res.json();
  }
  
  export async function updateTransferStock(
    token: string,
    id: string,
    payload: TransactionTranferUpdate
  ): Promise<TransactionTranferResponse> {
    const url = getApiUrl(`products/transfer_stock/${id}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      const dynamicErrorMessage = getDynamicErrorMessage(detail);
      if (dynamicErrorMessage) {
        throw new Error(dynamicErrorMessage);
      }
      throw new Error(getErrorMessage(detail || "Failed to update transfer"));
    }
  
    return await res.json();
  }
  
  export async function completeTransferStock(
    token: string,
    id: string
  ): Promise<TransactionTranferResponse> {
    const url = getApiUrl(`products/transfer_stock/${id}/complete`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      const dynamicErrorMessage = getDynamicErrorMessage(detail);
      if (dynamicErrorMessage) {
        throw new Error(dynamicErrorMessage);
      }
      throw new Error(getErrorMessage(detail || "Failed to complete transfer"));
    }
  
    return await res.json();
  }
  
  export async function cancelTransferStock(
    token: string,
    id: string
  ): Promise<TransactionTranferResponse> {
    const url = getApiUrl(`products/transfer_stock/${id}`);
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to delete transfer"));
    }
  
    return await res.json();
  }
  
  export async function changeTransferStockStatus(
    token: string,
    id: string
  ): Promise<TransactionTranferResponse> {
    const url = getApiUrl(`products/change_status_transfer_stock/${id}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!res.ok) {
      const { detail } = await res.json();
      throw new Error(getErrorMessage(detail || "Failed to change transfer status"));
    }
  
    return await res.json();
  }