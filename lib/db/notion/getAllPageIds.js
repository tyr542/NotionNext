import BLOG from '@/blog.config'

export default function getAllPageIds(
  collectionQuery,
  collectionId,
  collectionView,
  viewIds,
  block = {}
) {
  const pageSet = new Set()

  const addPageSort = pageSort => {
    if (Array.isArray(pageSort)) {
      pageSort.forEach(id => pageSet.add(id))
    }
  }

  // 优先按配置指定的 view 顺序收集，但不要在第一个有数据的 view 就停下。
  // 新版 Notion 里不同 view 的 page_sort 可能分别承载不同可访问页面。
  if (collectionView && viewIds?.length > 0) {
    const groupIndex = BLOG.NOTION_INDEX || 0
    const targetViewId = viewIds[groupIndex]
    const orderedViewIds = [
      targetViewId,
      ...viewIds.filter(id => id && id !== targetViewId),
      ...Object.keys(collectionView).filter(id => !viewIds.includes(id))
    ].filter(Boolean)

    orderedViewIds.forEach(viewId => {
      addPageSort(collectionView?.[viewId]?.value?.value?.page_sort)
    })
  }

  // 若没有提供 viewIds，则直接遍历所有 view。
  if (pageSet.size === 0 && collectionView) {
    Object.values(collectionView).forEach(viewEntry => {
      addPageSort(viewEntry?.value?.value?.page_sort)
    })
  }

  // 旧格式回退：从 collectionQuery 中补 page ids。
  if (pageSet.size === 0 && collectionQuery && collectionId) {
    const viewQuery = collectionQuery?.[collectionId]
    if (viewQuery) {
      Object.values(viewQuery).forEach(viewData => {
        ;[
          viewData?.collection_group_results?.blockIds,
          viewData?.results?.blockIds,
          viewData?.blockIds
        ].forEach(ids => {
          if (Array.isArray(ids)) {
            ids.forEach(id => pageSet.add(id))
          }
        })
      })
    }
  }

  if (pageSet.size === 0) {
    return []
  }

  return [...pageSet]
}
