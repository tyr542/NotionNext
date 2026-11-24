/**
 * 判斷目前是不是跑在 Cloudflare Workers（2026-11-24 起正式站部署在 Workers）。
 *
 * Workers 上有兩件事要避開：
 * 1. 把一個請求建立的 Promise 交給其他請求等待：建立它的請求結束後，Promise 永遠不會完成，
 *    其他請求會報「This promise was created by a request that has since ended」。
 * 2. 執行期寫檔：檔案系統是唯讀的（EPERM），寫 public/ 的 sitemap、RSS 只會白耗運算時間。
 *
 * 本機 next build / next dev 跑在 Node，navigator.userAgent 是 "Node.js/22" 之類，不受影響。
 * @returns {boolean}
 */
export function isCloudflareWorkers() {
  return (
    typeof navigator !== 'undefined' &&
    navigator?.userAgent === 'Cloudflare-Workers'
  )
}
