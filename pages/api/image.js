import { shouldProxyImageUrl } from '@/lib/utils/imageProxy'

const CACHE_CONTROL = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800'

export default async function imageProxy(req, res) {
  const sourceUrl = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url

  if (!shouldProxyImageUrl(sourceUrl)) {
    res.status(400).json({ error: 'Unsupported image URL' })
    return
  }

  try {
    const upstream = await fetch(sourceUrl, {
      redirect: 'follow',
      headers: {
        accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        // Notion 的 Cloudflare 封鎖 Node 預設 UA（回 403），與 getNotionAPI.js 同一根因
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      }
    })

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Image fetch failed' })
      return
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      res.status(415).json({ error: 'Unsupported upstream content type' })
      return
    }

    const body = Buffer.from(await upstream.arrayBuffer())
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', CACHE_CONTROL)
    res.setHeader('Content-Length', body.length)
    res.status(200).send(body)
  } catch (error) {
    console.warn('[image-proxy] failed to fetch image', error)
    res.status(502).json({ error: 'Image proxy failed' })
  }
}
