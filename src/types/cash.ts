import type { Counterparty } from './counterparty'

export type CashDocumentType = 'INCOME' | 'EXPENSE'

export type CashDocumentSubtype =
  | 'SUPPLIER_PAYMENT'
  | 'OTHER_EXPENSE'
  | 'CUSTOMER_PAYMENT'
  | 'OTHER_INCOME'

export type CashDocument = {
  id: string
  date: string
  type: CashDocumentType
  subtype: CashDocumentSubtype
  counterpartyId: string | null
  counterparty: Counterparty | null
  amountCents: number
  note: string | null
  createdAt: string
  updatedAt: string
}

export type CreateCashDocumentInput = {
  date: string
  type: CashDocumentType
  subtype: CashDocumentSubtype
  counterpartyId?: string
  amountCents: number
  note?: string
}
