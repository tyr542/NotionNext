describe('conf/dev.config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    delete process.env.VERCEL_ENV
    delete process.env.EXPORT
    delete process.env.ENABLE_CACHE
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('treats NODE_ENV=production as production outside Vercel', () => {
    process.env.NODE_ENV = 'production'
    process.env.npm_lifecycle_event = 'start'

    const config = require('@/conf/dev.config')

    expect(config.isProd).toBe(true)
    expect(config.ENABLE_CACHE).toBe(false)
  })

  it('enables cache during build by default', () => {
    process.env.NODE_ENV = 'production'
    process.env.npm_lifecycle_event = 'build'

    const config = require('@/conf/dev.config')

    expect(config.isProd).toBe(true)
    expect(config.ENABLE_CACHE).toBe(true)
  })
})
