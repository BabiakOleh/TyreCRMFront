import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Category } from '../types/category'
import type { CreateProductInput, Product } from '../types/product'
import type { TireBrand, TireLoadIndex, TireSpeedIndex } from '../types/tire'

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
    getTireBrands: builder.query<TireBrand[], void>({
      query: () => '/tire-brands'
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
  useGetTireSpeedIndicesQuery,
  useGetTireLoadIndicesQuery
} = api
