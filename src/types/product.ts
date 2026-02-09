import type { Category } from './category'
import type { TireBrand, TireLoadIndex, TireModel, TireSpeedIndex } from './tire'

export type Product = {
  id: string
  name: string
  brand: string
  model: string
  unit?: string | null
  tireSize?: string | null
  tireSpeedIndexId?: string | null
  tireSpeedIndex?: TireSpeedIndex | null
  tireLoadIndexId?: string | null
  tireLoadIndex?: TireLoadIndex | null
  tireIsXL?: boolean | null
  tireIsRunFlat?: boolean | null
  tireBrandId?: string | null
  tireBrand?: TireBrand | null
  tireModelId?: string | null
  tireModel?: TireModel | null
  autoSubcategory?: string | null
  category: Category
}

export type CreateProductInput = {
  categoryId: string
  brand: string
  model: string
  unit?: string
  tireSize?: string
  tireSpeedIndexId?: string
  tireLoadIndexId?: string
  tireIsXL?: boolean
  tireIsRunFlat?: boolean
  tireBrandId?: string
  tireModelId?: string
  autoSubcategory?: string
}
