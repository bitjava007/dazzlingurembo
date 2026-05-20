import api from '@/lib/api';
import type {
  Expense,
  CashClosure,
  ExchangeRate,
  JournalEntry,
  ExpenseCategory,
  Reconciliation,
  BankAccount,
  BankTransaction,
  PaginatedResponse,
  ListParams,
} from '@/types';

export const financeService = {
  // Journal
  async getJournalEntries(params?: ListParams): Promise<PaginatedResponse<JournalEntry>> {
    const response = await api.get<PaginatedResponse<JournalEntry>>('/finance/journal', { params });
    return response.data;
  },

  async createJournalEntry(data: Record<string, unknown>): Promise<JournalEntry> {
    const response = await api.post<JournalEntry>('/finance/journal', data);
    return response.data;
  },

  // Expense Categories
  async getExpenseCategories(params?: ListParams): Promise<PaginatedResponse<ExpenseCategory>> {
    const response = await api.get<PaginatedResponse<ExpenseCategory>>('/finance/expense-categories', { params });
    return response.data;
  },

  async createExpenseCategory(data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    const response = await api.post<ExpenseCategory>('/finance/expense-categories', data);
    return response.data;
  },

  async updateExpenseCategory(id: string, data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    const response = await api.patch<ExpenseCategory>(`/finance/expense-categories/${id}`, data);
    return response.data;
  },

  async deleteExpenseCategory(id: string): Promise<void> {
    await api.delete(`/finance/expense-categories/${id}`);
  },

  // Expenses
  async getExpenses(params?: ListParams): Promise<PaginatedResponse<Expense>> {
    const response = await api.get<PaginatedResponse<Expense>>('/finance/expenses', { params });
    return response.data;
  },

  async createExpense(data: Partial<Expense>): Promise<Expense> {
    const response = await api.post<Expense>('/finance/expenses', data);
    return response.data;
  },

  async approveExpense(id: string): Promise<Expense> {
    const response = await api.patch<Expense>(`/finance/expenses/${id}/approve`);
    return response.data;
  },

  async rejectExpense(id: string, reason?: string): Promise<Expense> {
    const response = await api.patch<Expense>(`/finance/expenses/${id}/reject`, { reason });
    return response.data;
  },

  async submitExpense(id: string): Promise<Expense> {
    const response = await api.patch<Expense>(`/finance/expenses/${id}/submit`);
    return response.data;
  },

  // Cash Closures
  async getCashClosures(params?: ListParams): Promise<PaginatedResponse<CashClosure>> {
    const response = await api.get<PaginatedResponse<CashClosure>>('/finance/cash-closures', { params });
    return response.data;
  },

  async createCashClosure(data: Record<string, unknown>): Promise<CashClosure> {
    const response = await api.post<CashClosure>('/finance/cash-closures', data);
    return response.data;
  },

  async closeCashClosure(id: string): Promise<CashClosure> {
    const response = await api.patch<CashClosure>(`/finance/cash-closures/${id}/close`);
    return response.data;
  },

  // Reconciliations
  async getReconciliations(params?: ListParams): Promise<PaginatedResponse<Reconciliation>> {
    const response = await api.get<PaginatedResponse<Reconciliation>>('/finance/reconciliations', { params });
    return response.data;
  },

  async createReconciliation(data: Record<string, unknown>): Promise<Reconciliation> {
    const response = await api.post<Reconciliation>('/finance/reconciliations', data);
    return response.data;
  },

  async approveReconciliation(id: string): Promise<Reconciliation> {
    const response = await api.patch<Reconciliation>(`/finance/reconciliations/${id}/approve`);
    return response.data;
  },

  // Exchange Rates
  async getExchangeRates(params?: ListParams): Promise<PaginatedResponse<ExchangeRate>> {
    const response = await api.get<PaginatedResponse<ExchangeRate>>('/finance/exchange-rates', { params });
    return response.data;
  },

  async createExchangeRate(data: Partial<ExchangeRate>): Promise<ExchangeRate> {
    const response = await api.post<ExchangeRate>('/finance/exchange-rates', data);
    return response.data;
  },

  async getLatestExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    const response = await api.get<ExchangeRate>('/finance/exchange-rates/latest', { params: { from, to } });
    return response.data;
  },

  // Treasury — Bank Accounts
  getBankAccounts: (params?: object) => api.get('/finance/treasury/bank-accounts', { params }).then((r) => r.data),
  createBankAccount: (data: object) => api.post('/finance/treasury/bank-accounts', data).then((r) => r.data),
  updateBankAccount: (id: string, data: object) => api.patch(`/finance/treasury/bank-accounts/${id}`, data).then((r) => r.data),
  deleteBankAccount: (id: string) => api.delete(`/finance/treasury/bank-accounts/${id}`),
  getBankTransactions: (accountId: string, params?: object) =>
    api.get(`/finance/treasury/bank-accounts/${accountId}/transactions`, { params }).then((r) => r.data),
  createBankTransaction: (accountId: string, data: object) =>
    api.post(`/finance/treasury/bank-accounts/${accountId}/transactions`, data).then((r) => r.data),
  getCashPosition: () => api.get('/finance/treasury/cash-position').then((r) => r.data),
  getCashflow: (from: string, to: string) =>
    api.get(`/finance/treasury/cashflow?from=${from}&to=${to}`).then((r) => r.data),

  // Analytics
  getAnalyticsSummary: (from: string, to: string) =>
    api.get(`/finance/analytics/summary?from=${from}&to=${to}`).then((r) => r.data),
  getProfitabilityByBranch: (from: string, to: string) =>
    api.get(`/finance/analytics/profitability/branch?from=${from}&to=${to}`).then((r) => r.data),
  getProfitabilityByCustomer: (from: string, to: string, limit = 10) =>
    api.get(`/finance/analytics/profitability/customer?from=${from}&to=${to}&limit=${limit}`).then((r) => r.data),
  getProfitabilityByPeriod: (from: string, to: string, granularity = 'month') =>
    api.get(`/finance/analytics/profitability/period?from=${from}&to=${to}&granularity=${granularity}`).then((r) => r.data),
  getProfitabilityByWorkshop: (from: string, to: string) =>
    api.get(`/finance/analytics/profitability/workshop?from=${from}&to=${to}`).then((r) => r.data),
  getEmployeeCosts: (from: string, to: string) =>
    api.get(`/finance/analytics/employee-costs?from=${from}&to=${to}`).then((r) => r.data),
};

// Type re-exports for pages that import directly from this service
export type { BankAccount, BankTransaction };
