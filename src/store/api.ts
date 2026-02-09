import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Category } from '../types/category'
import type { CreateProductInput, Product } from '../types/product'
import type { TireBrand, TireLoadIndex, TireModel, TireSpeedIndex } from '../types/tire'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api'
  }),
  tagTypes: ['Category', 'Product'],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: (result) =>
        result
          ? [
              ...result.map((category) => ({ type: 'Category' as const, id: category.id })),
              { type: 'Category', id: 'LIST' }
            ]
          : [{ type: 'Category', id: 'LIST' }]
    }),
    getProducts: builder.query<Product[], void>({
      query: () => '/products',
      providesTags: (result) =>
        result
          ? [
              ...result.map((product) => ({ type: 'Product' as const, id: product.id })),
              { type: 'Product', id: 'LIST' }
            ]
          : [{ type: 'Product', id: 'LIST' }]
    }),
    createProduct: builder.mutation<Product, CreateProductInput>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }]
    }),
    getTireBrands: builder.query<TireBrand[], void>({
      query: () => '/tire-brands'
    }),
    createTireBrand: builder.mutation<TireBrand, { name: string }>({
      query: (body) => ({
        url: '/tire-brands',
        method: 'POST',
        body
      })
    }),
    createTireModel: builder.mutation<TireModel, { brandId: string; name: string }>({
      query: (body) => ({
        url: '/tire-models',
        method: 'POST',
        body
      })
    }),
    getTireSpeedIndices: builder.query<TireSpeedIndex[], void>({
      query: () => '/tire-indices/speed'
    }),
    getTireLoadIndices: builder.query<TireLoadIndex[], void>({
      query: () => '/tire-indices/load'
    })
  })
})

export const {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useGetTireBrandsQuery,
  useCreateTireBrandMutation,
  useCreateTireModelMutation,
  useGetTireSpeedIndicesQuery,
  useGetTireLoadIndicesQuery
} = api
