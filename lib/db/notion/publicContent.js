import BLOG from '@/blog.config'

export function hasPublicSlug(page) {
  return Boolean(
    typeof page?.slug === 'string' &&
      page.slug !== '#' &&
      page.slug.trim() !== ''
  )
}

export function hasPublishedStatus(page) {
  return page?.status === BLOG.NOTION_PROPERTY_NAME.status_publish
}

export function isPublishedPost(page) {
  return (
    hasPublicSlug(page) &&
    hasPublishedStatus(page) &&
    page?.type === BLOG.NOTION_PROPERTY_NAME.type_post
  )
}

export function isPublishedPage(page) {
  return (
    hasPublicSlug(page) &&
    hasPublishedStatus(page) &&
    page?.type === BLOG.NOTION_PROPERTY_NAME.type_page
  )
}

export function isPublishedPublicContent(page) {
  return isPublishedPost(page) || isPublishedPage(page)
}
