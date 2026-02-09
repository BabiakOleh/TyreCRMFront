import styled from 'styled-components'
import {
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@mui/material'
import { SectionCard } from '../shared/SectionCard'
import { useGetCategoriesQuery } from '../../store/api'

const Info = styled.p`
  margin: 0;
  color: #4b5563;
  font-size: 0.95rem;
`

export const CategorySection = () => {
  const { data, isLoading, isError } = useGetCategoriesQuery()

  return (
    <SectionCard>
      <Typography variant="h6">Категорії</Typography>

      <Info>Доступні фіксовані категорії: Шини та Автотовари.</Info>

      {isLoading && <CircularProgress size={28} />}
      {isError && <Alert severity="error">Не вдалося завантажити категорії</Alert>}

      <List dense>
        {(data ?? []).map((category) => (
          <ListItem key={category.id} divider>
            <ListItemText primary={category.name} />
          </ListItem>
        ))}
      </List>
    </SectionCard>
  )
}
