describe('lib/cache/cache_manager', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    delete process.env.ENABLE_FILE_CACHE
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('does not write cache entries when caching is disabled', async () => {
    const memorySetCache = jest.fn()

    jest.doMock('@/blog.config', () => ({
      __esModule: true,
      default: {
        ENABLE_CACHE: false,
        REDIS_URL: '',
        isProd: true
      }
    }))

    jest.doMock('@/lib/cache/memory_cache', () => ({
      __esModule: true,
      default: {
        getCache: jest.fn(),
        setCache: memorySetCache,
        delCache: jest.fn()
      }
    }))

    jest.doMock('@/lib/cache/local_file_cache', () => ({
      __esModule: true,
      default: {
        getCache: jest.fn(),
        setCache: jest.fn(),
        delCache: jest.fn()
      }
    }))

    jest.doMock('@/lib/cache/redis_cache', () => ({
      __esModule: true,
      default: {
        getCache: jest.fn(),
        setCache: jest.fn(),
        delCache: jest.fn()
      }
    }))

    const { setDataToCache } = require('@/lib/cache/cache_manager')

    await setDataToCache('site_data_demo', { ok: true })

    expect(memorySetCache).not.toHaveBeenCalled()
  })

  it('allows persistent cache backends in production when cache is enabled', async () => {
    const redisSetCache = jest.fn()

    jest.doMock('@/blog.config', () => ({
      __esModule: true,
      default: {
        ENABLE_CACHE: true,
        REDIS_URL: 'redis://cache.internal:6379',
        isProd: true
      }
    }))

    jest.doMock('@/lib/cache/memory_cache', () => ({
      __esModule: true,
      default: {
        getCache: jest.fn(),
        setCache: jest.fn(),
        delCache: jest.fn()
      }
    }))

    jest.doMock('@/lib/cache/local_file_cache', () => ({
      __esModule: true,
      default: {
        getCache: jest.fn(),
        setCache: jest.fn(),
        delCache: jest.fn()
      }
    }))

    jest.doMock('@/lib/cache/redis_cache', () => ({
      __esModule: true,
      default: {
        getCache: jest.fn(),
        setCache: redisSetCache,
        delCache: jest.fn()
      }
    }))

    const { setDataToCache } = require('@/lib/cache/cache_manager')
    const payload = { ok: true }

    await setDataToCache('site_data_demo', payload)

    expect(redisSetCache).toHaveBeenCalledWith(
      'site_data_demo',
      payload,
      undefined
    )
  })
})
