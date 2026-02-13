import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import { Brand, Nav, NavItem, SidebarWrapper } from './styles'

const navItems = [
  { to: '/reference', label: 'Довідник', icon: <AssignmentOutlinedIcon fontSize="small" /> },
  { to: '/products', label: 'Товари', icon: <Inventory2OutlinedIcon fontSize="small" /> },
  { to: '/counterparties', label: 'Контрагенти', icon: <PeopleOutlineIcon fontSize="small" /> },
  { to: '/sales', label: 'Продажі', icon: <ShoppingCartOutlinedIcon fontSize="small" /> },
  { to: '/purchases', label: 'Закупки', icon: <LocalShippingOutlinedIcon fontSize="small" /> },
  { to: '/stock', label: 'Залишки', icon: <WarehouseOutlinedIcon fontSize="small" /> },
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
