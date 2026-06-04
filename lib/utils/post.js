import { isHttpLink } from '.'

export function getRecommendPost(post, allPosts, count = 6) {
  const currentTags = post?.tags || []
  const currentCategory = post?.category || ''
  const candidates = allPosts
    .filter(candidate => candidate.id !== post.id && candidate.type.indexOf('Post') >= 0)
    .map(candidate => buildRecommendCandidate(candidate, currentTags, currentCategory))
    .filter(candidate => candidate.sharedTagCount > 0 || candidate.sameCategory)
    .sort(compareRecommendCandidate)

  const strongMatches = candidates.filter(candidate => candidate.sharedTagCount > 0)
  const sameCategoryFallbacks = candidates
    .filter(candidate => candidate.sharedTagCount === 0 && candidate.sameCategory)
    .slice(0, 2)

  return [...strongMatches, ...sameCategoryFallbacks]
    .slice(0, count)
    .map(candidate => candidate.post)
}

function getSharedTagCount(currentTags, targetTags) {
  let sharedTagCount = 0
  for (let i = 0; i < currentTags.length; i++) {
    if (targetTags.indexOf(currentTags[i]) > -1) {
      sharedTagCount += 1
    }
  }
  return sharedTagCount
}

function buildRecommendCandidate(post, currentTags, currentCategory) {
  return {
    post,
    sharedTagCount: getSharedTagCount(currentTags, post?.tags || []),
    sameCategory: Boolean(currentCategory) && post?.category === currentCategory,
    recency: post?.publishDate || post?.lastEditedDate || 0
  }
}

function compareRecommendCandidate(a, b) {
  return (
    b.sharedTagCount - a.sharedTagCount ||
    Number(b.sameCategory) - Number(a.sameCategory) ||
    b.recency - a.recency
  )
}

export function checkSlugHasNoSlash(row) {
  let slug = row.slug
  if (slug.startsWith('/')) {
    slug = slug.substring(1)
  }
  return (
    (slug.match(/\//g) || []).length === 0 &&
    !isHttpLink(slug) &&
    row.type.indexOf('Menu') < 0
  )
}

export function checkSlugHasOneSlash(row) {
  let slug = row.slug
  if (slug.startsWith('/')) {
    slug = slug.substring(1)
  }
  return (
    (slug.match(/\//g) || []).length === 1 &&
    !isHttpLink(slug) &&
    row.type.indexOf('Menu') < 0
  )
}

export function checkSlugHasMorThanTwoSlash(row) {
  let slug = row.slug
  if (slug.startsWith('/')) {
    slug = slug.substring(1)
  }
  return (
    (slug.match(/\//g) || []).length >= 2 &&
    row.type.indexOf('Menu') < 0 &&
    !isHttpLink(slug)
  )
}
