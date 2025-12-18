/**
 * Test data factories for generating mock data
 *
 * Note: Using direct Faker imports instead of the main faker instance
 * to avoid TypeScript compatibility issues with older TS versions
 */

/**
 * Generate a mock user
 */
export const createMockUser = (overrides: any = {}) => ({
  id: Math.random().toString(36).substring(7),
  email: `user${Date.now()}@example.com`,
  firstName: 'John',
  lastName: 'Doe',
  phone: '050-1234567',
  role: 'USER',
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Generate a mock admin user
 */
export const createMockAdmin = (overrides: any = {}) =>
  createMockUser({
    role: 'ADMIN',
    ...overrides,
  });

/**
 * Generate a mock product
 */
export const createMockProduct = (overrides: any = {}) => {
  const categories = ['MEDICAL', 'MOBILITY', 'DAILY_LIVING', 'OTHER'];
  return {
    id: Math.random().toString(36).substring(7),
    name: `Product ${Math.floor(Math.random() * 1000)}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    description: 'Test product description',
    totalQuantity: Math.floor(Math.random() * 50) + 1,
    availableQuantity: Math.floor(Math.random() * 50),
    serialNumber: `SN${Math.floor(Math.random() * 10000)}`,
    manufacturer: 'Test Manufacturer',
    model: 'Model X',
    purchaseDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Generate a mock loan
 */
export const createMockLoan = (overrides: any = {}) => {
  const statuses = ['ACTIVE', 'RETURNED', 'OVERDUE'];
  return {
    id: Math.random().toString(36).substring(7),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    loanDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: null,
    notes: 'Test loan notes',
    borrower: createMockUser(),
    product: createMockProduct(),
    createdBy: createMockAdmin(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Generate an active loan
 */
export const createMockActiveLoan = (overrides: any = {}) =>
  createMockLoan({
    status: 'ACTIVE',
    returnDate: null,
    ...overrides,
  });

/**
 * Generate an overdue loan
 */
export const createMockOverdueLoan = (overrides: any = {}) =>
  createMockLoan({
    status: 'OVERDUE',
    dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: null,
    ...overrides,
  });

/**
 * Generate a mock volunteer
 */
export const createMockVolunteer = (overrides: any = {}) => {
  const statuses = ['ACTIVE', 'INACTIVE'];
  return {
    id: Math.random().toString(36).substring(7),
    firstName: 'Volunteer',
    lastName: 'Person',
    email: `volunteer${Date.now()}@example.com`,
    phone: '050-7654321',
    status: statuses[Math.floor(Math.random() * statuses.length)],
    joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Test volunteer notes',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Generate mock statistics
 */
export const createMockStatistics = (overrides: any = {}) => ({
  activeLoans: Math.floor(Math.random() * 100),
  overdueLoans: Math.floor(Math.random() * 20),
  totalLoans: Math.floor(Math.random() * 900) + 100,
  returnedLoans: Math.floor(Math.random() * 450) + 50,
  totalProducts: Math.floor(Math.random() * 450) + 50,
  availableProducts: Math.floor(Math.random() * 380) + 20,
  loanedProducts: Math.floor(Math.random() * 90) + 10,
  activeVolunteers: Math.floor(Math.random() * 45) + 5,
  ...overrides,
});

/**
 * Generate an array of mock items
 */
export const createMockArray = <T>(factory: (overrides?: any) => T, count: number): T[] => {
  return Array.from({ length: count }, () => factory());
};
