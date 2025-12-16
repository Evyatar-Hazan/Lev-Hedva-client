// User types based on Prisma schema
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: UserRole;
  isActive: boolean;
  refreshToken?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  WORKER = 'WORKER',
  VOLUNTEER = 'VOLUNTEER',
  CLIENT = 'CLIENT',
}

// Permission types
export interface Permission {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface UserPermission {
  id: string;
  userId: string;
  permissionId: string;
  grantedAt: string;
  grantedBy?: string;
  permission: Permission;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  manufacturer?: string;
  model?: string;
  createdAt: string;
  updatedAt: string;
  instances?: ProductInstance[];
}

export interface ProductInstance {
  id: string;
  productId: string;
  barcode: string;
  serialNumber?: string;
  condition: string;
  isAvailable: boolean;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

// Loan types
export interface Loan {
  id: string;
  userId: string;
  productInstanceId: string;
  status: LoanStatus;
  loanDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  productInstance: ProductInstance;
}

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
  LOST = 'LOST',
}

// Volunteer Activity types
export interface VolunteerActivity {
  id: string;
  volunteerId: string;
  activityType: string;
  description: string;
  hours: number;
  date: string;
  createdAt: string;
  volunteer: User;
}

// Audit Log types
export interface AuditLog {
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
  user?: User;
}

// Session types
export interface Session {
  id: string;
  userId: string;
  refreshToken: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}
