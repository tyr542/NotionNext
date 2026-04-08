import BLOG from '@/blog.config'

function matchesConfiguredOrCanonical(value, canonicalValue, configuredValue) {
  return value === canonicalValue || value === configuredValue
}

export function hasPublicSlug(page) {
  return Boolean(
    typeof page?.slug === 'string' &&
      page.slug !== '#' &&
      page.slug.trim() !== ''
  )
}

export function hasPublishedStatus(page) {
  return matchesConfiguredOrCanonical(
    page?.status,
    'Published',
    BLOG.NOTION_PROPERTY_NAME.status_publish
  )
}

export function isPublishedPost(page) {
  return (
    hasPublicSlug(page) &&
    hasPublishedStatus(page) &&
    matchesConfiguredOrCanonical(
      page?.type,
      'Post',
      BLOG.NOTION_PROPERTY_NAME.type_post
    )
  )
}

export function isPublishedPage(page) {
  return (
    hasPublicSlug(page) &&
    hasPublishedStatus(page) &&
    matchesConfiguredOrCanonical(
      page?.type,
      'Page',
      BLOG.NOTION_PROPERTY_NAME.type_page
    )
  )
}

export function isPublishedPublicContent(page) {
  return isPublishedPost(page) || isPublishedPage(page)
}
