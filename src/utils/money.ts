export const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('uk-UA')

export const formatMoney = (cents: number): string => `${(cents / 100).toFixed(2)} грн`

export const parseMoneyToCents = (value: string): number => {
  const normalized = value.replace(',', '.').trim()
  if (!normalized) return 0
  const parsed = Number(normalized)
  return Number.isNaN(parsed) ? 0 : Math.round(parsed * 100)
}
