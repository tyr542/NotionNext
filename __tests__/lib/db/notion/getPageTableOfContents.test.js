import { getPageTableOfContents } from '@/lib/db/notion/getPageTableOfContents'

jest.mock('notion-utils', () => ({
  getTextContent: title => title?.flat?.().join('') ?? ''
}))

describe('getPageTableOfContents', () => {
  it('does not throw when Notion returns an unmapped header-like block type', () => {
    const page = {
      id: 'page-id',
      content: ['heading-1', 'unknown-heading', 'heading-2']
    }
    const recordMap = {
      block: {
        'heading-1': {
          value: {
            type: 'header',
            properties: { title: [['Top heading']] }
          }
        },
        'unknown-heading': {
          value: {
            type: 'toggle_header',
            properties: { title: [['Toggle heading']] }
          }
        },
        'heading-2': {
          value: {
            type: 'sub_header',
            properties: { title: [['Child heading']] }
          }
        }
      }
    }

    expect(() => getPageTableOfContents(page, recordMap)).not.toThrow()
  })

  it('skips unknown header-like block types instead of corrupting the indent stack', () => {
    const page = {
      id: 'page-id',
      content: ['heading-1', 'unknown-heading', 'heading-2']
    }
    const recordMap = {
      block: {
        'heading-1': {
          value: {
            type: 'header',
            properties: { title: [['Top heading']] }
          }
        },
        'unknown-heading': {
          value: {
            type: 'new_header_type',
            properties: { title: [['Unknown heading']] }
          }
        },
        'heading-2': {
          value: {
            type: 'sub_header',
            properties: { title: [['Child heading']] }
          }
        }
      }
    }

    expect(getPageTableOfContents(page, recordMap)).toEqual([
      expect.objectContaining({
        id: 'heading-1',
        text: 'Top heading',
        indentLevel: 0
      }),
      expect.objectContaining({
        id: 'heading-2',
        text: 'Child heading',
        indentLevel: 1
      })
    ])
  })
})
