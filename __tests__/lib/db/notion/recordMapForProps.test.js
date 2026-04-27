import {
  createNoticePreview,
  shrinkRecordMapForPageProps
} from '@/lib/db/notion/recordMapForProps'

describe('recordMapForProps', () => {
  it('removes runtime metadata that is not needed in article page props', () => {
    const recordMap = {
      block: {
        'page-1': {
          value: {
            id: 'page-1',
            type: 'page',
            version: 7,
            created_time: 100,
            last_edited_time: 200,
            shard_id: 300,
            content: ['child-1'],
            format: {
              page_cover: '/cover.png',
              copied_from_pointer: 'pointer-1',
              block_locked_by: 'user-1'
            }
          }
        }
      },
      collection: {
        'collection-1': {
          value: {
            id: 'collection-1',
            version: 4,
            space_id: 'space-1'
          }
        }
      },
      collection_view: {
        'view-1': {
          value: {
            id: 'view-1',
            last_edited_time: 123
          }
        }
      },
      notion_user: {}
    }

    const result = shrinkRecordMapForPageProps(recordMap)

    expect(result.block['page-1'].value).toEqual({
      id: 'page-1',
      type: 'page',
      content: ['child-1'],
      format: {
        page_cover: '/cover.png'
      }
    })
    expect(result.collection['collection-1'].value).toEqual({
      id: 'collection-1'
    })
    expect(result.collection_view['view-1'].value).toEqual({
      id: 'view-1'
    })
    expect(result.notion_user).toBeUndefined()
  })

  it('drops heavy notice block maps while keeping lightweight preview fields', () => {
    const notice = {
      title: 'Site announcement',
      summary: 'Short summary',
      href: '/announcement',
      blockMap: {
        block: {
          a: {
            value: {
              id: 'a',
              type: 'text'
            }
          }
        }
      }
    }

    expect(createNoticePreview(notice)).toEqual({
      title: 'Site announcement',
      summary: 'Short summary',
      href: '/announcement'
    })
  })
})
