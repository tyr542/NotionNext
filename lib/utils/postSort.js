export function sortPostsByPublishDate(posts = []) {
  return [...posts].sort((a, b) => {
    const dateA = a?.publishDate || a?.lastEditedDate || 0
    const dateB = b?.publishDate || b?.lastEditedDate || 0
    return dateB - dateA
  })
}

export function sortPostsForList(posts = []) {
  return sortPostsByPublishDate(posts)
}
