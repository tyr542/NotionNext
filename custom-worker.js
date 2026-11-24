// @ts-nocheck
/**
 * 部落格的 Cloudflare Worker 入口（包住 OpenNext 產生的 .open-next/worker.js）
 * 官方寫法：https://opennext.js.org/cloudflare/howtos/custom-worker
 *
 * 多做兩件事：
 * 1. www.gyozalab.com 一律 301 轉到 gyozalab.com
 * 2. 找不到文章時，Next 在 Workers 上只回一行「This page could not be found」純文字。
 *    改送主題的 404 頁（/404 本身有預先產生、在快取裡），狀態碼仍是 404。
 *    刻意不在這層快取 404：會跳過 OpenNext 的 ISR 檢查，文章發布前被開過的網址，
 *    發布後還會繼續顯示 404（2026-11-25 Codex 審查指出）。
 */
import { default as handler } from './.open-next/worker.js'

// OpenNext 的 ISR 重算排程要用這個 Durable Object，必須從入口檔再匯出一次
export { DOQueueHandler } from './.open-next/worker.js'

const CANONICAL_HOST = 'gyozalab.com'

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

    const response = await handler.fetch(request, env, ctx)
    if (!isPageRequest(request, url) || !isBareNotFound(response)) return response

    const themed = await handler.fetch(
      new Request(new URL('/404', url), { headers: request.headers }),
      env,
      ctx
    )
    const type = themed.headers.get('content-type') || ''
    if (!type.includes('text/html')) return response

    const headers = new Headers(themed.headers)
    headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate')
    headers.delete('x-nextjs-cache')
    return new Response(themed.body, { status: 404, headers })
  }
}
