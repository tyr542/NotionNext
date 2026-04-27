/**
 * Google Analytics 4 Data API helper
 *
 * Supported credential sources:
 * 1. GA_CREDENTIALS_JSON - base64 encoded service account JSON
 * 2. GA_CREDENTIALS_JSON_RAW - raw service account JSON
 * 3. GOOGLE_APPLICATION_CREDENTIALS / ADC
 */

const GA_CACHE_KEY = 'ga_pageviews_v1'
const GA_GLOBAL_CACHE_KEY = '__NOTIONNEXT_GA_PAGEVIEWS_CACHE__'

function createEmptyCache() {
  return { value: undefined, expiresAt: 0 }
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value || '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function getCacheStore() {
  if (!globalThis[GA_GLOBAL_CACHE_KEY]) {
    globalThis[GA_GLOBAL_CACHE_KEY] = createEmptyCache()
  }

  return globalThis[GA_GLOBAL_CACHE_KEY]
}

function readCachedValue(now) {
  const cacheStore = getCacheStore()
  if (cacheStore.expiresAt > now) {
    return cacheStore.value
  }

  return undefined
}

function writeCachedValue(value, ttlSeconds, now) {
  globalThis[GA_GLOBAL_CACHE_KEY] = {
    value,
    expiresAt: now + ttlSeconds * 1000
  }
}

/**
 * @returns {Promise<import('@google-analytics/data').BetaAnalyticsDataClient|null>}
 */
async function createClient() {
  try {
    const { BetaAnalyticsDataClient } = await import('@google-analytics/data')

    if (process.env.GA_CREDENTIALS_JSON) {
      const decoded = Buffer.from(process.env.GA_CREDENTIALS_JSON, 'base64').toString('utf-8')
      const credentials = JSON.parse(decoded)
      return new BetaAnalyticsDataClient({ credentials })
    }

    if (process.env.GA_CREDENTIALS_JSON_RAW) {
      const credentials = JSON.parse(process.env.GA_CREDENTIALS_JSON_RAW)
      return new BetaAnalyticsDataClient({ credentials })
    }

    return new BetaAnalyticsDataClient()
  } catch (err) {
    console.warn('[ga-pageviews] failed to create GA client:', err?.message || err)
    return null
  }
}

/**
 * @returns {Promise<{ sitePv: number, siteUv: number } | null>}
 */
export async function fetchSitePageviews() {
  const now = Date.now()
  const cachedValue = readCachedValue(now)
  if (cachedValue !== undefined) {
    return cachedValue
  }

  const successTtlSeconds = parsePositiveInt(process.env.GA_PAGEVIEWS_CACHE_TTL, 600)
  const failureTtlSeconds = parsePositiveInt(
    process.env.GA_PAGEVIEWS_FAILURE_CACHE_TTL,
    successTtlSeconds
  )
  const propertyId = process.env.NEXT_PUBLIC_ANALYTICS_GA4_PROPERTY_ID

  if (!propertyId) {
    writeCachedValue(null, failureTtlSeconds, now)
    return null
  }

  const client = await createClient()
  if (!client) {
    writeCachedValue(null, failureTtlSeconds, now)
    return null
  }

  const startDate = process.env.GA_PAGEVIEWS_START_DATE || '2023-01-01'

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate: 'today' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }]
    })

    const row = response?.rows?.[0]?.metricValues
    if (!row || row.length < 2) {
      console.warn('[ga-pageviews] GA returned no metrics')
      writeCachedValue(null, failureTtlSeconds, now)
      return null
    }

    const data = {
      sitePv: Number.parseInt(row[0].value || '0', 10),
      siteUv: Number.parseInt(row[1].value || '0', 10)
    }

    writeCachedValue(data, successTtlSeconds, now)
    return data
  } catch (err) {
    console.warn('[ga-pageviews] GA Data API request failed:', err?.message || err)
    writeCachedValue(null, failureTtlSeconds, now)
    return null
  }
}

export function __resetGaPageviewsCacheForTests() {
  globalThis[GA_GLOBAL_CACHE_KEY] = createEmptyCache()
}

export { GA_CACHE_KEY }
