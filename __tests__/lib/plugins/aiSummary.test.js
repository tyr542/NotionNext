jest.mock('@/lib/cache/cache_manager', () => ({
  getDataFromCache: jest.fn(),
  setDataToCache: jest.fn()
}))

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn()
}))

import { getAiSummary } from '@/lib/plugins/aiSummary'

describe('getAiSummary', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('does not send article content to unsafe summary endpoints', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    global.fetch = jest.fn()

    await expect(
      getAiSummary('http://169.254.169.254/latest/meta-data', 'token', 'private draft')
    ).resolves.toBeNull()

    expect(global.fetch).not.toHaveBeenCalled()
    consoleWarnSpy.mockRestore()
  })
})
