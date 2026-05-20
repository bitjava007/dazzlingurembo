import api from '@/lib/api';
import type { Expense, CashClosure, ExchangeRate, JournalEntry, ExpenseCategory, Reconciliation, PaginatedResponse, ListParams } from '@/types';

export const financeService = {
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

  async getCashClosures(params?: ListParams): Promise<PaginatedResponse<CashClosure>> {
    const response = await api.get<PaginatedResponse<CashClosure>>('/finance/cash-closures', { params });
    return response.data;
  },

  async getExchangeRates(params?: ListParams): Promise<PaginatedResponse<ExchangeRate>> {
    const response = await api.get<PaginatedResponse<ExchangeRate>>('/finance/exchange-rates', { params });
    return response.data;
  },

  async createExchangeRate(data: Partial<ExchangeRate>): Promise<ExchangeRate> {
    const response = await api.post<ExchangeRate>('/finance/exchange-rates', data);
    return response.data;
  },

  async getJournalEntries(params?: ListParams): Promise<PaginatedResponse<JournalEntry>> {
    const response = await api.get<PaginatedResponse<JournalEntry>>('/finance/journal', { params });
    return response.data;
  },

  async createJournalEntry(data: Partial<JournalEntry>): Promise<JournalEntry> {
    const response = await api.post<JournalEntry>('/finance/journal', data);
    return response.data;
  },

  // Expense Categories
  async getExpenseCategories(params?: ListParams): Promise<PaginatedResponse<ExpenseCategory>> {
    const response = await api.get<PaginatedResponse<ExpenseCategory>>('/finance/expense-categories', { params });
    return response.data;
  },

  async createExpenseCategory(data: object): Promise<ExpenseCategory> {
    const response = await api.post<ExpenseCategory>('/finance/expense-categories', data);
    return response.data;
  },

  async updateExpenseCategory(id: string, data: object): Promise<ExpenseCategory> {
    const response = await api.patch<ExpenseCategory>(`/finance/expense-categories/${id}`, data);
    return response.data;
  },

  async deleteExpenseCategory(id: string): Promise<void> {
    await api.delete(`/finance/expense-categories/${id}`);
  },

  // Reconciliations
  async getReconciliations(params?: ListParams): Promise<PaginatedResponse<Reconciliation>> {
    const response = await api.get<PaginatedResponse<Reconciliation>>('/finance/reconciliations', { params });
    return response.data;
  },

  async createReconciliation(data: object): Promise<Reconciliation> {
    const response = await api.post<Reconciliation>('/finance/reconciliations', data);
    return response.data;
  },

  async approveReconciliation(id: string): Promise<Reconciliation> {
    const response = await api.patch<Reconciliation>(`/finance/reconciliations/${id}/approve`);
    return response.data;
  },
};
