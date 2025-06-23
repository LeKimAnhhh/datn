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

async function doRequest(
  url: string,
  options: RequestInit,
  customErrorMsg?: string,
  useDynamicErrorMessage?: boolean,
  forPrint?: boolean,
) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const { detail } = await response.json();
    if (useDynamicErrorMessage) {
      const dynamicErrorMessage = getDynamicErrorMessage(detail);
      if (dynamicErrorMessage) {
        throw new Error(dynamicErrorMessage);
      }
    }
    throw new Error(getErrorMessage(detail || customErrorMsg || "Request failed"));
  }
  // return await response.json();
  if(forPrint) return await response.text();

  return await response.json();
}

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

  const res = await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to fetch products");
  return res;
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
  return await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Không thể lấy danh sách sản phẩm");
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
  return await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Không thể lấy danh sách sản phẩm");
}

export async function fetchProductDetail(
  token: string,
  productId: string
): Promise<ProductResponse> {
  const url = getApiUrl(`products/product/${productId}`);
  return await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, `Không tìm thấy sản phẩm ID = ${productId}`);
}

export async function createProduct(
  token: string,
  formData: FormData
): Promise<ProductResponse> {
  const url = getApiUrl("products/products");
  return await doRequest(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }, "Tạo sản phẩm thất bại.");
}

export async function updateProduct(
  token: string,
  productId: string,
  formData: FormData
): Promise<ProductResponse> {
  const url = getApiUrl(`products/products/${productId}`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }, "Cập nhật tài khoản thất bại.");
}

export async function deleteProductAPI(
  token: string,
  productId: string
): Promise<ProductResponse> {
  const url = getApiUrl(`products/products/${productId}`);
  return await doRequest(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Xóa sản phẩm thất bại.");
}

export async function activateProduct(
  token: string,
  productId: string
): Promise<ProductResponse> {
  const url = getApiUrl(`products/products/${productId}/activate`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, `Không thể kích hoạt sản phẩm ID = ${productId}`);
}

export async function deactivateProduct(
  token: string,
  productId: string
): Promise<{ success: boolean; msg?: string }> {
  const url = getApiUrl(`products/deactivate_product/${productId}`);
  return { success: true, ...(await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, `Không thể vô hiệu hóa sản phẩm ID = ${productId}`)) };
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

  return await doRequest(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to fetch product groups");
}

export async function createProductGroup(
  token: string,
  payload: { name: string; description?: string }
) {
  const url = getApiUrl("products/create_group_product");
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }, "Failed to create product group");
}

export async function updateProductGroup(
  token: string,
  oldGroupName: string,
  payload: { name: string; description?: string }
) {
  const url = getApiUrl(`products/update_groups_product/${oldGroupName}`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }, "Failed to update product group");
}

export async function deleteProductGroup(token: string, groupName: string) {
  const url = getApiUrl(`products/delete_group_product/${groupName}`);
  return await doRequest(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to delete product group");
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

  return await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }, "Không thể lấy tổng giá trị hàng tồn kho");
}

// invoices
export async function createInvoice(token: string, payload: any): Promise<any> {
  const url = getApiUrl("invoices/invoices");
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }, "Failed to fetch invoice details", true);
}

export async function updateInvoice(
  token: string,
  invoiceId: string,
  payload: any
): Promise<any> {
  const url = getApiUrl(`invoices/invoices/${invoiceId}`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }, "Cập nhật đơn hàng thất bại", true);
}

