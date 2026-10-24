import { shouldProxyImageUrl } from '@/lib/utils/imageProxy'

const CACHE_CONTROL = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800'
const MAX_REDIRECTS = 3
const MAX_BYTES = 15 * 1024 * 1024
const TIMEOUT_MS = 10000
// 与 Notion 图片 CDN 相同的限制：直接打开 SVG 时不允许执行脚本
const IMAGE_CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; sandbox"

/**
 * 逐跳跟随转址，每一跳都重新检查白名单，避免被转到内网或其他网域
 */
async function fetchWithCheckedRedirects(url, signal) {
  let current = url
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetch(current, {
      redirect: 'manual',
      signal,
      headers: {
        accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        // Notion 的 Cloudflare 封鎖 Node 預設 UA（回 403），與 getNotionAPI.js 同一根因
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      }
    })
    if (response.status < 300 || response.status >= 400) {
      return response
    }
    const location = response.headers.get('location')
    if (!location) {
      return response
    }
    const next = new URL(location, current).toString()
    if (!shouldProxyImageUrl(next)) {
      throw Object.assign(new Error('Redirect target not allowed'), { status: 400 })
    }
    current = next
  }
  throw Object.assign(new Error('Too many redirects'), { status: 508 })
}

export default async function imageProxy(req, res) {
  const sourceUrl = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url

  if (!shouldProxyImageUrl(sourceUrl)) {
    res.status(400).json({ error: 'Unsupported image URL' })
    return
  }

  try {
    const signal = typeof AbortSignal?.timeout === 'function' ? AbortSignal.timeout(TIMEOUT_MS) : undefined
    const upstream = await fetchWithCheckedRedirects(sourceUrl, signal)

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Image fetch failed' })
      return
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      res.status(415).json({ error: 'Unsupported upstream content type' })
      return
    }

    const declaredLength = Number(upstream.headers.get('content-length') || 0)
    if (declaredLength > MAX_BYTES) {
      res.status(413).json({ error: 'Image too large' })
      return
    }

    const body = Buffer.from(await upstream.arrayBuffer())
    if (body.length > MAX_BYTES) {
      res.status(413).json({ error: 'Image too large' })
      return
    }

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Security-Policy', IMAGE_CSP)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', CACHE_CONTROL)
    res.setHeader('Content-Length', body.length)
    res.status(200).send(body)
  } catch (error) {
    if (error?.status) {
      res.status(error.status).json({ error: error.message })
      return
    }
    console.warn('[image-proxy] failed to fetch image', error?.message || error)
    res.status(502).json({ error: 'Image proxy failed' })
  }
}
