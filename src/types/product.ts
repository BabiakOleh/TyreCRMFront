import type { Category } from './category'
import type { TireBrand, TireLoadIndex, TireModel, TireSpeedIndex } from './tire'
import type { Unit } from './unit'
import type { AutoSubcategory } from './autoSubcategory'

export type Product = {
  id: string
  name: string
  unit?: Unit | null
  category: Category
  tireDetails?: TireProduct | null
  autoDetails?: AutoProduct | null
}

export type CreateProductInput = {
  categoryId: string
  unitId?: string
  tireSize?: string
  tireSpeedIndexId?: string
  tireLoadIndexId?: string
  tireIsXL?: boolean
  tireIsRunFlat?: boolean
  tireBrandId?: string
  tireModelId?: string
  tireBrandName?: string
  tireModelName?: string
  autoBrand?: string
  autoModel?: string
  autoSubcategoryId?: string
}

export type UpdateProductInput = CreateProductInput & {
  id: string
}

export type TireProduct = {
  id: string
  brand: TireBrand
  model: TireModel
  size: string
  speedIndex: TireSpeedIndex
  loadIndex: TireLoadIndex
  isXL: boolean
  isRunFlat: boolean
}

export type AutoProduct = {
  id: string
  brand: string
  model: string
  subcategory: AutoSubcategory
}