export async function fetchInvoices(
  token: string,
  rowsPerPage: number,
  currentPage: number,
  search?: string,
  statuses?: string[]
): Promise<InvoiceListResponse> {
  const skip = (currentPage - 1) * rowsPerPage;
  let url = `${getApiUrl(
    "invoices/invoices"
  )}?limit=${rowsPerPage}&skip=${skip}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  if(statuses && statuses.length > 1) {
    for (const status of statuses) {
      url += `&statuses=${encodeURIComponent(status)}`;
    }
  }

  return await doRequest(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to fetch invoices");
}

export async function fetchInvoiceDetail(
  token: string,
  invoiceId: string
): Promise<Invoice> {
  try {
    const url = getApiUrl(`invoices/invoices/${invoiceId}`);
    return await doRequest(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }, "Failed to fetch invoice details");
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
  await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Failed to cancel invoice");
}

export async function confirmInvoice(
  token: string,
  invoiceId: string
): Promise<void> {
  const url = getApiUrl(`invoices/invoices/confirm/${invoiceId}`);
  await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Failed to confirm invoice");
}

export async function getActiveTransactionsInvoices(
  token: string,
  limit: number = 10,
  skip: number = 0
): Promise<InvoiceListResponse> {
  const url = getApiUrl(`invoices/active-transactions?limit=${limit}&skip=${skip}`);
  return await doRequest(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  }, 'Failed to fetch active transactions invoices');
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

  return await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Lấy danh sách nhân viên thất bại");
}

export async function createEmployee(
  token: string,
  payload: Omit<
    Employee,
    "id" | "active" | "total_orders" | "total_revenue" | "created_at"
  >
): Promise<Employee> {
  const url = getApiUrl("users/users");
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }, "Tạo nhân viên thất bại");
}

export async function fetchEmployeeDetails(employeeId: string, token: string) {
  const url = getApiUrl(`users/employee/${employeeId}?user_id=${employeeId}`);
  return await doRequest(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }, "Failed to fetch employee details");
}

export async function updateEmployeeDetails(
  employeeId: string,
  payload: any,
  token: string
) {
  const url = getApiUrl(`users/user/${employeeId}`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }, "Failed to update employee details");
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

  return await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to fetch customer data");
}

export async function fetchTopCustomers(token: string): Promise<Customer[]> {
  const url = getApiUrl("customers/top?limit=5");
  return await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to fetch top customers");
}

export async function createCustomer(
  token: string,
  payload: any
): Promise<Customer> {
  const url = getApiUrl("customers/customers");
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }, "Tạo khách hàng thất bại.");
}

export async function getCustomerById(
  token: string,
  customerId: string
): Promise<Customer> {
  const url = getApiUrl(`customers/customers/${customerId}`);
  return await doRequest(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to fetch customer detail");
}

export async function updateCustomer(
  token: string,
  customerId: string,
  payload: any
): Promise<Customer> {
  const url = getApiUrl(`customers/customers/${customerId}`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }, "Failed to update customer");
}

export async function payCustomerAmount(
  token: string,
  customerId: string,
  payAmount: number
): Promise<{ msg: string }> {
  const url = getApiUrl(`customers/customers/${customerId}/pay-amount?pay_for_customer=${payAmount}`);
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to process payment amount");
}

export async function payCustomerTransaction(
  token: string,
  customerId: string,
  invoiceId: string
): Promise<any> {
  const url = getApiUrl(`customers/customers/${customerId}/pay?invoice_id=${invoiceId}`);
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to process payment transaction");
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

  return await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to fetch supplier data");
}

export async function createSuppliers(
  token: string,
  payload: any
): Promise<Supplier> {
  const url = getApiUrl("suppliers/suppliers");
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }, "Failed to create supplier");
}

export async function getSuppliersById(
  token: string,
  supplierId: string
): Promise<Supplier> {
  const url = getApiUrl(`suppliers/suppliers/${supplierId}`);
  return await doRequest(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to fetch supplier detail");
}

export async function updateSupplier(
  token: string,
  supplierId: string,
  payload: any
): Promise<Supplier> {
  const url = getApiUrl(`suppliers/suppliers/${supplierId}`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }, "Failed to update supplier");
}

export async function deactivateSupplier(
  token: string,
  supplierId: string
): Promise<void> {
  const url = getApiUrl(`suppliers/deactivate_supplier/${supplierId}`);
  await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Failed to deactivate supplier");
}

export async function paySupplierAmount(
  token: string,
  supplierId: string,
  payAmount: number
): Promise<{ msg: string }> {
  const url = getApiUrl(`suppliers/suppliers/${supplierId}/pay-amount?pay_for_supplier=${payAmount}`);
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to process payment");
}

export async function payImportBill(
  token: string,
  billId: string,
  payAmount: number
): Promise<{ msg: string; bill_status: string; paid_amount: number }> {
  const url = getApiUrl(`import_inspection/import_bills/${billId}/pay?amount=${payAmount}`);
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to process payment for import bill");
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
  return await doRequest(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to fetch customer groups");
}

export async function createCustomerGroup(
  token: string,
  payload: any
): Promise<CustomerGroup> {
  const url = getApiUrl("customers/groups");
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }, "Failed to create customer group");
}

export async function getCustomerGroups(
  token: string
): Promise<CustomerGroup[]> {
  const url = getApiUrl("customers/groups");
  return (await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Failed to get customer group")).groups;
}

export async function getCustomerGroupById(
  token: string,
  groupId: number
): Promise<CustomerGroup> {
  const url = getApiUrl(`customers/groups/${groupId}`);
  return await doRequest(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to fetch group detail");
}

export async function updateCustomerGroup(
  token: string,
  groupId: number,
  payload: any
): Promise<CustomerGroup> {
  const url = getApiUrl(`customers/groups/${groupId}`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }, "Failed to update group");
}

export async function deleteCustomerGroup(token: string, groupId: number) {
  const url = getApiUrl(`customers/groups/${groupId}`);
  await doRequest(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }, "Failed to delete group");
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
  return await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to fetch accounts");
}

export async function fetchAccountById(
  token: string,
  accountId: string
): Promise<Account> {
  const url = getApiUrl(`users/account/${accountId}`);
  return await doRequest(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to fetch account");
}

export async function createAccount(
  token: string,
  payload: any
): Promise<Account> {
  const url = getApiUrl("users/signup");
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }, "Failed to create account");
}

export async function loginUser(
  username: string,
  password: string
): Promise<Account> {
  const url = getApiUrl("users/signin");
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  }, "Failed to login");
}

export async function signOutUser(): Promise<void> {
  const url = getApiUrl("users/signout");
  await doRequest(url, {
    method: "POST",
    credentials: "include",
  }, "Sign-out failed");
}

export async function updateAccount(
  token: string,
  accountId: string,
  payload: any
): Promise<Account> {
  const url = getApiUrl(`users/update_account/${accountId}`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }, "Failed to update account");
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

  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }, "Failed to change password");
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
  return await doRequest(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Failed to fetch purchases");
}

export async function createPurchase(token: string, payload: any) {
  const url = getApiUrl("import_inspection/import_bills");
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }, "Failed to create purchase");
}

export async function getPurchaseById(
  token: string,
  billId: string
): Promise<Purchase> {
  const url = getApiUrl(`import_inspection/import_bills/${billId}`);
  return await doRequest(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Failed to fetch purchase detail");
}

export async function updatePurchase(
  token: string,
  billId: string,
  payload: any
): Promise<Purchase> {
  const url = getApiUrl(`import_inspection/import_bills/${billId}`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }, "Failed to update purchase");
}

export async function cancelPurchase(
  token: string,
  billId: string
): Promise<Purchase> {
  const url = getApiUrl(`import_inspection/import_bills/${billId}/cancel`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Failed to cancel purchase");
}

export async function confirmImportBill(
  token: string, 
  billId: string
): Promise<Purchase> {
  const url = getApiUrl(`import_inspection/import_bills/${billId}/confirm_import`);
  return await doRequest(url, {
      method: "PUT",
      headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
      },
  }, "Failed to confirm import bill");
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
  return await doRequest(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }, "Fetch inspection reports failed");
}

export async function createInspection(token: string, data: any) {
  const url = getApiUrl(`import_inspection/inspection_reports`);
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }, "Create inspection failed");
}

export async function getInspectionById(token: string, reportId: string) {
  const url = getApiUrl(`import_inspection/inspection_reports/${reportId}`);
  return await doRequest(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }, "Get inspection detail failed");
}

export async function updateInspection(
  token: string,
  reportId: string,
  data: any
) {
  const url = getApiUrl(`import_inspection/inspection_reports/${reportId}`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }, "Update inspection failed");
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
  return await doRequest(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }, "Complete inspection failed");
}

// delivery
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

  return await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Không thể lấy danh sách đơn vận chuyển");
}

export async function fetchDeliveryDetail(
  orderCode: string
): Promise<DeliveryResponse> {
  const url = getApiUrl(`deliveries/deliveries/${orderCode}`);
  return await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }, "Không thể load chi tiết đơn vận chuyển");
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
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(shopData),
  }, "Failed to create shop");
}

export async function fetchShops(): Promise<ShopResponse[]> {
  const url = getApiUrl(`deliveries/list_shop?skip=0&limit=10`);
  return await doRequest(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }, "Failed to fetch shops");
}

export async function createTransportOrder(
  invoiceId: string,
  shopID: number,
  payload: DeliveryCreate
) {
  const url = getApiUrl(
    `deliveries/create_order/${invoiceId}?shop_id=${encodeURIComponent(shopID)}`
  );
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }, "Tạo đơn vận chuyển thất bại");
}

export async function fetchPickShifts(): Promise<
  { id: number; title: string; from_time: number; to_time: number }[]
> {
  const url = getApiUrl(`deliveries/ghn/pickshifts`);
  return (await doRequest(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }, "Không thể lấy danh sách ca lấy")).data || [];
}

export async function fetchProvinces(): Promise<{ ProvinceID: number; ProvinceName: string }[]> {
  const url = getApiUrl(`deliveries/ghn/provinces`);
  return (await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }, "Không thể lấy danh sách tỉnh")).data || [];
}

export async function fetchDistricts(provinceId: number): Promise<{ DistrictID: number; DistrictName: string }[]> {
  const url = getApiUrl(`deliveries/ghn/districts/${provinceId}`);
  return (await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }, "Không thể lấy danh sách quận/huyện")).data || [];
}

export async function fetchWards(districtId: number): Promise<{ WardCode: string; WardName: string }[]> {
  const url = getApiUrl(`deliveries/ghn/wards/${districtId}`);
  return (await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }, "Không thể lấy danh sách phường/xã")).data || [];
}

export async function fetchPickupTime(orderCode: string): Promise<string> {
  const url = getApiUrl(`deliveries/pickup_time/${orderCode}`);
  return (await doRequest(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }, "Không thể lấy thời gian dự kiến lấy hàng")).pickup_time || "";
}

export async function fetchRevenueSummary(
  token: string,
  date: number = 0
): Promise<RevenueSummary> {
  const url = `${getApiUrl("invoices/revenue")}?days=${date}`;
  return await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Không thể lấy dữ liệu doanh thu");
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
  return await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Không thể lấy dữ liệu doanh thu vận chuyển");
}

export async function updateOrderFee(
  shopId: number,
  orderCode: string
): Promise<{ message: string; order_code: string; service_fee: number }> {
  const url = getApiUrl("deliveries/update-order-fee/");
  return await doRequest(
    `${url}?shop_id=${shopId}&order_code=${encodeURIComponent(orderCode)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
    "Không thể cập nhật phí dịch vụ"
  );
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
  return await doRequest(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Không thể lấy dữ liệu doanh thu");
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
  return await doRequest(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Không thể lấy dữ liệu phiếu trả hàng");
}

export async function createReturnBill(token: string, payload: any) {
  const url = getApiUrl("import_inspection/return_bills");
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }, "Không thể tạo phiếu trả hàng", true);
}

