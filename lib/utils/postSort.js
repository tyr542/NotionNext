export function sortPostsByPublishDate(posts = []) {
  return [...posts].sort((a, b) => {
    const dateA = a?.publishDate || a?.lastEditedDate || 0
    const dateB = b?.publishDate || b?.lastEditedDate || 0
    return dateB - dateA
  })
}

export function sortPostsByLastEditedDate(posts = []) {
  return [...posts].sort((a, b) => {
    const dateA = a?.lastEditedDate || a?.publishDate || 0
    const dateB = b?.lastEditedDate || b?.publishDate || 0
    return dateB - dateA
  })
}

export function getLatestUpdatedPosts(posts = [], count = 6) {
  const publishedPosts = posts.filter(
    post => post?.type === 'Post' && post?.status === 'Published'
  )
  return sortPostsByLastEditedDate(publishedPosts).slice(0, count)
}

export function sortPostsForList(posts = []) {
  return sortPostsByPublishDate(posts)
}
