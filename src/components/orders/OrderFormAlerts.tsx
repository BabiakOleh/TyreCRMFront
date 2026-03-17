import { Alert } from '@mui/material'

type Props = {
  formError: string | null
  stockWarning: string | null
  createError: unknown
  createErrorMessage: string
}

export const OrderFormAlerts = ({
  formError,
  stockWarning,
  createError,
  createErrorMessage
}: Props) => (
  <>
    {formError && <Alert severity="warning">{formError}</Alert>}
    {stockWarning && <Alert severity="error">{stockWarning}</Alert>}
    {createError && <Alert severity="error">{createErrorMessage}</Alert>}
  </>
)
