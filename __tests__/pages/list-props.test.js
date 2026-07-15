jest.mock('@/lib/db/SiteDataApi', () => ({
  fetchGlobalAllData: jest.fn()
}))

jest.mock('@/themes/theme', () => ({
  DynamicLayout: () => null
}))

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn((key, defaultValue) => {
    if (key === 'POST_LIST_STYLE') return 'page'
    if (key === 'POSTS_PER_PAGE') return 12
    if (key === 'NEXT_REVALIDATE_SECOND') return 60
    return defaultValue
  })
}))

import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'

const richPost = {
  id: 'post-1',
  type: 'Post',
  status: 'Published',
  title: 'Runtime stability',
  summary: 'Runtime summary',
  tags: ['ops'],
  category: ['infra'],
  slug: 'runtime-stability',
  publishDate: 100,
  blockMap: { block: { heavy: { value: { type: 'text' } } } },
  content: ['heavy'],
  toc: [{ id: 'heavy' }]
}

function expectListItemToBeLightweight(item) {
  expect(item).toMatchObject({
    title: 'Runtime stability',
    summary: 'Runtime summary',
    tags: ['ops'],
    category: ['infra'],
    slug: 'runtime-stability'
  })
  expect(item).not.toHaveProperty('blockMap')
  expect(item).not.toHaveProperty('content')
  expect(item).not.toHaveProperty('toc')
}

function expectNoticeToBeLightweight(props) {
  expect(props.notice).toMatchObject({ title: 'Notice' })
  expect(props.notice).not.toHaveProperty('blockMap')
  expect(props.notice).not.toHaveProperty('content')
  expect(props.notice).not.toHaveProperty('toc')
}

describe('non-article list page props', () => {
  beforeEach(() => {
    fetchGlobalAllData.mockResolvedValue({
      NOTION_CONFIG: {},
      allPages: [{ ...richPost }],
      latestPosts: [{ ...richPost }],
      notice: {
        title: 'Notice',
        blockMap: { block: { notice: { value: { type: 'text' } } } },
        content: ['notice'],
        toc: [{ id: 'notice' }]
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('keeps search index props lightweight', async () => {
    const { getStaticProps } = await import('@/pages/search/index')

    const result = await getStaticProps({ locale: 'en' })

    expectListItemToBeLightweight(result.props.posts[0])
    expectNoticeToBeLightweight(result.props)
  })

  it('keeps archive props lightweight', async () => {
    const { getStaticProps } = await import('@/pages/archive/index')

    const result = await getStaticProps({ locale: 'en' })
    const month = Object.keys(result.props.archivePosts)[0]

    expectListItemToBeLightweight(result.props.posts[0])
    expectListItemToBeLightweight(result.props.archivePosts[month][0])
    expectNoticeToBeLightweight(result.props)
  })

  it('keeps category props lightweight', async () => {
    const { getStaticProps } = await import('@/pages/category/[category]/index')

    const result = await getStaticProps({
      params: { category: 'infra' },
      locale: 'en'
    })

    expectListItemToBeLightweight(result.props.posts[0])
    expectNoticeToBeLightweight(result.props)
  })

  it('keeps tag props lightweight', async () => {
    const { getStaticProps } = await import('@/pages/tag/[tag]/index')

    const result = await getStaticProps({
      params: { tag: 'ops' },
      locale: 'en'
    })

    expectListItemToBeLightweight(result.props.posts[0])
    expectNoticeToBeLightweight(result.props)
  })

  it('does not expose allPages on 404 props', async () => {
    const { getStaticProps } = await import('@/pages/404')

    const result = await getStaticProps({ locale: 'en' })

    expect(result.props.allPages).toBeUndefined()
    expectNoticeToBeLightweight(result.props)
  })
})