export async function getReturnBillById(token: string, returnId: string) {
  const url = getApiUrl(`import_inspection/return_bills/${returnId}`);
  return await doRequest(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Không thể lấy chi tiết phiếu trả hàng");
}

export async function updateReturnBill(token: string, returnId: string, payload: any) {
  const url = getApiUrl(`import_inspection/return_bills/${returnId}`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }, "Không thể cập nhật phiếu trả hàng", true);
}

export async function confirmReturnBill(token: string, returnId: string) {
  const url = getApiUrl(`import_inspection/return_bills/${returnId}/confirm`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }, "Không thể xác nhận phiếu trả hàng");
}

export async function cancelReturnBill(
  token: string,
  returnBillId: string
): Promise<ReturnBill> {
  const url = getApiUrl(`import_inspection/return_bills/${returnBillId}/cancel`);
  return await doRequest(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  }, 'Failed to cancel return bill');
}

export async function printOrder(
  token: string,
  orderCode: string
): Promise<string> {
  const url = getApiUrl(`deliveries/print_order/${orderCode}`);
  return await doRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  }, 'Failed to get print order token', undefined, true);
}

//Transfer
export async function createTransferStock(
  token: string,
  payload: TransactionTranferCreate
): Promise<TransactionTranferResponse> {
  const url = getApiUrl("products/transfer_stock");
  return await doRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }, "Failed to create transfer", true);
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
  return await doRequest(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to fetch transfer stocks");
}

