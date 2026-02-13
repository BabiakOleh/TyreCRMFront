import { AppBar, Box, Toolbar, Typography } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { Sidebar } from '../navigation/Sidebar'

const Shell = styled.div`
  display: grid;
  grid-template-columns: 92px 1fr;
  min-height: 100vh;
  background: #f4f6fb;
`

const Main = styled.div`
  display: flex;
  flex-direction: column;
`

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/products': { title: 'Товари', subtitle: 'Облік шин та автотоварів' },
  '/counterparties': { title: 'Контрагенти' },
  '/sales': { title: 'Продажі' },
  '/purchases': { title: 'Закупки' },
  '/stock': { title: 'Залишки' },
  '/report': { title: 'Звіт' },
  '/reference': { title: 'Довідник' },
}

export const AppShell = () => {
  const location = useLocation()
  const meta =
    location.pathname.startsWith('/purchases/')
      ? { title: 'Документ закупки' }
      : location.pathname.startsWith('/sales/')
        ? { title: 'Документ продажу' }
        : pageTitles[location.pathname] ?? pageTitles['/products']

  return (
    <Shell>
      <Sidebar />
      <Main>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {meta.title}
              </Typography>
              {meta.subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {meta.subtitle}
                </Typography>
              )}
            </Box>
          </Toolbar>
        </AppBar>
        <Outlet />
      </Main>
    </Shell>
  )
}
