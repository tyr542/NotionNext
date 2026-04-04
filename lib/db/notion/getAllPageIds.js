import BLOG from '@/blog.config'

export default function getAllPageIds(
  collectionQuery,
  collectionId,
  collectionView,
  viewIds,
  block = {}
) {
  const pageSet = new Set()
  const processedViewIds = new Set()

  const addIds = ids => {
    if (Array.isArray(ids)) {
      ids.forEach(id => pageSet.add(id))
    }
  }

  const addPageSort = pageSort => {
    addIds(pageSort)
  }

  const getQueryIds = viewData => {
    const viewIds = []

    ;[
      viewData?.collection_group_results?.blockIds,
      viewData?.results?.blockIds,
      viewData?.blockIds
    ].forEach(ids => {
      if (Array.isArray(ids)) {
        viewIds.push(...ids)
      }
    })

    return viewIds
  }

  const viewQuery = collectionQuery?.[collectionId] || {}

  if (collectionView && viewIds?.length > 0) {
    const groupIndex = BLOG.NOTION_INDEX || 0
    const targetViewId = viewIds[groupIndex]
    const orderedViewIds = [
      targetViewId,
      ...viewIds.filter(id => id && id !== targetViewId),
      ...Object.keys(collectionView).filter(id => !viewIds.includes(id))
    ].filter(Boolean)

    orderedViewIds.forEach(viewId => {
      processedViewIds.add(viewId)

      const queryIds = getQueryIds(viewQuery?.[viewId])
      if (queryIds.length > 0) {
        addIds(queryIds)
      } else {
        addPageSort(collectionView?.[viewId]?.value?.value?.page_sort)
      }
    })
  }

  Object.entries(viewQuery).forEach(([viewId, viewData]) => {
    if (processedViewIds.has(viewId)) {
      return
    }

    addIds(getQueryIds(viewData))
  })

  if (pageSet.size === 0 && collectionView) {
    Object.values(collectionView).forEach(viewEntry => {
      addPageSort(viewEntry?.value?.value?.page_sort)
    })
  }

  if (pageSet.size === 0 && viewQuery) {
    Object.values(viewQuery).forEach(viewData => {
      addIds(getQueryIds(viewData))
    })
  }

  if (pageSet.size === 0) {
    return []
  }

  return [...pageSet]
}
