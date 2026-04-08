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
    if (key === 'POSTS_PER_PAGE') return 12
    if (key === 'NEXT_REVALIDATE_SECOND') return 60
    return defaultValue
  })
}))

import { getStaticProps } from '@/pages/search/[keyword]/page/[page]'
import { getDataFromCache } from '@/lib/cache/cache_manager'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'

describe('search keyword paginated page', () => {
  it('matches keywords from cached block text snippets', async () => {
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
      params: { keyword: 'Keyword', page: '1' },
      locale: 'zh-TW'
    })

    expect(getDataFromCache).toHaveBeenCalledWith('page_content_post-1', true)
    expect(result.props.postCount).toBe(1)
    expect(result.props.posts).toHaveLength(1)
  })
})
