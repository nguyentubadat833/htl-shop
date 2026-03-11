import { ProductPlan } from '~~/prisma/generated/browser'
import { createSharedComposable } from "@vueuse/core";


// Values
const sortOptions = ['Newest', 'Popular'] as const

// Types
// type SortOption = typeof sortOptions[number]

type ProductListFilterState = {
  keyWork: string | undefined,
  plans: ProductPlan[],
  categoryTypes: CategoryType[],
  categoryPublicIds: string[] | undefined
}

const _useFilter = () => {

  const filterStatus = ref(false)
  const filterState = useState(() => reactive<ProductListFilterState>({
    keyWork: undefined,
    plans: [ProductPlan.FREE, ProductPlan.PRO],
    categoryTypes: [CategoryType.TWO_D, CategoryType.THREE_D],
    categoryPublicIds: undefined
  }))

  const filterTags = computed<string[]>(() => {
    return [
      ...filterState.value.plans,
      ...filterState.value.categoryTypes
    ]
  })

  // States
  // const sortSelected = useState(() => ref<SortOption>('Newest'))

  return {
    filterState,
    filterStatus
  }
}

export const useFilter = createSharedComposable(_useFilter)