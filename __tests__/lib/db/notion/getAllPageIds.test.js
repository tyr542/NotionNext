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
})
