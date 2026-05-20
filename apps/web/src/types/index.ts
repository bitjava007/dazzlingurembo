export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  roles: Role[];
  branchId?: string;
  branch?: Branch;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Customer {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  isVip: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  category?: Category;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  variants?: Variant[];
  createdAt: string;
  updatedAt: string;
}

export interface Variant {
  id: string;
  productId: string;
  product?: Product;
  sku: string;
  name: string;
  price: number;
  costPrice: number;
  weight?: number;
  status: 'ACTIVE' | 'INACTIVE';
  stockQuantity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockBalance {
  id: string;
  variantId: string;
  variant?: Variant;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderPoint?: number;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  variantId: string;
  variant?: Variant;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
  reason?: string;
  referenceId?: string;
  createdAt: string;
}

export interface StockTransfer {
  id: string;
  fromWarehouseId: string;
  fromWarehouse?: Warehouse;
  toWarehouseId: string;
  toWarehouse?: Warehouse;
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  items: StockTransferItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransferItem {
  id: string;
  transferId: string;
  variantId: string;
  variant?: Variant;
  quantity: number;
}

export interface StockAdjustment {
  id: string;
  warehouseId: string;
  warehouse?: Warehouse;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  items: StockAdjustmentItem[];
  approvedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustmentItem {
  id: string;
  adjustmentId: string;
  variantId: string;
  variant?: Variant;
  currentQuantity: number;
  newQuantity: number;
  reason?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  branchId?: string;
  branch?: Branch;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  number: string;
  customerId: string;
  customer?: Customer;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  validUntil?: string;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  id: string;
  quotationId: string;
  variantId: string;
  variant?: Variant;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customer?: Customer;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  deliveryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  variant?: Variant;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  number: string;
  orderId: string;
  order?: Order;
  customerId: string;
  customer?: Customer;
  status: 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoice?: Invoice;
  amount: number;
  method: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_MONEY' | 'OTHER';
  reference?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  order?: Order;
  status: 'PENDING' | 'DISPATCHED' | 'DELIVERED' | 'FAILED' | 'RETURNED';
  driverName?: string;
  vehicleNumber?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  description?: string;
  receiptUrl?: string;
  branchId?: string;
  branch?: Branch;
  approvedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashClosure {
  id: string;
  date: string;
  branchId: string;
  branch?: Branch;
  openingBalance: number;
  closingBalance: number;
  cashSales: number;
  cashIn: number;
  cashOut: number;
  difference: number;
  status: 'OPEN' | 'CLOSED';
  closedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  reference: string;
  description: string;
  date: string;
  status: 'DRAFT' | 'POSTED' | 'REVERSED';
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  createdAt: string;
  updatedAt: string;
}

export interface JournalLine {
  id: string;
  journalEntryId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  supplier?: Supplier;
  status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'RECEIVED' | 'CANCELLED';
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  expectedDeliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  variantId: string;
  variant?: Variant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
}

export interface SupplierInvoice {
  id: string;
  number: string;
  supplierId: string;
  supplier?: Supplier;
  purchaseOrderId?: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'OVERDUE';
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  number: string;
  productId?: string;
  product?: Product;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  quantity: number;
  startDate?: string;
  endDate?: string;
  stages?: WorkOrderStage[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderStage {
  id: string;
  workOrderId: string;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  order: number;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId?: string;
  department?: Department;
  position?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  joinDate: string;
  basicSalary: number;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerId?: string;
  manager?: Employee;
  branchId?: string;
  branch?: Branch;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employee?: Employee;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRun {
  id: string;
  month: number;
  year: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeeCount: number;
  approvedById?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  countryId: string;
  country?: Country;
  address?: string;
  phone?: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  content: string;
  createdById?: string;
  createdAt: string;
}

export interface CustomerCommunication {
  id: string;
  customerId: string;
  type: 'EMAIL' | 'PHONE' | 'SMS' | 'IN_PERSON' | 'OTHER';
  subject?: string;
  content: string;
  direction: 'INBOUND' | 'OUTBOUND';
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}
