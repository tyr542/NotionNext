const RICH_LIST_FIELDS = [
  'blockMap',
  'content',
  'toc',
  'recordMap',
  'rawBlockMap',
  'rawRecordMap'
]

export function sanitizeListItemForProps(item) {
  if (!item || typeof item !== 'object') {
    return item
  }

  const sanitized = { ...item }
  RICH_LIST_FIELDS.forEach(field => {
    delete sanitized[field]
  })
  return sanitized
}

export function sanitizeListItemsForProps(items) {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map(sanitizeListItemForProps)
}

export function sanitizeNoticeForListProps(notice) {
  return sanitizeListItemForProps(notice)
}

export function sanitizeNonArticlePageProps(props) {
  if (!props || typeof props !== 'object') {
    return props
  }

  if (props.notice) {
    props.notice = sanitizeNoticeForListProps(props.notice)
  }

  return props
}
