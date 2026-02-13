import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

export const SidebarWrapper = styled.aside`
  width: 92px;
  background: #27303b;
  color: #cfd6dd;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  gap: 18px;
`

export const Brand = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #1b222b;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #ffffff;
`

export const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  align-items: center;
`

export const NavItem = styled(NavLink)`
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