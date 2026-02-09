import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'

const SidebarWrapper = styled.aside`
  width: 92px;
  background: #27303b;
  color: #cfd6dd;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  gap: 18px;
`

const Brand = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #1b222b;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #ffffff;
`

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  align-items: center;
`

const NavItem = styled(NavLink)`
  width: 72px;
  padding: 12px 8px;
  border-radius: 12px;
  color: #cfd6dd;
  text-decoration: none;
  display: grid;
  place-items: center;
  gap: 6px;
  font-size: 11px;

  &.active {
    background: #55b982;
    color: #ffffff;
  }
`

const navItems = [
  { to: '/products', label: 'Товари', icon: <Inventory2OutlinedIcon fontSize="small" /> },
  { to: '/counterparties', label: 'Контрагенти', icon: <PeopleOutlineIcon fontSize="small" /> },
  { to: '/sales', label: 'Продажі', icon: <ShoppingCartOutlinedIcon fontSize="small" /> },
  { to: '/purchases', label: 'Закупки', icon: <LocalShippingOutlinedIcon fontSize="small" /> },
  { to: '/report', label: 'Звіт', icon: <AssessmentOutlinedIcon fontSize="small" /> }
]

export const Sidebar = () => (
  <SidebarWrapper>
    <Brand>TC</Brand>
    <Nav>
      {navItems.map((item) => (
        <NavItem key={item.to} to={item.to}>
          {item.icon}
          <span>{item.label}</span>
        </NavItem>
      ))}
    </Nav>
  </SidebarWrapper>
)
