const mockRunReport = jest.fn()

jest.mock('@google-analytics/data', () => ({
  BetaAnalyticsDataClient: jest.fn().mockImplementation(() => ({
    runReport: mockRunReport
  }))
}))

import {
  __resetGaPageviewsCacheForTests,
  fetchSitePageviews
} from '@/lib/plugins/ga-pageviews'

describe('fetchSitePageviews', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    jest.clearAllMocks()
    __resetGaPageviewsCacheForTests()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ANALYTICS_GA4_PROPERTY_ID: '123456789',
      GA_PAGEVIEWS_CACHE_TTL: '600',
      GA_PAGEVIEWS_FAILURE_CACHE_TTL: '30'
    }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    __resetGaPageviewsCacheForTests()
  })

  it('negative-caches failed GA responses to avoid repeated API calls during a build', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    mockRunReport.mockRejectedValue(new Error('PERMISSION_DENIED'))

    await expect(fetchSitePageviews()).resolves.toBeNull()
    await expect(fetchSitePageviews()).resolves.toBeNull()

    expect(mockRunReport).toHaveBeenCalledTimes(1)
    consoleWarnSpy.mockRestore()
  })

  it('reuses successful GA responses until the cache expires', async () => {
    mockRunReport.mockResolvedValue([
      {
        rows: [
          {
            metricValues: [{ value: '25' }, { value: '8' }]
          }
        ]
      }
    ])

    await expect(fetchSitePageviews()).resolves.toEqual({ sitePv: 25, siteUv: 8 })
    await expect(fetchSitePageviews()).resolves.toEqual({ sitePv: 25, siteUv: 8 })

    expect(mockRunReport).toHaveBeenCalledTimes(1)
  })
})
