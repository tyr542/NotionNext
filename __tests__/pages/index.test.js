jest.mock('@/lib/db/SiteDataApi', () => ({
  fetchGlobalAllData: jest.fn(),
  getPostBlocks: jest.fn()
}))

jest.mock('@/lib/utils/robots.txt', () => ({
  generateRobotsTxt: jest.fn()
}))

jest.mock('@/lib/utils/rss', () => ({
  generateRss: jest.fn()
}))

jest.mock('@/lib/utils/sitemap.xml', () => ({
  generateSitemapXml: jest.fn()
}))

jest.mock('@/lib/utils/redirect', () => ({
  generateRedirectJson: jest.fn()
}))

jest.mock('@/lib/plugins/algolia', () => ({
  checkDataFromAlgolia: jest.fn()
}))

jest.mock('@/themes/theme', () => ({
  DynamicLayout: () => null
}))

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn((key, defaultValue) => {
    if (key === 'POST_LIST_STYLE') return 'page'
    if (key === 'POSTS_PER_PAGE') return 3
    if (key === 'POST_LIST_PREVIEW') return false
    if (key === 'HOME_POST_LIST_PREVIEW') return false
    if (key === 'POST_PREVIEW_LINES') return 12
    if (key === 'NEXT_REVALIDATE_SECOND') return 60
    return defaultValue
  })
}))

import { getStaticProps } from '@/pages/index'
import { fetchGlobalAllData, getPostBlocks } from '@/lib/db/SiteDataApi'
import { siteConfig } from '@/lib/config'

describe('home page index', () => {
  it('shows the latest published posts first on the homepage preview list', async () => {
    fetchGlobalAllData.mockResolvedValue({
      allPages: [
        {
          id: 'older-notion-order',
          type: 'Post',
          status: 'Published',
          title: 'Older post',
          slug: 'older-post',
          publishDate: new Date('2026-01-29T00:00:00Z').getTime()
        },
        {
          id: 'latest-post',
          type: 'Post',
          status: 'Published',
          title: 'Latest post',
          slug: 'latest-post',
          publishDate: new Date('2026-03-24T00:00:00Z').getTime()
        },
        {
          id: 'middle-post',
          type: 'Post',
          status: 'Published',
          title: 'Middle post',
          slug: 'middle-post',
          publishDate: new Date('2026-03-06T00:00:00Z').getTime()
        },
        {
          id: 'newest-post',
          type: 'Post',
          status: 'Published',
          title: 'Newest post',
          slug: 'newest-post',
          publishDate: new Date('2026-03-29T00:00:00Z').getTime()
        }
      ],
      NOTION_CONFIG: {}
    })

    const result = await getStaticProps({ locale: 'zh-TW' })

    expect(result.props.posts.map(post => post.id)).toEqual([
      'newest-post',
      'latest-post',
      'middle-post'
    ])
  })

  it('does not include rich post block previews in homepage props by default', async () => {
    siteConfig.mockImplementation((key, defaultValue) => {
      if (key === 'POST_LIST_STYLE') return 'page'
      if (key === 'POSTS_PER_PAGE') return 3
      if (key === 'POST_LIST_PREVIEW') return true
      if (key === 'HOME_POST_LIST_PREVIEW') return false
      if (key === 'POST_PREVIEW_LINES') return 12
      if (key === 'NEXT_REVALIDATE_SECOND') return 60
      return defaultValue
    })
    fetchGlobalAllData.mockResolvedValue({
      allPages: [
        {
          id: 'post-1',
          type: 'Post',
          status: 'Published',
          title: 'Post 1',
          slug: 'post-1',
          summary: 'Summary only',
          publishDate: new Date('2026-03-01T00:00:00Z').getTime()
        }
      ],
      NOTION_CONFIG: {}
    })

    const result = await getStaticProps({ locale: 'zh-TW' })

    expect(getPostBlocks).not.toHaveBeenCalled()
    expect(result.props.posts[0]).not.toHaveProperty('blockMap')
    expect(result.props.posts[0].summary).toBe('Summary only')
  })

  it('uses a lightweight notice preview on the homepage', async () => {
    fetchGlobalAllData.mockResolvedValue({
      allPages: [],
      notice: {
        title: 'Announcement',
        summary: 'Short notice',
        blockMap: {
          block: {
            heavy: { value: { type: 'text' } }
          }
        }
      },
      NOTION_CONFIG: {}
    })

    const result = await getStaticProps({ locale: 'zh-TW' })

    expect(result.props.notice).toEqual({
      title: 'Announcement',
      summary: 'Short notice'
    })
  })
})
