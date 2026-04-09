const mockPagePropsById = {}

jest.mock('notion-utils', () => ({
  idToUuid: jest.fn(value => value)
}))

jest.mock('@/lib/cache/cache_manager', () => ({
  getOrSetDataWithCache: jest.fn(async () => ({
    block: {},
    collection: {},
    collection_query: {},
    collection_view: {}
  }))
}))

jest.mock('@/lib/db/notion/getAllCategories', () => ({
  getAllCategories: jest.fn(() => [])
}))

jest.mock('@/lib/db/notion/getAllPageIds', () => ({
  __esModule: true,
  default: jest.fn(() => ['published-1', 'invisible-1'])
}))

jest.mock('@/lib/db/notion/getAllTags', () => ({
  getAllTags: jest.fn(() => [])
}))

jest.mock('@/lib/db/notion/getNotionConfig', () => ({
  getConfigMapFromConfigPage: jest.fn(() => ({}))
}))

jest.mock('@/lib/db/notion/getPageProperties', () => ({
  __esModule: true,
  default: jest.fn(async id => mockPagePropsById[id] ?? null),
  adjustPageProperties: jest.fn()
}))

jest.mock('@/lib/db/notion/getPostBlocks', () => ({
  fetchInBatches: jest.fn(async () => ({})),
  fetchNotionPageBlocks: jest.fn(async id => ({
    block: {
      [id]: {
        value: {
          id,
          type: 'page'
        }
      }
    }
  })),
  formatNotionBlock: jest.fn(block => block)
}))

jest.mock('@/lib/db/notion/mapImage', () => ({
  compressImage: jest.fn(value => value),
  mapImgUrl: jest.fn(() => '/cover.png')
}))

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn((key, defaultValue) => defaultValue)
}))

jest.mock('@/lib/db/notion/normalizeUtil', () => ({
  normalizeNotionMetadata: jest.fn(() => ({
    type: 'collection_view_page',
    collection_id: 'collection-1',
    view_ids: ['view-1'],
    space_id: 'space-1'
  })),
  normalizeCollection: jest.fn(() => ({
    schema: {}
  })),
  normalizeSchema: jest.fn(() => ({})),
  normalizePageBlock: jest.fn(() => ({
    id: 'page-block'
  }))
}))

jest.mock('@/lib/db/notion/getNotionPost', () => ({
  fetchPageFromNotion: jest.fn()
}))

jest.mock('@/lib/utils/post', () => ({
  processPostData: jest.fn(async props => {
    props.processed = true
  })
}))

jest.mock('@/lib/utils/notion.util', () => ({
  adapterNotionBlockMap: jest.fn(blockMap => blockMap)
}))

describe('resolvePostProps', () => {
  beforeEach(() => {
    mockPagePropsById['published-1'] = {
      id: 'published-1',
      type: 'Post',
      status: 'Published',
      title: 'Published post',
      slug: 'guides/published-post',
      tags: [],
      date: {}
    }

    mockPagePropsById['invisible-1'] = {
      id: 'invisible-1',
      type: 'Post',
      status: 'Invisible',
      title: 'Hidden preview',
      slug: 'guides/hidden-preview',
      tags: [],
      date: {}
    }
  })

  afterEach(() => {
    Object.keys(mockPagePropsById).forEach(key => {
      delete mockPagePropsById[key]
    })
    jest.clearAllMocks()
  })

  it('resolves invisible posts by slug without re-exposing them in public lists', async () => {
    const { resolvePostProps } = await import('@/lib/db/SiteDataApi')

    const props = await resolvePostProps({
      prefix: 'guides',
      slug: 'hidden-preview',
      from: 'test-hidden-preview'
    })

    expect(props.post?.id).toBe('invisible-1')
    expect(props.post?.status).toBe('Invisible')
    expect(props.processed).toBe(true)
    expect(props.allPages).toBeUndefined()
    expect(props.invisiblePages).toBeUndefined()
  })
})
