jest.mock('@/lib/cache/cache_manager', () => ({
  getDataFromCache: jest.fn(),
  getOrSetDataWithCache: jest.fn(),
  setDataToCache: jest.fn()
}))

jest.mock('@/lib/db/notion/getNotionAPI', () => ({
  __esModule: true,
  default: {
    getPage: jest.fn(),
    getBlocks: jest.fn(),
    __call: jest.fn()
  }
}))

import {
  formatNotionBlock,
  getPageWithRetry
} from '@/lib/db/notion/getPostBlocks'
import notionAPI from '@/lib/db/notion/getNotionAPI'
import { getDataFromCache } from '@/lib/cache/cache_manager'

describe('getPageWithRetry', () => {
  it('hydrates collection queries for wrapped collection_view_page responses', async () => {
    const recordMap = {
      block: {
        'db-page-id': {
          value: {
            value: {
              id: 'db-page-id',
              type: 'collection_view_page',
              collection_id: 'collection-1',
              view_ids: ['view-1'],
              space_id: 'space-1'
            },
            role: 'reader'
          }
        }
      },
      collection_view: {
        'view-1': {
          value: {
            value: {
              id: 'view-1',
              type: 'table',
              page_sort: ['older-post']
            }
          }
        }
      },
      collection_query: {}
    }

    notionAPI.getPage.mockResolvedValue(recordMap)
    notionAPI.__call.mockImplementation(async methodName => {
      if (methodName !== 'getCollectionData') {
        throw new Error(`unexpected method ${methodName}`)
      }

      return {
        recordMap: {
          block: {
            'latest-post': {
              value: {
                id: 'latest-post',
                type: 'page'
              }
            }
          },
          collection: {},
          collection_view: {},
          notion_user: {}
        },
        result: {
          reducerResults: {
            results: {
              blockIds: ['latest-post']
            }
          }
        }
      }
    })

    const result = await getPageWithRetry('db-page-id', 'unit-test')

    expect(notionAPI.__call).toHaveBeenCalledWith(
      'getCollectionData',
      'collection-1',
      'view-1',
      expect.objectContaining({
        id: 'view-1',
        type: 'table'
      }),
      expect.objectContaining({
        limit: 999,
        spaceId: 'space-1'
      })
    )
    expect(result.collection_query).toEqual({
      'collection-1': {
        'view-1': {
          results: {
            blockIds: ['latest-post']
          }
        }
      }
    })
    expect(result.block['latest-post']).toEqual({
      value: {
        id: 'latest-post',
        type: 'page'
      }
    })
  })

  it('reuses page content cache when the Notion API request fails', async () => {
    const cachedRecordMap = {
      block: {
        'db-page-id': {
          value: {
            id: 'db-page-id',
            type: 'page'
          }
        }
      }
    }

    notionAPI.getPage.mockRejectedValue(new Error('network down'))
    getDataFromCache.mockImplementation(async key => {
      if (key === 'page_content_db-page-id') {
        return cachedRecordMap
      }
      return null
    })

    const result = await getPageWithRetry('db-page-id', 'unit-test', 1)

    expect(getDataFromCache).toHaveBeenCalledWith('page_content_db-page-id')
    expect(result).toEqual(cachedRecordMap)
  })
})

describe('formatNotionBlock URL sanitization', () => {
  it('replaces scriptable Notion block URLs before rendering', () => {
    const result = formatNotionBlock({
      imageBlock: {
        value: {
          id: 'imageBlock',
          type: 'image',
          properties: {
            source: [['javascript:alert(1)']]
          },
          file: {
            url: 'data:text/html,<script>alert(1)</script>'
          },
          format: {
            page_cover: 'vbscript:msgbox(1)'
          }
        }
      }
    })

    expect(result.imageBlock.value.properties.source[0][0]).toBe(
      'https://via.placeholder.com/1x1?text=Invalid+Image'
    )
    expect(result.imageBlock.value.file.url).toBe(
      'https://via.placeholder.com/1x1?text=Invalid+Image'
    )
    expect(result.imageBlock.value.format.page_cover).toBe(
      'https://via.placeholder.com/1x1?text=Invalid+Image'
    )
  })

  it('preserves Notion attachment URLs so they can be signed later', () => {
    const result = formatNotionBlock({
      fileBlock: {
        value: {
          id: 'fileBlock',
          type: 'file',
          properties: {
            source: [['attachment:test-id:image.png']]
          }
        }
      }
    })

    expect(result.fileBlock.value.properties.source[0][0]).toBe(
      'https://notion.so/signed/attachment%3Atest-id%3Aimage.png?table=block&id=fileBlock'
    )
  })
})
