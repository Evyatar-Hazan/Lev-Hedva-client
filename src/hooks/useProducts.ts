import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductsClient } from '../api/clients/products.client';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateProductInstanceDto,
  UpdateProductInstanceDto,
  ProductsQueryDto,
} from '../lib/types';

const PRODUCTS_QUERY_KEY = ['products'];
const PRODUCT_INSTANCES_QUERY_KEY = ['product-instances'];

// Hook to get list of products
export const useProducts = (params?: ProductsQueryDto) => {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, params],
    queryFn: () => ProductsClient.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get single product
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, id],
    queryFn: () => ProductsClient.getProductById(id),
    enabled: !!id,
  });
};

// Hook to create new product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: CreateProductDto) => ProductsClient.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['product-manufacturers'] });
    },
  });
};

// Hook to update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, productData }: { id: string; productData: UpdateProductDto }) =>
      ProductsClient.updateProduct(id, productData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['product-manufacturers'] });
    },
  });
};

// Hook to delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ProductsClient.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['product-manufacturers'] });
    },
  });
};

// Product Instances hooks
// Hook to get list of product instances
export const useProductInstances = (productId?: string) => {
  return useQuery({
    queryKey: [...PRODUCT_INSTANCES_QUERY_KEY, productId],
    queryFn: () => ProductsClient.getProductInstances(productId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get single product instance
export const useProductInstance = (id: string) => {
  return useQuery({
    queryKey: [...PRODUCT_INSTANCES_QUERY_KEY, id],
    queryFn: () => ProductsClient.getProductInstanceById(id),
    enabled: !!id,
  });
};

// Hook to create new product instance
export const useCreateProductInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (instanceData: CreateProductInstanceDto) =>
      ProductsClient.createProductInstance(instanceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_INSTANCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
};

// Hook to update product instance
export const useUpdateProductInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, instanceData }: { id: string; instanceData: UpdateProductInstanceDto }) =>
      ProductsClient.updateProductInstance(id, instanceData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_INSTANCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PRODUCT_INSTANCES_QUERY_KEY, variables.id] });
    },
  });
};

// Hook to delete product instance
export const useDeleteProductInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ProductsClient.deleteProductInstance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_INSTANCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
};

// Hook to get available product instances
export const useAvailableInstances = () => {
  return useQuery({
    queryKey: [...PRODUCT_INSTANCES_QUERY_KEY, 'available'],
    queryFn: () => ProductsClient.getAvailableInstances(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to get product categories
export const useProductCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: () => ProductsClient.getProductCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get manufacturers
export const useProductManufacturers = () => {
  return useQuery({
    queryKey: ['product-manufacturers'],
    queryFn: () => ProductsClient.getProductManufacturers(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
