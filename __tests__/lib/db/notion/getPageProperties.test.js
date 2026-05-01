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

import md5 from 'js-md5'
import getPageProperties, { adjustPageProperties } from '@/lib/db/notion/getPageProperties'
import { createArticlePasswordHash } from '@/lib/utils/articlePassword'
import { webcrypto } from 'crypto'

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

  it('preserves versioned article password hashes while keeping legacy md5 compatibility', async () => {
    const slug = 'private-note'
    const versionedPassword = await createArticlePasswordHash({
      slug,
      password: 'open-sesame',
      saltBytes: new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8,
        9, 10, 11, 12, 13, 14, 15, 16
      ]),
      iterations: 1000,
      crypto: webcrypto
    })

    const versionedProperties = {
      type: 'Page',
      slug,
      password: versionedPassword
    }
    adjustPageProperties(versionedProperties, {})
    expect(versionedProperties.password).toBe(versionedPassword)

    const legacyProperties = {
      type: 'Page',
      slug,
      password: 'open-sesame'
    }
    adjustPageProperties(legacyProperties, {})
    expect(legacyProperties.password).toBe(md5(slug + 'open-sesame'))
  })
})
