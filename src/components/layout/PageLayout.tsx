import styled from 'styled-components'

export const PageLayout = styled.div`
  min-height: 100vh;
  background: #f4f6fb;
`

export const Content = styled.main`
  max-width: 100%;
  margin: 0;
  width: 100%;
  padding: 32px 20px 64px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  /* Mobile */
  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;
