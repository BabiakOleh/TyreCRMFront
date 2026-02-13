import { useMemo, useState } from 'react'
import {
  Alert,
  CircularProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import { Content } from '../components/layout/PageLayout'
import { SectionCard } from '../components/shared/SectionCard'
import { useGetStockQuery } from '../store/api'
import type { StockItem } from '../types/stock'

const CATEGORY_TIRE = 'Шини'

const formatDetails = (item: StockItem) => {
  if (item.product.category?.name === CATEGORY_TIRE) {
    const details = item.product.tireDetails
    if (!details) return '—'
    return `${details.size || ''} ${details.loadIndex?.code || ''}${details.speedIndex?.code || ''} ${
      details.isXL ? 'XL' : ''
    } ${details.isRunFlat ? 'RunFlat' : ''}`.trim()
  }
  const auto = item.product.autoDetails
  if (!auto) return '—'
  return `${auto.subcategory?.name || ''} ${auto.brand || ''} ${auto.model || ''}`.trim()
}

export const StockPage = () => {
  const { data = [], isLoading, isError } = useGetStockQuery()
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'TIRE' | 'AUTO'>('ALL')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return data.filter((item) => {
      const isTire = item.product.category?.name === CATEGORY_TIRE
      if (categoryFilter === 'TIRE' && !isTire) return false
      if (categoryFilter === 'AUTO' && isTire) return false
      if (!query) return true
      const name = item.product.name.toLowerCase()
      const details = formatDetails(item).toLowerCase()
      return name.includes(query) || details.includes(query)
    })
  }, [data, categoryFilter, search])

  return (
    <Content>
      <SectionCard>
        <Typography variant="h6">Залишки</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Категорія"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as 'ALL' | 'TIRE' | 'AUTO')}
          >
            <MenuItem value="ALL">Всі</MenuItem>
            <MenuItem value="TIRE">Шини</MenuItem>
            <MenuItem value="AUTO">Автотовари</MenuItem>
          </TextField>
          <TextField
            label="Пошук по деталям"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="275/35R19 100Y XL, бренд, модель..."
            fullWidth
          />
        </Stack>

        {isLoading && <CircularProgress size={28} />}
        {isError && <Alert severity="error">Не вдалося завантажити залишки</Alert>}

        {!isLoading && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Товар</TableCell>
                <TableCell>Категорія</TableCell>
                <TableCell>Деталі</TableCell>
                <TableCell>Залишок</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.product.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>{item.product.category?.name ?? '—'}</TableCell>
                  <TableCell>{formatDetails(item)}</TableCell>
                  <TableCell>{item.availableQty}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>Немає даних</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </Content>
  )
}
