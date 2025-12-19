export default {
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  })),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

export class AxiosError extends Error {
  constructor(
    message: string,
    public code?: string,
    public config?: any,
    public request?: any,
    public response?: any
  ) {
    super(message);
    this.name = 'AxiosError';
  }

  static isAxiosError(payload: any): payload is AxiosError {
    return payload && payload.isAxiosError === true;
  }
}
