import { CategorySection } from '../components/categories/CategorySection'
import { ProductSection } from '../components/products/ProductSection'
import { Content, Grid } from '../components/layout/PageLayout'

export const ProductsPage = () => (
  <Content>
    <Grid>
      <CategorySection />
      <ProductSection />
    </Grid>
  </Content>
)
