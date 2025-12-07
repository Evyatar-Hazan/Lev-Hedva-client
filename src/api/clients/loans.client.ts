import { apiClient } from '../axios';
import { 
  Loan, 
  CreateLoanDto, 
  UpdateLoanDto, 
  LoansQueryDto, 
  PaginatedResponse
} from '../../lib/types';

export class LoansClient {
  private static readonly BASE_PATH = '/loans';

  static async getLoans(query?: LoansQueryDto): Promise<PaginatedResponse<Loan>> {
    const params = new URLSearchParams();
    
    if (query) {
      (Object.keys(query) as Array<keyof LoansQueryDto>).forEach((key) => {
        const value = query[key];
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<Loan>>(
      `${this.BASE_PATH}?${params.toString()}`
    );
    return response.data;
  }

  static async getLoanById(id: string): Promise<Loan> {
    const response = await apiClient.get<Loan>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  static async createLoan(loanData: CreateLoanDto): Promise<Loan> {
    const response = await apiClient.post<Loan>(this.BASE_PATH, loanData);
    return response.data;
  }

  static async updateLoan(id: string, loanData: UpdateLoanDto): Promise<Loan> {
    const response = await apiClient.patch<Loan>(`${this.BASE_PATH}/${id}`, loanData);
    return response.data;
  }

  static async returnLoan(id: string): Promise<Loan> {
    const response = await apiClient.post<Loan>(`${this.BASE_PATH}/${id}/return`);
    return response.data;
  }

  static async getOverdueLoans(): Promise<Loan[]> {
    const response = await apiClient.get<Loan[]>(`${this.BASE_PATH}/overdue`);
    return response.data;
  }

  static async getActiveLoans(): Promise<Loan[]> {
    const response = await apiClient.get<Loan[]>(`${this.BASE_PATH}/active`);
    return response.data;
  }

  static async getUserLoans(userId: string): Promise<Loan[]> {
    const response = await apiClient.get<Loan[]>(`${this.BASE_PATH}/user/${userId}`);
    return response.data;
  }

  static async getLoanStats(): Promise<{
    active: number;
    overdue: number;
    returned: number;
    lost: number;
  }> {
    const response = await apiClient.get<{
      active: number;
      overdue: number;
      returned: number;
      lost: number;
    }>(`${this.BASE_PATH}/stats`);
    return response.data;
  }
}