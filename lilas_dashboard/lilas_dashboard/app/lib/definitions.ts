export type Revenue = {
  date: string;
  revenue: number;
};

export interface Employee {
  id: string;
  role: number;
  full_name: string;
  phone_number: string;
  email: string | null;
  address: string | null;
  shift_work: string | null;
  active: boolean;
  total_orders: number;
  total_revenue: number;
  created_at: string;
}

export interface Account {  
  id: string;
  role: number;
  username: string;
  created_at: string;
}

export interface CustomerGroup {
  id: number;
  name: string;
  discount_type: string; 
  discount: number; 
  payment_form?: string; 
  description?: string;
  total_customers: number; 
  total_spending: number;
  total_order: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  address: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  group_id?: number;
  group?: CustomerGroup; 
  group_name: string;
  debt: number; 
  loyalty_points: number; 
  total_spending: number;
  total_order: number;
  total_return_orders:number;
  total_return_spending: number;
  province?: string;
  district_id?: number;
  district_name?: string;
  ward_code?: string;
  ward_name?: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  contact_name: string;
  address: string;
  email: string;
  phone: string;
  debt: number; 
  paid_amount: number;
  created_at: string;
  updated_at: string;
  total_import_orders: number;
  total_import_value: number;
  total_return_orders: number;
  total_return_value: number;
}

export interface LatestInvoice {
  id: string;
  name: string;
  email: string;
  total: string;
}

export interface Product {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
  group_name: string;
  brand?: string;
  thonhuom_can_sell: number;
  terra_can_sell:number;
  stock: number;
  dry_stock: boolean;
  expiration_date?: string;
  price_retail: number;
  price_import: number;
  price_wholesale: number;
  barcode: string;
  weight: number;
  className?: string;
  images?: { id: number; url: string }[];
  terra_stock?: number;
  thonhuom_stock?: number;
  out_for_delivery_terra: number;
  out_for_delivery_thonhuom: number;
  pending_arrival_terra: number;
  pending_arrival_thonhuom: number;
}

export interface ProductImageResponse {
  id: number;
  url: string;
}

export interface ProductGroupResponse {
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  total_orders?: number;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string | null;
  brand: string;
  can_sell: number;
  stock: number;
  dry_stock: boolean;
  expiration_date: string | null;
  price_retail: number;
  price_import: number;
  price_wholesale: number;
  group_name: string;
  barcode: string;
  weight: number;
  image_url: string;
  created_at: string;
  group: ProductGroupResponse | null;
  images: ProductImageResponse[];
  terra_stock?: number;
  thonhuom_stock?: number;
  thonhuom_can_sell?: number;
  terra_can_sell?: number;
  out_for_delivery_terra: number;
  out_for_delivery_thonhuom: number;
  pending_arrival_terra: number;
  pending_arrival_thonhuom: number;
}

export interface CreateInvoice {
  id: number;
  name: string;
  items: InvoiceItem[]; 
  discount: number; 
  discountType: "%" | "value";
  customerPaid: number; 
  customerDeposit: number;
  depositMethod: string;
  customer: Customer | null;  
  branch: string;
  isDelivery: boolean;
  orderSource: string | null;
}

export interface InvoiceTest {
  id: string; 
  orderDate: string;
  customer_id: number;
  customerName: string;
  branch: string;
  orderStatus: string;
  paymentStatus: string;
  total: string;
  className?: string;
  discountOrder: string;
  serviceOrder: string;
  amount: number;
}

export interface Invoice {
  id: string;
  created_at: string;
  updated_at?: string;
  status: string;
  payment_status: string;
  discount: number;
  deposit: number;
  discount_type: string;
  total_value: number;
  note?: string;
  extraCost?:number;
  deposit_method?: string;
  branch?: string;
  is_delivery: boolean;
  order_source?: string;
  expected_delivery?: Date;

  customer: Customer;
  user?: Employee;
  items: InvoiceItem[];
  service_items: ServiceItem[];
}

export interface InvoiceItem {
  id: number | string;
  product_id?: string;
  barcode: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  price_wholesale?: number;
  discount: number;
  isService?: boolean;
  product?: Product;
  total_line?: number; 
  discount_type?: "%" | "VND"
 }

