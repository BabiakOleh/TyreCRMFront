import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

export const SidebarWrapper = styled.aside`
  width: 240px;
  background: #27303b;
  color: #cfd6dd;
  display: flex;
  flex-direction: column;
  align-items: stretch;
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
  align-items: stretch;
`

export const NavItem = styled(NavLink)`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  color: #cfd6dd;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  &.active {
    background: #55b982;
    color: #ffffff;
  }
`