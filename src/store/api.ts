import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Category } from '../types/category'
import type { Counterparty, CounterpartyInput, CounterpartyUpdateInput } from '../types/counterparty'
import type { CreateProductInput, Product, UpdateProductInput } from '../types/product'
import type { TireBrand, TireLoadIndex, TireSpeedIndex } from '../types/tire'
import type { Unit } from '../types/unit'
import type { AutoSubcategory } from '../types/autoSubcategory'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api'
  }),
  tagTypes: ['Category', 'Product', 'Counterparty', 'Unit', 'AutoSubcategory', 'TireBrand'],
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
    createCategory: builder.mutation<Category, { name: string }>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }]
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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            api.util.updateQueryData('getProducts', undefined, (draft) => {
              if (!draft.some((item) => item.id === data.id)) {
                draft.unshift(data)
              }
            })
          )
          if (data.tireDetails?.brand && data.tireDetails?.model) {
            const brand = data.tireDetails.brand
            const model = data.tireDetails.model
            dispatch(
              api.util.updateQueryData('getTireBrands', undefined, (draft) => {
                const existingBrand = draft.find((item) => item.id === brand.id)
                if (existingBrand) {
                  const models = existingBrand.models ?? []
                  const hasModel = models.some((item) => item.id === model.id)
                  if (!hasModel) {
                    existingBrand.models = [...models, model]
                  }
                } else {
                  draft.push({ ...brand, models: [model] })
                }
              })
            )
          }
        } catch {
          // ignore cache update errors
        }
      }
    }),
    updateProduct: builder.mutation<Product, UpdateProductInput>({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            api.util.updateQueryData('getProducts', undefined, (draft) => {
              const index = draft.findIndex((item) => item.id === data.id)
              if (index !== -1) {
                draft[index] = data
              }
            })
          )
          if (data.tireDetails?.brand && data.tireDetails?.model) {
            const brand = data.tireDetails.brand
            const model = data.tireDetails.model
            dispatch(
              api.util.updateQueryData('getTireBrands', undefined, (draft) => {
                const existingBrand = draft.find((item) => item.id === brand.id)
                if (existingBrand) {
                  const models = existingBrand.models ?? []
                  const hasModel = models.some((item) => item.id === model.id)
                  if (!hasModel) {
                    existingBrand.models = [...models, model]
                  }
                } else {
                  draft.push({ ...brand, models: [model] })
                }
              })
            )
          }
        } catch {
          // ignore cache update errors
        }
      }
    }),
    deleteProduct: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE'
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            api.util.updateQueryData('getProducts', undefined, (draft) => {
              const index = draft.findIndex((item) => item.id === id)
              if (index !== -1) {
                draft.splice(index, 1)
              }
            })
          )
        } catch {
          // ignore cache update errors
        }
      }
    }),
    getTireBrands: builder.query<TireBrand[], void>({
      query: () => '/tire-brands',
      providesTags: (result) =>
        result
          ? [
              ...result.map((brand) => ({ type: 'TireBrand' as const, id: brand.id })),
              { type: 'TireBrand', id: 'LIST' }
            ]
          : [{ type: 'TireBrand', id: 'LIST' }]
    }),
    createTireBrand: builder.mutation<TireBrand, { name: string }>({
      query: (body) => ({
        url: '/tire-brands',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'TireBrand', id: 'LIST' }]
    }),
    createTireModel: builder.mutation<{ id: string; name: string; brandId: string }, { name: string; brandId: string }>({
      query: (body) => ({
        url: '/tire-models',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'TireBrand', id: 'LIST' }]
    }),
    getTireSpeedIndices: builder.query<TireSpeedIndex[], void>({
      query: () => '/tire-indices/speed'
    }),
    getTireLoadIndices: builder.query<TireLoadIndex[], void>({
      query: () => '/tire-indices/load'
    }),
    getUnits: builder.query<Unit[], void>({
      query: () => '/units',
      providesTags: (result) =>
        result
          ? [
              ...result.map((unit) => ({ type: 'Unit' as const, id: unit.id })),
              { type: 'Unit', id: 'LIST' }
            ]
          : [{ type: 'Unit', id: 'LIST' }]
    }),
    createUnit: builder.mutation<Unit, { name: string }>({
      query: (body) => ({
        url: '/units',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'Unit', id: 'LIST' }]
    }),
    getAutoSubcategories: builder.query<AutoSubcategory[], void>({
      query: () => '/auto-subcategories',
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'AutoSubcategory' as const, id: item.id })),
              { type: 'AutoSubcategory', id: 'LIST' }
            ]
          : [{ type: 'AutoSubcategory', id: 'LIST' }]
    }),
    createAutoSubcategory: builder.mutation<AutoSubcategory, { name: string }>({
      query: (body) => ({
        url: '/auto-subcategories',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'AutoSubcategory', id: 'LIST' }]
    }),
    getCounterparties: builder.query<
      Counterparty[],
      { type: 'CUSTOMER' | 'SUPPLIER'; q?: string; includeInactive?: boolean }
    >({
      query: ({ type, q, includeInactive }) => ({
        url: '/counterparties',
        params: {
          type,
          q,
          inactive: includeInactive ? '1' : undefined
        }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'Counterparty' as const, id: item.id })),
              { type: 'Counterparty', id: 'LIST' }
            ]
          : [{ type: 'Counterparty', id: 'LIST' }]
    }),
    createCounterparty: builder.mutation<Counterparty, CounterpartyInput>({
      query: (body) => ({
        url: '/counterparties',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'Counterparty', id: 'LIST' }]
    }),
    updateCounterparty: builder.mutation<Counterparty, CounterpartyUpdateInput>({
      query: ({ id, ...body }) => ({
        url: `/counterparties/${id}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: [{ type: 'Counterparty', id: 'LIST' }]
    }),
    deleteCounterparty: builder.mutation<Counterparty, string>({
      query: (id) => ({
        url: `/counterparties/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Counterparty', id: 'LIST' }]
    }),
    setCounterpartyStatus: builder.mutation<Counterparty, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/counterparties/${id}/status`,
        method: 'PATCH',
        body: { isActive }
      }),
      invalidatesTags: [{ type: 'Counterparty', id: 'LIST' }]
    })
  })
})

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetTireBrandsQuery,
  useCreateTireBrandMutation,
  useCreateTireModelMutation,
  useGetTireSpeedIndicesQuery,
  useGetTireLoadIndicesQuery,
  useGetUnitsQuery,
  useCreateUnitMutation,
  useGetAutoSubcategoriesQuery,
  useCreateAutoSubcategoryMutation,
  useGetCounterpartiesQuery,
  useCreateCounterpartyMutation,
  useUpdateCounterpartyMutation,
  useDeleteCounterpartyMutation,
  useSetCounterpartyStatusMutation
} = api
