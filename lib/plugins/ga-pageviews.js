/**
 * Google Analytics 4 Data API helper
 *
 * 在 SSG / ISR 階段呼叫 GA Data API，取得整站 pageviews 與訪客數，
 * 用來取代不蒜子（Busuanzi）外部服務。
 *
 * 讀取順序（credential 來源）：
 *  1. process.env.GA_CREDENTIALS_JSON          // base64 編碼的 service-account JSON（Vercel 推薦）
 *  2. process.env.GA_CREDENTIALS_JSON_RAW      // 原始 JSON 字串
 *  3. process.env.GOOGLE_APPLICATION_CREDENTIALS // 檔案路徑（本地 dev / gcloud ADC）
 *  4. 若皆未設定 → 回傳 null，前端顯示 '—'
 *
 * 必要環境變數：
 *  - NEXT_PUBLIC_ANALYTICS_GA4_PROPERTY_ID      GA4 property ID（純數字）
 *
 * 選項環境變數：
 *  - GA_PAGEVIEWS_START_DATE                    起始日期，預設 '2023-01-01'
 *  - GA_PAGEVIEWS_CACHE_TTL                     快取秒數，預設 600（10 分鐘）
 */

const GA_CACHE_KEY = 'ga_pageviews_v1'

/** 模組級記憶體快取，避免同一次 SSG build 內重複呼叫 */
let memCache = { data: null, expiresAt: 0 }

/**
 * 建立 GA Data API client，依序嘗試三種 credential 來源。
 * @returns {Promise<import('@google-analytics/data').BetaAnalyticsDataClient|null>}
 */
async function createClient() {
  try {
    const { BetaAnalyticsDataClient } = await import('@google-analytics/data')

    // 1. base64 編碼的 JSON（Vercel 推薦）
    if (process.env.GA_CREDENTIALS_JSON) {
      const decoded = Buffer.from(process.env.GA_CREDENTIALS_JSON, 'base64').toString('utf-8')
      const credentials = JSON.parse(decoded)
      return new BetaAnalyticsDataClient({ credentials })
    }

    // 2. 原始 JSON 字串（不建議，容易被 shell 轉義搞爛）
    if (process.env.GA_CREDENTIALS_JSON_RAW) {
      const credentials = JSON.parse(process.env.GA_CREDENTIALS_JSON_RAW)
      return new BetaAnalyticsDataClient({ credentials })
    }

    // 3. GOOGLE_APPLICATION_CREDENTIALS 檔案路徑 / gcloud ADC（本地 dev）
    // BetaAnalyticsDataClient 會自動讀 ADC，不用傳 options
    return new BetaAnalyticsDataClient()
  } catch (err) {
    console.warn('[ga-pageviews] 無法建立 GA client：', err?.message || err)
    return null
  }
}

/**
 * 取得整站 PV / UV。
 * @returns {Promise<{ sitePv: number, siteUv: number } | null>}
 */
export async function fetchSitePageviews() {
  const propertyId = process.env.NEXT_PUBLIC_ANALYTICS_GA4_PROPERTY_ID
  if (!propertyId) {
    // 未設定 property id → 靜默跳過，前端 fallback 顯示 '—'
    return null
  }

  // 模組級快取命中（同一 build process 內）
  const now = Date.now()
  if (memCache.data && memCache.expiresAt > now) {
    return memCache.data
  }

  const client = await createClient()
  if (!client) return null

  const startDate = process.env.GA_PAGEVIEWS_START_DATE || '2023-01-01'
  const ttlSeconds = parseInt(process.env.GA_PAGEVIEWS_CACHE_TTL || '600', 10)

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate: 'today' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }]
    })

    const row = response?.rows?.[0]?.metricValues
    if (!row || row.length < 2) {
      console.warn('[ga-pageviews] GA 回傳空資料')
      return null
    }

    const data = {
      sitePv: parseInt(row[0].value || '0', 10),
      siteUv: parseInt(row[1].value || '0', 10)
    }

    memCache = { data, expiresAt: now + ttlSeconds * 1000 }
    return data
  } catch (err) {
    console.warn('[ga-pageviews] GA Data API 呼叫失敗：', err?.message || err)
    return null
  }
}

export { GA_CACHE_KEY }
