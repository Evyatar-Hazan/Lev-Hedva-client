import { UserRole } from './models';

// Auth DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    permissions: string[];
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// User DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
}

// Product DTOs
export interface CreateProductDto {
  name: string;
  description?: string;
  category: string;
  manufacturer?: string;
  model?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  model?: string;
}

export interface CreateProductInstanceDto {
  productId: string;
  barcode: string;
  serialNumber?: string;
  condition?: string;
  location?: string;
  notes?: string;
}

export interface UpdateProductInstanceDto {
  barcode?: string;
  serialNumber?: string;
  condition?: string;
  isAvailable?: boolean;
  location?: string;
  notes?: string;
}

// Loan DTOs
export interface CreateLoanDto {
  userId: string;
  productInstanceId: string;
  expectedReturnDate?: string;
  notes?: string;
}

export interface UpdateLoanDto {
  expectedReturnDate?: string;
  actualReturnDate?: string;
  notes?: string;
}

// Volunteer Activity DTOs
export interface CreateVolunteerActivityDto {
  volunteerId: string;
  activityType: string;
  description: string;
  hours: number;
  date: string;
}

export interface UpdateVolunteerActivityDto {
  activityType?: string;
  description?: string;
  hours?: number;
  date?: string;
}

// Audit Log DTOs
export interface CreateAuditLogDto {
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogResponseDto {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  description: string;
  metadata?: Record<string, unknown>;
  endpoint?: string;
  httpMethod?: string;
  statusCode?: number;
  executionTime?: number;
  errorMessage?: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Query DTOs
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UsersQueryDto extends PaginationQuery {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface ProductsQueryDto extends PaginationQuery {
  search?: string;
  category?: string;
}

export interface LoansQueryDto extends PaginationQuery {
  userId?: string;
  status?: string;
  overdue?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface VolunteerActivitiesQueryDto extends PaginationQuery {
  volunteerId?: string;
  activityType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogsQueryDto extends PaginationQuery {
  action?: string;
  entityType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Response DTOs
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}