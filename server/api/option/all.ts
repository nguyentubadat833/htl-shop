export default defineWrappedRequiredAdminHandler(async (event) => {
  const rows = await prisma.defineOption.findMany({
    where: {
      key: {
        in: [
          'platform',
          'render',
          'colors',
          'style',
          'materials',
          'formfactor'
        ]
      },
      value: {
        not: ''
      }
    },
    select: {
      key: true,
      value: true
    },
  })
  const grouped = rows.reduce<Record<string, string[]>>((acc, item) => {
    if (!acc[item.key]) {
      acc[item.key] = []
    }
    acc[item.key].push(item.value)
    return acc
  }, {})

  return grouped
});
