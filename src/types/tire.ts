export type TireBrand = {
  id: string
  name: string
  models?: TireModel[]
}

export type TireModel = {
  id: string
  name: string
  brandId: string
}

export type TireSpeedIndex = {
  id: string
  code: string
  maxKph: number
}

export type TireLoadIndex = {
  id: string
  code: string
  maxKg: number
}
