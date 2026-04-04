import getAllPageIds from '@/lib/db/notion/getAllPageIds'

describe('getAllPageIds', () => {
  it('collects page ids from every collection view instead of stopping at the first populated view', () => {
    const collectionView = {
      viewA: {
        value: {
          value: {
            page_sort: ['stale-page-1', 'stale-page-2']
          }
        }
      },
      viewB: {
        value: {
          value: {
            page_sort: ['published-post-1', 'published-post-2']
          }
        }
      }
    }

    const result = getAllPageIds({}, 'collection-1', collectionView, ['viewA', 'viewB'])

    expect(result).toEqual([
      'stale-page-1',
      'stale-page-2',
      'published-post-1',
      'published-post-2'
    ])
  })

  it('prefers collection query ids for a view and only falls back to page_sort for views without query data', () => {
    const collectionQuery = {
      'collection-1': {
        viewA: {
          results: {
            blockIds: ['latest-post-1', 'latest-post-2']
          }
        }
      }
    }

    const collectionView = {
      viewA: {
        value: {
          value: {
            page_sort: ['older-post-1', 'older-post-2']
          }
        }
      },
      viewB: {
        value: {
          value: {
            page_sort: ['fallback-post-1']
          }
        }
      }
    }

    const result = getAllPageIds(
      collectionQuery,
      'collection-1',
      collectionView,
      ['viewA']
    )

    expect(result).toEqual([
      'latest-post-1',
      'latest-post-2',
      'fallback-post-1'
    ])
  })
})