export interface ServiceItem {
  id: number | string; 
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

export interface InvoiceListResponse {
  total_invoices: number;
  invoices: Invoice[];
}

export interface PurchaseItem {
  id: number;
  product_id: string;
  product_image_url: string;
  product_name: string;
  product: Product;
  quantity: number;
  price: number;
  discount: number;
  total_line: number;
}

export interface Purchase {
  id: string;
  created_at: string;
  updated_at: string;
  supplier_id?: string;
  supplier?: Supplier;
  user_id?: string;
  user?: Employee;
  branch: string;
  note: string;
  discount: number;
  extra_fee: number;
  total_value: number;
  paid_amount: number;
  status: string;
  delivery_date?: string;
  active: boolean;
  items: PurchaseItem[];
  returns?: PurchaseReturnItem[];
}

export interface PurchaseReturnItem {
  id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product; 
  total_line: number;
}

export interface InspectionReportItem {
  id: number;
  inspection_report_id: string;
  product_id: string;
  quantity: number;    
  actual_quantity: number;
  reason?: string;
  note?: string;
  product?: Product;
}

export interface InspectionReportHistory {
  id: number;
  inspection_report_id: string;
  user_id: string;
  product_id: string;
  actual_quantity: number;
  reason?: string;
  note?: string;
  created_at: string;
}

export interface InspectionReport {
  id: string;
  created_at: string; 
  updated_at?: string; 
  complete_at?: string;
  user_id: string;
  user?: Employee;  
  import_bill_id: string; 
  import_bill?: Purchase;
  branch?: string;
  note?: string;
  status: string; 
  active?: boolean;
  items: InspectionReportItem[]; 
}

export interface InspectionListResponse {
  total_reports: number;
  reports: InspectionReport[];
}

export interface PurchaseListResponse {
  total_import_bills: number;
  import_bills: Purchase[];
}

//delivery
export interface DeliveryItem {
  id: number;
  product_code: string;
  product_name: string;
  price: number;
  quantity: number;
  discount: number;
}

// export interface DeliveryResponse {
//   id: number;
//   order_code: string;
//   status: string;
//   message: string;
//   data: {
//     invoice_id?: string;
//     [key: string]: unknown;
//   };
//   to_name?: string;
//   to_phone?: string;
//   to_ward_name?: string;
//   to_district_name?: string;
//   to_province_name?: string;
//   to_address?: string;
//   from_address?: string;
//   created_at: string;
//   cod_amount?: number;
//   note?: string;
//   [key: string]: unknown;
// }

export interface DeliveryResponse {
  id: number;
  order_code: string;
  status: string;
  message?: string;
  shop_address?: ShopResponse;
  data: {
    invoice_id?: string;
    invoice?: Invoice;
    to_name?: string;
    to_phone?: string;
    to_address?: string;
    to_ward_name?: string;
    to_district_name?: string;
    to_province_name?: string;
    created_at?: string;
    shop_id?: number;
    cod_amount?: number;
    note?: string;
    service_fee: number;
    payment_type_id?: number;
    pickup_time?: string;
  };
}

export interface DeliveryListResponse {
  order_code: string;
  created_at: string;
  to_name: string;
  status: string;
  payment_status: string;
  cod_amount: number;
  insurance_value: number;
  invoice?: Invoice;
}

export interface DeliveryCreate {
  payment_type_id: number;
  note?: string;
  required_note?: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  cod_amount: number;
  service_type_id: number;
  pick_station_id?: number;
  insurance_value?: number;
  amount_due?: number;
  pick_shift: number;
  cupon?: string;
  return_phone?: string;
  return_address?: string;
  return_ward_name?: string;
  return_district_name?: string;
  cod_failed_amount?: number;
  items: DeliveryItem[];
}

export interface ShopResponse {
  shop_id: number;
  name: string;
  address: string;
  phone: string;
  district_id: string;
  ward_code: string;
}

export interface RevenueSummary {
  date_range: string;
  total_payment: number;
  branch_percentage: Record<string, number>;
  revenue_breakdown: Record<string, number>;
  wait_for_payment: number;
  waiting_percentage: number;
  total_customers: number;
  total_invoices: number;
}

// return
export interface ReturnBillItem {
  id: number;
  product_id: string;
  product?: Product;
  quantity: number;
  price: number;
  discount: number;
  total_line: number;
  created_at?: string;
}

export interface ReturnBill {
  id: string;
  created_at: string;
  updated_at: string;
  supplier_id: string;
  supplier?: Supplier;
  user_id: string;
  user?: Employee;
  branch: string;
  note: string;
  discount: number;
  extra_fee: number;
  total_value: number;
  paid_amount: number;
  status: string;
  active: boolean;
  items: ReturnBillItem[];
}

//tranfer
export interface TransferItem {
  product_id: string;
  quantity: number;
}

export interface TransactionTranferCreate {
  user_id: string;
  from_warehouse: string;
  to_warehouse: string;
  extra_fee?: number;
  note?: string;
  items: TransferItem[];
}

export interface TransactionTranferUpdate {
  user_id?: string;
  from_warehouse?: string;
  to_warehouse?: string;
  extra_fee?: number;
  status?: string;
  note?: string;
  items?: TransferItem[];
}

export interface TransactionTranferResponse {
  id: number;
  user_id: string;
  user: Employee;
  from_warehouse: string;
  to_warehouse: string;
  extra_fee?: number;
  status: string;
  note?: string;
  items: {
    id: number;
    product_id: string;
    quantity: number;
    product?: Product;
  }[];
  created_at: string;
  updated_at: string;
}

export interface TransactionTranferListResponse {
  total_transactions: number;
  transactions: TransactionTranferResponse[];
}