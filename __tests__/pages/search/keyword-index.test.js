jest.mock('@/lib/cache/cache_manager', () => ({
  getDataFromCache: jest.fn()
}))

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

import { getStaticProps } from '@/pages/search/[keyword]/index'
import { getDataFromCache } from '@/lib/cache/cache_manager'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'

describe('search keyword index page', () => {
  it('matches title, summary, tags, and category without returning rich fields', async () => {
    const richFields = {
      blockMap: { block: { heavy: { value: { type: 'text' } } } },
      content: ['heavy'],
      toc: [{ id: 'heavy' }]
    }
    fetchGlobalAllData.mockResolvedValue({
      allPages: [
        {
          id: 'title-hit',
          type: 'Post',
          status: 'Published',
          title: 'Needle in title',
          summary: '',
          tags: [],
          category: [],
          slug: 'title-hit',
          ...richFields
        },
        {
          id: 'summary-hit',
          type: 'Post',
          status: 'Published',
          title: 'Summary post',
          summary: 'Needle in summary',
          tags: [],
          category: [],
          slug: 'summary-hit',
          ...richFields
        },
        {
          id: 'tag-hit',
          type: 'Post',
          status: 'Published',
          title: 'Tag post',
          summary: '',
          tags: ['needle'],
          category: [],
          slug: 'tag-hit',
          ...richFields
        },
        {
          id: 'category-hit',
          type: 'Post',
          status: 'Published',
          title: 'Category post',
          summary: '',
          tags: [],
          category: ['needle'],
          slug: 'category-hit',
          ...richFields
        }
      ],
      NOTION_CONFIG: {}
    })
    getDataFromCache.mockResolvedValue(null)

    const result = await getStaticProps({
      params: { keyword: 'needle' },
      locale: 'zh-TW'
    })

    expect(result.props.postCount).toBe(4)
    expect(result.props.allPages).toBeUndefined()
    result.props.posts.forEach(post => {
      expect(post).not.toHaveProperty('blockMap')
      expect(post).not.toHaveProperty('content')
      expect(post).not.toHaveProperty('toc')
    })
  })

  it('matches keywords from cached page body content', async () => {
    fetchGlobalAllData.mockResolvedValue({
      allPages: [
        {
          id: 'post-1',
          type: 'Post',
          status: 'Published',
          title: 'Intro',
          summary: 'Summary only',
          tags: [],
          category: '',
          slug: 'intro'
        }
      ],
      NOTION_CONFIG: {}
    })

    getDataFromCache.mockImplementation(async (key) => {
      if (key !== 'page_content_post-1') {
        return null
      }

      return {
        block: {
          'post-1': {
            value: {
              id: 'post-1',
              type: 'page',
              content: ['text-1']
            }
          },
          'text-1': {
            value: {
              id: 'text-1',
              type: 'text',
              properties: {
                title: [['Keyword hidden in body']]
              }
            }
          }
        }
      }
    })

    const result = await getStaticProps({
      params: { keyword: 'Keyword' },
      locale: 'zh-TW'
    })

    expect(getDataFromCache).toHaveBeenCalledWith('page_content_post-1', true)
    expect(result.props.postCount).toBe(1)
    expect(result.props.posts).toHaveLength(1)
  })
})
