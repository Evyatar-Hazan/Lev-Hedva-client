import { apiClient } from '../axios';
import { Loan, CreateLoanDto, UpdateLoanDto, LoansQueryDto } from '../../lib/types';

// Define the response interface to match server response
interface LoansListResponse {
  loans: Loan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface LoanStatsResponse {
  totalActiveLoans: number;
  totalOverdueLoans: number;
  totalReturnedLoans: number;
  totalLostItems: number;
  averageLoanDuration: number;
  loansByCategory: { category: string; count: number }[];
  overdueByUser: { userId: string; userName: string; count: number }[];
}

export class LoansClient {
  private static readonly BASE_PATH = '/loans';

  static async getLoans(query?: LoansQueryDto): Promise<LoansListResponse> {
    const params = new URLSearchParams();

    if (query) {
      (Object.keys(query) as Array<keyof LoansQueryDto>).forEach(key => {
        const value = query[key];
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<LoansListResponse>(
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
    const response = await apiClient.put<Loan>(`${this.BASE_PATH}/${id}`, loanData);
    return response.data;
  }

  static async returnLoan(id: string): Promise<Loan> {
    const response = await apiClient.patch<Loan>(`${this.BASE_PATH}/${id}/return`);
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

  static async getLoanStats(): Promise<LoanStatsResponse> {
    const response = await apiClient.get<LoanStatsResponse>(`${this.BASE_PATH}/stats`);
    return response.data;
  }
}
