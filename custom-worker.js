// @ts-nocheck
/**
 * 部落格的 Cloudflare Worker 入口（包住 OpenNext 產生的 .open-next/worker.js）
 * 官方寫法：https://opennext.js.org/cloudflare/howtos/custom-worker
 *
 * 多做兩件事：
 * 1. www.gyozalab.com 一律 301 轉到 gyozalab.com
 * 2. 找不到文章時，Next 在 Workers 上只回一行「This page could not be found」純文字。
 *    改送主題的 404 頁（/404 本身有預先產生、在快取裡），狀態碼仍是 404，
 *    並在 Cloudflare 邊緣快取 5 分鐘，避免同一個壞網址每次都重問 Notion。
 */
import { default as handler } from './.open-next/worker.js'

// OpenNext 的 ISR 重算排程要用這個 Durable Object，必須從入口檔再匯出一次
export { DOQueueHandler } from './.open-next/worker.js'

const CANONICAL_HOST = 'gyozalab.com'
const NOT_FOUND_CACHE_SECONDS = 300

function isPageRequest(request, url) {
  return (
    request.method === 'GET' &&
    !url.pathname.startsWith('/_next/') &&
    !url.pathname.startsWith('/api/')
  )
}

function isBareNotFound(response) {
  if (response.status !== 404) return false
  const type = response.headers.get('content-type') || ''
  return !type.includes('text/html')
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (url.hostname === `www.${CANONICAL_HOST}`) {
      url.hostname = CANONICAL_HOST
      return Response.redirect(url.toString(), 301)
    }

    const pageRequest = isPageRequest(request, url)
    const cache = caches.default
    const cacheKey = new Request(url.toString(), { method: 'GET' })

    if (pageRequest) {
      const cached = await cache.match(cacheKey)
      if (cached) return cached
    }

    const response = await handler.fetch(request, env, ctx)
    if (!pageRequest || !isBareNotFound(response)) return response

    const themed = await handler.fetch(
      new Request(new URL('/404', url), { headers: request.headers }),
      env,
      ctx
    )
    const type = themed.headers.get('content-type') || ''
    if (!type.includes('text/html')) return response

    const headers = new Headers(themed.headers)
    headers.set('Cache-Control', `public, max-age=0, s-maxage=${NOT_FOUND_CACHE_SECONDS}`)
    headers.delete('x-nextjs-cache')
    const notFound = new Response(themed.body, { status: 404, headers })
    ctx.waitUntil(cache.put(cacheKey, notFound.clone()))
    return notFound
  }
}
