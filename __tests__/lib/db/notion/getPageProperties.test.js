jest.mock('notion-utils', () => ({
  getDateValue: jest.fn((value) => ({
    start_date: value?.[0]?.[0] || null
  })),
  getTextContent: jest.fn((value) => {
    if (Array.isArray(value)) {
      return value
        .flat(Infinity)
        .filter(item => typeof item === 'string')
        .join('')
    }
    return value || ''
  })
}))

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn((key, defaultValue) => defaultValue)
}))

jest.mock('@/lib/db/notion/getNotionAPI', () => ({
  __esModule: true,
  default: {
    getUsers: jest.fn()
  }
}))

import getPageProperties from '@/lib/db/notion/getPageProperties'

describe('getPageProperties', () => {
  it('preserves spaces inside ext JSON string values', async () => {
    const schema = {
      ext: {
        type: 'text',
        name: 'ext'
      }
    }

    const value = {
      properties: {
        ext: [['{"video":"AI Agent Intro"}']]
      },
      created_time: '2026-04-01T00:00:00.000Z',
      last_edited_time: '2026-04-01T00:00:00.000Z',
      format: {}
    }

    const result = await getPageProperties('page-1', value, schema, null, [])

    expect(result.ext).toEqual({
      video: 'AI Agent Intro'
    })
  })
})
