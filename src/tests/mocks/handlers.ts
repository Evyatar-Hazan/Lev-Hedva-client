import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Mock handlers for API requests
 */
export const handlers = [
  // Auth handlers
  http.post(`${API_BASE_URL}/auth/login`, () => {
    return HttpResponse.json({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN',
      },
    });
  }),

  http.post(`${API_BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: 'mock-new-access-token',
    });
  }),

  http.get(`${API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
    });
  }),

  // Products handlers
  http.get(`${API_BASE_URL}/products`, () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          name: 'Test Product 1',
          category: 'MEDICAL',
          availableQuantity: 5,
          totalQuantity: 10,
        },
        {
          id: '2',
          name: 'Test Product 2',
          category: 'MOBILITY',
          availableQuantity: 3,
          totalQuantity: 8,
        },
      ],
      total: 2,
    });
  }),

  http.get(`${API_BASE_URL}/products/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      name: `Test Product ${id}`,
      category: 'MEDICAL',
      availableQuantity: 5,
      totalQuantity: 10,
      description: 'Test product description',
    });
  }),

  // Loans handlers
  http.get(`${API_BASE_URL}/loans`, () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          status: 'ACTIVE',
          loanDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          borrower: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
          },
          product: {
            id: '1',
            name: 'Test Product',
          },
        },
      ],
      total: 1,
    });
  }),

  http.get(`${API_BASE_URL}/loans/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      status: 'ACTIVE',
      loanDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      borrower: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
      },
      product: {
        id: '1',
        name: 'Test Product',
      },
    });
  }),

  http.post(`${API_BASE_URL}/loans`, () => {
    return HttpResponse.json({
      id: 'new-loan-id',
      status: 'ACTIVE',
      loanDate: new Date().toISOString(),
    });
  }),

  // Volunteers handlers
  http.get(`${API_BASE_URL}/volunteers`, () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          firstName: 'Volunteer',
          lastName: 'One',
          email: 'volunteer1@example.com',
          phone: '050-1234567',
          status: 'ACTIVE',
        },
      ],
      total: 1,
    });
  }),

  // Stats handlers
  http.get(`${API_BASE_URL}/loans/statistics`, () => {
    return HttpResponse.json({
      activeLoans: 10,
      overdueLoans: 2,
      totalLoans: 50,
      returnedLoans: 40,
    });
  }),

  http.get(`${API_BASE_URL}/products/statistics`, () => {
    return HttpResponse.json({
      totalProducts: 100,
      availableProducts: 75,
      loanedProducts: 25,
    });
  }),
];

/**
 * Error handlers for testing error states
 */
export const errorHandlers = [
  http.post(`${API_BASE_URL}/auth/login`, () => {
    return HttpResponse.json(
      {
        message: 'Invalid credentials',
        statusCode: 401,
      },
      { status: 401 }
    );
  }),

  http.get(`${API_BASE_URL}/products`, () => {
    return HttpResponse.json(
      {
        message: 'Internal server error',
        statusCode: 500,
      },
      { status: 500 }
    );
  }),
];

/**
 * Network error handlers for testing network failures
 */
export const networkErrorHandlers = [
  http.get(`${API_BASE_URL}/*`, () => {
    return HttpResponse.error();
  }),

  http.post(`${API_BASE_URL}/*`, () => {
    return HttpResponse.error();
  }),
];
