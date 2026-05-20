export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  branchId?: string;
  assignedBy?: string;
  expiresAt?: string;
  role: Role;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  roles?: Role[];
  userRoles?: UserRole[];
  branchId?: string;
  branch?: Branch;
  countryId?: string;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem?: boolean;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  module: string;
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
  productId?: string;
  product?: Product & { reorderPoint?: number; minStockLevel?: number; trackInventory?: boolean };
  variantId?: string;
  variant?: Variant;
  warehouseId: string;
  warehouse?: Warehouse;
  branchId?: string;
  branch?: Branch;
  quantityOnHand: number;
  quantityReserved: number;
  quantityOnOrder?: number;
  quantityAvailable: number;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  movementType: string;
  variantId: string;
  variant?: Variant;
  warehouseId: string;
  warehouse?: Warehouse;
  quantityChange: number;
  quantityBefore?: number;
  quantityAfter?: number;
  unitCost?: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  fromWarehouse?: Warehouse;
  toWarehouseId: string;
  toWarehouse?: Warehouse;
  fromBranchId?: string;
  toBranchId?: string;
  status: 'DRAFT' | 'IN_TRANSIT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  items: StockTransferItem[];
  notes?: string;
  createdById?: string;
  approvedById?: string;
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
  adjustmentNumber: string;
  warehouseId: string;
  warehouse?: Warehouse;
  branchId?: string;
  branch?: Branch;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  notes?: string;
  items?: StockAdjustmentItem[];
  approvedById?: string;
  approvedAt?: string;
  createdById?: string;
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
  branchId: string;
  branch?: Branch;
  address?: string;
  totalCapacity?: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Workshop {
  id: string;
  name: string;
  code: string;
  branchId: string;
  branch?: Branch;
  address?: string;
  capacity?: number;
  isActive: boolean;
  specialties?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId?: string;
  customer?: Customer;
  branchId?: string;
  branch?: Branch;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
  validUntil?: string;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currencyCode?: string;
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
  orderNumber: string;
  customerId?: string;
  customer?: Customer;
  branchId: string;
  branch?: Branch;
  currencyCode?: string;
  status: 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'PARTIALLY_SHIPPED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
  items?: OrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount?: number;
  totalAmount: number;
  notes?: string;
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
  invoiceNumber: string;
  orderId?: string;
  order?: Order;
  customerId?: string;
  customer?: Customer;
  branchId: string;
  branch?: Branch;
  currencyCode?: string;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'VOID' | 'WRITTEN_OFF';
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  dueAt?: string;
  issuedAt?: string;
  paidAt?: string;
  notes?: string;
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentNumber?: string;
  invoiceId?: string;
  invoice?: Invoice;
  orderId?: string;
  branchId?: string;
  originalAmount: number;
  originalCurrencyCode?: string;
  method: string;
  reference?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
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
  expenseNumber: string;
  categoryId: string;
  category?: ExpenseCategory;
  branchId: string;
  branch?: Branch;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'REIMBURSED';
  description: string;
  vendor?: string;
  originalCurrencyCode: string;
  originalAmount: number;
  convertedCurrencyCode?: string;
  convertedAmount?: number;
  taxAmount?: number;
  expenseDate: string;
  submittedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  notes?: string;
  isRecurring?: boolean;
  createdById?: string;
  approvedById?: string;
  createdAt: string;
  updatedAt: string;
  // Legacy fields kept for backward compatibility
  title?: string;
  amount?: number;
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
  poNumber: string;
  supplierId: string;
  supplier?: Supplier;
  branchId?: string;
  branch?: Branch;
  status: 'DRAFT' | 'SENT' | 'ACKNOWLEDGED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  items?: PurchaseOrderItem[];
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  currencyCode?: string;
  expectedDeliveryAt?: string;
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
  invoiceNumber: string;
  supplierId: string;
  supplier?: Supplier;
  purchaseOrderId?: string;
  branchId?: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'OVERDUE' | 'DISPUTED';
  originalAmount: number;
  originalCurrencyCode?: string;
  paidAmount?: number;
  dueDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  productId?: string;
  product?: Product;
  variantId?: string;
  workshopId?: string;
  workshop?: Workshop;
  status: 'DRAFT' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  quantity: number;
  quantityCompleted?: number;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
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
  isoCode2: string;
  isoCode3: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  dialCode?: string;
  locale?: string;
  timezone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  type: string;
  countryId: string;
  country?: Country;
  address?: string;
  city?: string;
  stateRegion?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  isHeadOffice: boolean;
  openingDate?: string;
  managerId?: string;
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
  channel: string;
  direction: string;
  subject?: string;
  body?: string;
  isRead?: boolean;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

export interface LoyaltyAccount {
  id: string;
  customerId: string;
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  transactions?: LoyaltyTransaction[];
}

export interface LoyaltyTransaction {
  id: string;
  loyaltyAccountId: string;
  type: string;
  points: number;
  description?: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  paymentId: string;
  payment?: Payment;
  branchId: string;
  branch?: Branch;
  issuedAt: string;
  createdAt: string;
}

export interface Refund {
  id: string;
  refundNumber: string;
  orderId?: string;
  order?: Order;
  paymentId?: string;
  customerId?: string;
  customer?: Customer;
  branchId: string;
  branch?: Branch;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  reason: string;
  description?: string;
  originalCurrencyCode: string;
  originalAmount: number;
  method?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Return {
  id: string;
  returnNumber: string;
  orderId?: string;
  order?: Order;
  customerId?: string;
  customer?: Customer;
  branchId: string;
  branch?: Branch;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  reason: string;
  description?: string;
  resolutionType?: string;
  notes?: string;
  items: ReturnItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ReturnItem {
  id: string;
  returnId: string;
  variantId?: string;
  variant?: Variant;
  name: string;
  sku?: string;
  quantity: number;
  condition?: string;
  notes?: string;
}

export interface DeliveryNote {
  id: string;
  deliveryNumber: string;
  orderId: string;
  order?: Order;
  branchId: string;
  branch?: Branch;
  status: 'DRAFT' | 'DISPATCHED' | 'DELIVERED';
  notes?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: DeliveryNoteItem[];
}

export interface DeliveryNoteItem {
  id: string;
  deliveryNoteId: string;
  variantId?: string;
  variant?: Variant;
  quantity: number;
}

export interface ProductSku {
  id: string;
  variantId: string;
  sku: string;
  barcode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductMedia {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  mediaType: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface InventoryCount {
  id: string;
  branchId: string;
  warehouseId: string;
  status: string;
  notes?: string;
  scheduledAt?: string;
  appliedAt?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DamagedStock {
  id: string;
  variantId: string;
  warehouseId: string;
  branchId: string;
  quantity: number;
  reason: string;
  description?: string;
  estimatedLoss?: number;
  currencyCode?: string;
  disposalMethod?: string;
  resolvedAt?: string;
  resolvedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SKU {
  id: string;
  variantId: string;
  sku: string;
  barcode?: string;
  serialNumber?: string;
  batchNumber?: string;
  condition: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  parent?: ExpenseCategory;
  children?: ExpenseCategory[];
  isActive: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reconciliation {
  id: string;
  branchId: string;
  branch?: { id: string; name: string };
  dailyClosureId?: string;
  discrepancyAmount?: number;
  discrepancyNotes?: string;
  notes?: string;
  status: string;
  approvedById?: string;
  approvedAt?: string;
  difference?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceipt {
  id: string;
  purchaseOrderId: string;
  purchaseOrder?: PurchaseOrder;
  branchId: string;
  receivedDate: string;
  notes?: string;
  items?: GoodsReceiptItem[];
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceiptItem {
  id: string;
  goodsReceiptId: string;
  purchaseOrderItemId: string;
  quantityReceived: number;
  notes?: string;
}

export interface SupplierPayment {
  id: string;
  paymentNumber?: string;
  supplierId: string;
  supplier?: Supplier;
  purchaseOrderId?: string;
  branchId: string;
  branch?: Branch;
  originalCurrencyCode: string;
  originalAmount: number;
  convertedCurrencyCode?: string;
  convertedAmount?: number;
  exchangeRateSnapshot?: number;
  method: string;
  status: string;
  transactionRef?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  code: string;
  channel: string;
  subject?: string;
  bodyTemplate: string;
  variables?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  templateId?: string;
  template?: NotificationTemplate;
  userId?: string;
  channel: string;
  recipient: string;
  subject?: string;
  body?: string;
  status: string;
  errorMessage?: string;
  entityType?: string;
  entityId?: string;
  sentAt?: string;
  createdAt: string;
}

export interface MaterialConsumption {
  id: string;
  workOrderId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  quantity: number;
  unit: string;
  notes?: string;
  recordedById?: string;
  createdAt: string;
}

export interface OperatorAssignment {
  id: string;
  workOrderId: string;
  stageId?: string;
  operatorId: string;
  role: string;
  startDate: string;
  endDate?: string;
  unassignedAt?: string;
  createdAt: string;
}

export interface ProofOfDelivery {
  id: string;
  deliveryId: string;
  signatureName: string;
  signatureUrl?: string;
  photoUrl?: string;
  notes?: string;
  deliveredAt: string;
  createdById?: string;
  createdAt: string;
}

export interface SalaryAdvance {
  id: string;
  employeeId: string;
  employee?: Employee;
  originalAmount: number;
  originalCurrencyCode: string;
  reason: string;
  requestedAt: string;
  repaymentDate?: string;
  status: 'PENDING' | 'APPROVED' | 'DISBURSED' | 'REPAID' | 'REJECTED' | 'CANCELLED';
  approvedById?: string;
  approvedAt?: string;
  rejectionReason?: string;
  repaidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// MODULE: FASHION MANUFACTURING
// =============================================================================

export interface BOM {
  id: string;
  productId: string;
  product?: Product;
  name: string;
  version: string;
  isActive: boolean;
  notes?: string;
  items?: BOMItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BOMItem {
  id: string;
  bomId: string;
  materialVariantId: string;
  materialVariant?: Variant;
  quantity: number;
  unit: string;
  wastagePercent?: number;
  materialType: string;
  notes?: string;
}

export interface TailoringTeam {
  id: string;
  name: string;
  code: string;
  workshopId: string;
  workshop?: Workshop;
  leaderId?: string;
  capacity?: number;
  specialties: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  branchId: string;
  status: string;
  title: string;
  description?: string;
  bust?: number;
  waist?: number;
  hips?: number;
  length?: number;
  shoulders?: number;
  sleeves?: number;
  inseam?: number;
  neck?: number;
  measurementNotes?: string;
  stylePreferences?: string;
  colorPreferences?: string;
  fabricPreferences?: string;
  embellishments?: string;
  specialInstructions?: string;
  estimatedPrice?: number;
  finalPrice?: number;
  depositAmount?: number;
  currencyCode: string;
  requiredByDate?: string;
  fittingDate?: string;
  deliveryDate?: string;
  workOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alteration {
  id: string;
  alterationNumber: string;
  customerId: string;
  customer?: Customer;
  branchId: string;
  workshopId?: string;
  status: string;
  description: string;
  alterationType: string;
  estimatedTime?: number;
  actualTime?: number;
  estimatedCost?: number;
  finalCost?: number;
  currencyCode: string;
  receivedAt: string;
  completedAt?: string;
  deliveredAt?: string;
  tailorId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionSchedule {
  id: string;
  workOrderId: string;
  workOrder?: WorkOrder;
  workshopId: string;
  workshop?: Workshop;
  teamId?: string;
  team?: TailoringTeam;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  title: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// MODULE: TREASURY
// =============================================================================

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  iban?: string;
  swift?: string;
  currencyCode: string;
  branchId: string;
  branch?: Branch;
  currentBalance: number;
  isActive: boolean;
  notes?: string;
  transactions?: BankTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  type: 'INFLOW' | 'OUTFLOW';
  amount: number;
  currencyCode: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
  transactionDate: string;
  createdAt: string;
}

export interface CashPosition {
  accounts: BankAccount[];
  inflowLast30d: number;
  outflowLast30d: number;
  netLast30d: number;
}

// =============================================================================
// MODULE: ANALYTICS
// =============================================================================

export interface AnalyticsSummary {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  margin: number;
  totalPayroll: number;
  totalAdvances: number;
  period: { from: string; to: string };
}

export interface ProfitabilityByBranch {
  branchId: string;
  branchName: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

export interface EmployeeCostSummary {
  summary: {
    totalBaseSalary: number;
    totalAllowances: number;
    totalDeductions: number;
    totalNetPay: number;
    totalGrossPay: number;
    totalAdvancesDisbursed: number;
    headcount: number;
  };
  payrollByEmployee: Array<{
    id: string;
    employeeId: string;
    grossPay: number;
    netPay: number;
    deductions: number;
    baseSalary: number;
    allowances: number;
    status: string;
    periodStartDate: string;
    periodEndDate: string;
  }>;
  advances: Array<{
    id: string;
    employeeId: string;
    originalAmount: number;
    originalCurrencyCode: string;
    status: string;
    requestedAt: string;
  }>;
}

