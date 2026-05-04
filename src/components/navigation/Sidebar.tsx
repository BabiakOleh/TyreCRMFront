import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import { Brand, Nav, NavItem, SidebarWrapper } from './styles'
import { NAV_ITEMS_LABELS } from '../../constants/labels'

const navItems = [
  {
    to: '/reference',
    label: NAV_ITEMS_LABELS.reference,
    icon: <AssignmentOutlinedIcon fontSize="small" />
  },
  {
    to: '/products',
    label: NAV_ITEMS_LABELS.products,
    icon: <Inventory2OutlinedIcon fontSize="small" />
  },
  {
    to: '/counterparties',
    label: NAV_ITEMS_LABELS.counterparties,
    icon: <PeopleOutlineIcon fontSize="small" />
  },
  {
    to: '/sales',
    label: NAV_ITEMS_LABELS.sales,
    icon: <ShoppingCartOutlinedIcon fontSize="small" />
  },
  {
    to: '/purchases',
    label: NAV_ITEMS_LABELS.purchases,
    icon: <LocalShippingOutlinedIcon fontSize="small" />
  },
  {
    to: '/stock',
    label: NAV_ITEMS_LABELS.stock,
    icon: <WarehouseOutlinedIcon fontSize="small" />
  },
  {
    to: '/cash',
    label: NAV_ITEMS_LABELS.cash,
    icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />
  },
  {
    to: '/report',
    label: NAV_ITEMS_LABELS.report,
    icon: <AssessmentOutlinedIcon fontSize="small" />
  }
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
