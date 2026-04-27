const PROXY_IMAGE_HOSTS = new Set([
  'www.notion.so',
  'notion.so',
  'img.notionusercontent.com'
])

export function shouldProxyImageUrl(src) {
  if (!src || typeof src !== 'string') {
    return false
  }

  if (src.startsWith('/') || src.startsWith('data:') || src.startsWith('blob:')) {
    return false
  }

  try {
    const url = new URL(src)
    return PROXY_IMAGE_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

export function toImageProxyUrl(src) {
  if (!shouldProxyImageUrl(src)) {
    return src
  }

  return `/api/image?url=${encodeURIComponent(src)}`
}
