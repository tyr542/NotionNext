export function findAccessiblePage({
  fullSlug,
  publicPages = [],
  invisiblePages = []
}) {
  if (!fullSlug) {
    return null
  }

  const sources = [publicPages, invisiblePages]
  // Notion id 可能带或不带连字符，统一后比对
  const normalizeId = id => String(id || '').replace(/-/g, '').toLowerCase()
  const slugAsId = normalizeId(fullSlug)

  for (const pages of sources) {
    const matched = pages?.find(page => {
      if (!page || page?.type?.includes('Menu')) {
        return false
      }

      return (
        page.slug === fullSlug ||
        page.id === fullSlug ||
        (slugAsId.length === 32 && normalizeId(page.id) === slugAsId)
      )
    })

    if (matched) {
      return matched
    }
  }

  return null
}
