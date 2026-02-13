export type CounterpartyType = 'CUSTOMER' | 'SUPPLIER'

export type Counterparty = {
  id: string
  type: CounterpartyType
  name: string
  phone: string
  email?: string | null
  taxId?: string | null
  address?: string | null
  note?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CounterpartyInput = {
  type: CounterpartyType
  name: string
  phone: string
  email?: string
  taxId?: string
  address?: string
  note?: string
}

export type CounterpartyUpdateInput = CounterpartyInput & {
  id: string
}
