import { apiClient } from '../axios';
import { 
  Product, 
  ProductInstance,
  CreateProductDto, 
  UpdateProductDto, 
  CreateProductInstanceDto,
  UpdateProductInstanceDto,
  ProductsQueryDto, 
  PaginatedResponse, 
  ApiResponse
} from '../../lib/types';

export class ProductsClient {
  private static readonly BASE_PATH = '/products';

  // Products CRUD
  static async getProducts(query?: ProductsQueryDto): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    
    if (query) {
      (Object.keys(query) as Array<keyof ProductsQueryDto>).forEach((key) => {
        const value = query[key];
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<Product>>(
      `${this.BASE_PATH}?${params.toString()}`
    );
    return response.data;
  }

  static async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  static async createProduct(productData: CreateProductDto): Promise<Product> {
    const response = await apiClient.post<Product>(this.BASE_PATH, productData);
    return response.data;
  }

  static async updateProduct(id: string, productData: UpdateProductDto): Promise<Product> {
    const response = await apiClient.put<Product>(`${this.BASE_PATH}/${id}`, productData);
    return response.data;
  }

  static async deleteProduct(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Product Instances CRUD
  static async getProductInstances(productId?: string): Promise<ProductInstance[]> {
    const path = productId 
      ? `${this.BASE_PATH}/${productId}/instances`
      : `${this.BASE_PATH}/instances`;
    
    const response = await apiClient.get<ProductInstance[]>(path);
    return response.data;
  }

  static async getProductInstanceById(id: string): Promise<ProductInstance> {
    const response = await apiClient.get<ProductInstance>(`${this.BASE_PATH}/instances/${id}`);
    return response.data;
  }

  static async createProductInstance(instanceData: CreateProductInstanceDto): Promise<ProductInstance> {
    const response = await apiClient.post<ProductInstance>(
      `${this.BASE_PATH}/instances`,
      instanceData
    );
    return response.data;
  }

  static async updateProductInstance(id: string, instanceData: UpdateProductInstanceDto): Promise<ProductInstance> {
    const response = await apiClient.patch<ProductInstance>(
      `${this.BASE_PATH}/instances/${id}`,
      instanceData
    );
    return response.data;
  }

  static async deleteProductInstance(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/instances/${id}`);
    return response.data;
  }

  static async getAvailableInstances(): Promise<ProductInstance[]> {
    const response = await apiClient.get<ProductInstance[]>(`${this.BASE_PATH}/instances/available`);
    return response.data;
  }
}