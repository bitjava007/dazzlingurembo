import api from '@/lib/api';
import type { Expense, CashClosure, ExchangeRate, JournalEntry, PaginatedResponse, ListParams } from '@/types';

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
};
