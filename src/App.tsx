import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { CounterpartiesPage } from './pages/CounterpartiesPage'
import { ProductsPage } from './pages/ProductsPage'
import { PurchasesPage } from './pages/PurchasesPage'
import { PurchaseDetailsPage } from './pages/PurchaseDetailsPage'
import { ReportPage } from './pages/ReportPage'
import { SalesPage } from './pages/SalesPage'
import { ReferencePage } from './pages/ReferencePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/counterparties" element={<CounterpartiesPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/purchases/:id" element={<PurchaseDetailsPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/reference" element={<ReferencePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
