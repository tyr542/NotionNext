const fetchGlobalAllData = jest.fn()
const resolvePostProps = jest.fn()

jest.mock('@/lib/db/SiteDataApi', () => ({
  fetchGlobalAllData: (...args) => fetchGlobalAllData(...args),
  resolvePostProps: (...args) => resolvePostProps(...args)
}))

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn((key, defaultValue) => defaultValue)
}))

jest.mock('@/themes/theme', () => ({
  DynamicLayout: () => null
}))

describe('auth and member route getStaticProps', () => {
  const originalClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    fetchGlobalAllData.mockResolvedValue({
      NOTION_CONFIG: {},
      allPages: [{ id: 'post-1' }]
    })
    resolvePostProps.mockResolvedValue({
      NOTION_CONFIG: {},
      post: { id: 'dashboard' }
    })
  })

  afterEach(() => {
    if (originalClerkKey) {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalClerkKey
    } else {
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    }
    jest.clearAllMocks()
  })

  it('returns 404 for dashboard without Clerk and skips heavy props', async () => {
    const { getStaticProps } = await import('@/pages/dashboard/[[...index]]')

    await expect(getStaticProps({ locale: 'en' })).resolves.toEqual({
      notFound: true
    })
    expect(resolvePostProps).not.toHaveBeenCalled()
  })

  it('returns 404 for sign-in without Clerk and skips heavy props', async () => {
    const { getStaticProps } = await import('@/pages/sign-in/[[...index]]')

    await expect(getStaticProps({ locale: 'en' })).resolves.toEqual({
      notFound: true
    })
    expect(fetchGlobalAllData).not.toHaveBeenCalled()
  })

  it('returns 404 for sign-up without Clerk and skips heavy props', async () => {
    const { getStaticProps } = await import('@/pages/sign-up/[[...index]]')

    await expect(getStaticProps({ locale: 'en' })).resolves.toEqual({
      notFound: true
    })
    expect(fetchGlobalAllData).not.toHaveBeenCalled()
  })

  it('preserves dashboard route behavior when Clerk is enabled', async () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_enabled'
    const { getStaticProps } = await import('@/pages/dashboard/[[...index]]')

    const result = await getStaticProps({ locale: 'en' })

    expect(result.props?.post?.id).toBe('dashboard')
    expect(resolvePostProps).toHaveBeenCalledWith({
      prefix: 'dashboard',
      locale: 'en'
    })
  })

  it('preserves sign-in route behavior when Clerk is enabled', async () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_enabled'
    const { getStaticProps } = await import('@/pages/sign-in/[[...index]]')

    const result = await getStaticProps({ locale: 'en' })

    expect(result.props?.allPages).toBeUndefined()
    expect(fetchGlobalAllData).toHaveBeenCalledWith({
      from: 'SignIn',
      locale: 'en'
    })
  })

  it('preserves sign-up route behavior when Clerk is enabled', async () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_enabled'
    const { getStaticProps } = await import('@/pages/sign-up/[[...index]]')

    const result = await getStaticProps({ locale: 'en' })

    expect(result.props?.allPages).toBeUndefined()
    expect(fetchGlobalAllData).toHaveBeenCalledWith({
      from: 'SignIn',
      locale: 'en'
    })
  })
})
