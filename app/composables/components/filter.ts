import { ProductPlan } from '~~/prisma/generated/browser'
import { createSharedComposable } from "@vueuse/core";


// Values
const sortOptions = ['Newest', 'Popular'] as const

// Types
// type SortOption = typeof sortOptions[number]

type CategoryFilter = {
  name: string
  publicId: string
}

type ProductListFilterState = {
  keyWork: string | undefined,
  plans: ProductPlan[],
  categoryTypes: CategoryType[],
  categoryPublicIds: string[] | undefined
}

const defaultPlanFilter = [ProductPlan.FREE, ProductPlan.PRO]
const defaultCategoryTypeFilter = [CategoryType.TWO_D, CategoryType.THREE_D]

const _useFilter = () => {

  const filterStatus = ref(false)
  const filterCategories = useState(() => ref<CategoryFilter[]>([]))
  const filterState = useState(() => reactive<ProductListFilterState>({
    keyWork: undefined,
    plans: defaultPlanFilter,
    categoryTypes: defaultCategoryTypeFilter,
    categoryPublicIds: undefined
  }))

  const filterTags = computed<string[]>(() => {
    return [
      ...filterState.value.plans,
      ...filterState.value.categoryTypes,
      ...filterCategories.value.map(ftg => ftg.name)
    ]
  })

  function resetFilter() {
    filterState.value.keyWork = undefined
    filterState.value.plans = defaultPlanFilter
    filterState.value.categoryTypes = defaultCategoryTypeFilter
    filterState.value.categoryPublicIds = undefined

    filterCategories.value = []
  }

  // States
  // const sortSelected = useState(() => ref<SortOption>('Newest'))

  return {
    filterState,
    filterStatus,
    filterCategories,
    filterTags,
    resetFilter
  }
}

export const useFilter = createSharedComposable(_useFilter)