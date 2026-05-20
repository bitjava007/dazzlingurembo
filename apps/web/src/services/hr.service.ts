import api from '@/lib/api';
import type { Employee, Department, AttendanceRecord, PayrollRun, SalaryAdvance, PaginatedResponse, ListParams } from '@/types';

export const hrService = {
  async getEmployees(params?: ListParams): Promise<PaginatedResponse<Employee>> {
    const response = await api.get<PaginatedResponse<Employee>>('/hr/employees', { params });
    return response.data;
  },

  async getEmployee(id: string): Promise<Employee> {
    const response = await api.get<Employee>(`/hr/employees/${id}`);
    return response.data;
  },

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const response = await api.post<Employee>('/hr/employees', data);
    return response.data;
  },

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    const response = await api.patch<Employee>(`/hr/employees/${id}`, data);
    return response.data;
  },

  async getDepartments(params?: ListParams): Promise<PaginatedResponse<Department>> {
    const response = await api.get<PaginatedResponse<Department>>('/hr/departments', { params });
    return response.data;
  },

  async createDepartment(data: Partial<Department>): Promise<Department> {
    const response = await api.post<Department>('/hr/departments', data);
    return response.data;
  },

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    const response = await api.patch<Department>(`/hr/departments/${id}`, data);
    return response.data;
  },

  async deleteDepartment(id: string): Promise<void> {
    await api.delete(`/hr/departments/${id}`);
  },

  async getAttendance(params?: ListParams): Promise<PaginatedResponse<AttendanceRecord>> {
    const response = await api.get<PaginatedResponse<AttendanceRecord>>('/hr/attendance', { params });
    return response.data;
  },

  async getPayrollRuns(params?: ListParams): Promise<PaginatedResponse<PayrollRun>> {
    const response = await api.get<PaginatedResponse<PayrollRun>>('/hr/payroll', { params });
    return response.data;
  },

  async approvePayroll(id: string): Promise<PayrollRun> {
    const response = await api.patch<PayrollRun>(`/hr/payroll/${id}/approve`);
    return response.data;
  },

  async payPayroll(id: string): Promise<PayrollRun> {
    const response = await api.patch<PayrollRun>(`/hr/payroll/${id}/pay`);
    return response.data;
  },

  async getSalaryAdvances(params?: object): Promise<PaginatedResponse<SalaryAdvance>> {
    const response = await api.get<PaginatedResponse<SalaryAdvance>>('/hr/salary-advances', { params });
    return response.data;
  },

  async createSalaryAdvance(data: object): Promise<SalaryAdvance> {
    const response = await api.post<SalaryAdvance>('/hr/salary-advances', data);
    return response.data;
  },

  async approveSalaryAdvance(id: string): Promise<SalaryAdvance> {
    const response = await api.patch<SalaryAdvance>(`/hr/salary-advances/${id}/approve`);
    return response.data;
  },

  async rejectSalaryAdvance(id: string, reason: string): Promise<SalaryAdvance> {
    const response = await api.patch<SalaryAdvance>(`/hr/salary-advances/${id}/reject`, { reason });
    return response.data;
  },

  async repaySalaryAdvance(id: string): Promise<SalaryAdvance> {
    const response = await api.patch<SalaryAdvance>(`/hr/salary-advances/${id}/repay`);
    return response.data;
  },
};
