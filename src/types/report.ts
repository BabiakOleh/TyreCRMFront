export type ReportSummary = {
  cashBalanceCents: number
  supplierDebts: Array<{
    supplier: { id: string; name: string }
    purchasesCents: number
    paymentsCents: number
    debtCents: number
  }>
  customerDebts: Array<{
    customer: { id: string; name: string }
    salesCents: number
    paymentsCents: number
    debtCents: number
  }>
  salesByCustomer: Array<{
    customer: { id: string; name: string }
    salesCents: number
  }>
  purchasesBySupplier: Array<{
    supplier: { id: string; name: string }
    purchasesCents: number
  }>
  tiresStats: {
    totalQuantity: number
    totalSalesCents: number
    totalPurchasesCents: number
    averagePricePerTire: number | null
    averageMargin: number | null
  }
}