export async function getTransferStockById(
  token: string,
  id: string
): Promise<TransactionTranferResponse> {
  const url = getApiUrl(`products/transfer_stock/${id}`);
  return await doRequest(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Transfer stock not found");
}

export async function updateTransferStock(
  token: string,
  id: string,
  payload: TransactionTranferUpdate
): Promise<TransactionTranferResponse> {
  const url = getApiUrl(`products/transfer_stock/${id}`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }, "Failed to update transfer", true);
}

export async function completeTransferStock(
  token: string,
  id: string
): Promise<TransactionTranferResponse> {
  const url = getApiUrl(`products/transfer_stock/${id}/complete`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to complete transfer", true);
}

export async function cancelTransferStock(
  token: string,
  id: string
): Promise<TransactionTranferResponse> {
  const url = getApiUrl(`products/transfer_stock/${id}`);
  return await doRequest(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to delete transfer");
}

export async function changeTransferStockStatus(
  token: string,
  id: string
): Promise<TransactionTranferResponse> {
  const url = getApiUrl(`products/change_status_transfer_stock/${id}`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  }, "Failed to change transfer status");
}

export async function editStock(
  token: string,
  productId: string,
  payload: {
    terra_stock: number;
    terra_can_sell: number;
    thonhuom_stock: number;
    thonhuom_can_sell: number;
  }
): Promise<ProductResponse> {
  const url = getApiUrl(`products/edit_stock/${productId}`);
  return await doRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }, "Cập nhật kho thất bại");
}