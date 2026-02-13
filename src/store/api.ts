import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Category } from '../types/category'
import type { Counterparty, CounterpartyInput, CounterpartyUpdateInput } from '../types/counterparty'
import type { CreateProductInput, Product, UpdateProductInput } from '../types/product'
import type { TireBrand, TireLoadIndex, TireSpeedIndex } from '../types/tire'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api'
  }),
  tagTypes: ['Category', 'Product', 'Counterparty'],
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
          if (data.tireBrand && data.tireModel) {
            const brand = data.tireBrand
            const model = data.tireModel
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
          if (data.tireBrand && data.tireModel) {
            const brand = data.tireBrand
            const model = data.tireModel
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
      query: () => '/tire-brands'
    }),
    getTireSpeedIndices: builder.query<TireSpeedIndex[], void>({
      query: () => '/tire-indices/speed'
    }),
    getTireLoadIndices: builder.query<TireLoadIndex[], void>({
      query: () => '/tire-indices/load'
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
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetTireBrandsQuery,
  useGetTireSpeedIndicesQuery,
  useGetTireLoadIndicesQuery,
  useGetCounterpartiesQuery,
  useCreateCounterpartyMutation,
  useUpdateCounterpartyMutation,
  useDeleteCounterpartyMutation,
  useSetCounterpartyStatusMutation
} = api
