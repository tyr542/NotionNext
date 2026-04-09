export function findAccessiblePage({
  fullSlug,
  publicPages = [],
  invisiblePages = []
}) {
  if (!fullSlug) {
    return null
  }

  const sources = [publicPages, invisiblePages]

  for (const pages of sources) {
    const matched = pages?.find(page => {
      if (!page || page?.type?.includes('Menu')) {
        return false
      }

      return page.slug === fullSlug || page.id === fullSlug
    })

    if (matched) {
      return matched
    }
  }

  return null
}
