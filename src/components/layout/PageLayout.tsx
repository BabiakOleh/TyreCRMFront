import styled from 'styled-components'

export const PageLayout = styled.div`
  min-height: 100vh;
  background: #f4f6fb;
`

export const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px 64px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
`
