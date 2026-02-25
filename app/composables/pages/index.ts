import { ProductPlan } from '~~/prisma/generated/browser'


// Values
const sortOptions = ['Newest', 'Popular'] as const

// Types
type SortOption = typeof sortOptions[number]

type ProductListFilterState = {
  plans: ProductPlan[],
  categoryTypes: CategoryType[],
  categoryPublicIds: string[] | undefined
}

export const useIndex = () => {

  const filterState = useState(() => reactive<ProductListFilterState>({
    plans: [ProductPlan.FREE, ProductPlan.PRO],
    categoryTypes: [CategoryType.TWO_D, CategoryType.THREE_D],
    categoryPublicIds: undefined
  }))

  // States
  const sortSelected = useState(() => ref<SortOption>('Newest'))

  return {
    filterState,
  }
}
