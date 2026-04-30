jest.mock('fs', () => ({
  statSync: jest.fn(() => {
    throw new Error('missing feed')
  }),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn()
}))

jest.mock('@/lib/db/SiteDataApi', () => ({
  getPostBlocks: jest.fn()
}))

jest.mock('@/components/NotionPage', () => function MockNotionPage() {
  return <div>feed content</div>
})

jest.mock('react-dom/server', () => ({
  renderToString: jest.fn(() => '<div>feed content</div>')
}))

jest.mock('@/lib/plugins/mailEncrypt', () => ({
  decryptEmail: jest.fn(email => email)
}))

import fs from 'fs'
import { getPostBlocks } from '@/lib/db/SiteDataApi'
import { generateRss } from '@/lib/utils/rss'

const props = {
  NOTION_CONFIG: {
    AUTHOR: 'Gyoza',
    LANG: 'zh-TW',
    SUB_PATH: '',
    CONTACT_EMAIL: 'hello@example.com'
  },
  siteInfo: {
    title: 'GyozaLab',
    description: 'Blog',
    link: 'https://gyozalab.com'
  },
  latestPosts: [
    {
      id: 'post-1',
      title: 'Post 1',
      slug: 'post-1',
      summary: 'Summary',
      publishDay: '2026-04-30'
    }
  ]
}

describe('generateRss', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('coalesces concurrent runtime feed generation into one Notion render pass', async () => {
    let resolveBlocks
    getPostBlocks.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveBlocks = resolve
        })
    )

    const first = generateRss(props)
    const second = generateRss(props)

    expect(getPostBlocks).toHaveBeenCalledTimes(1)

    resolveBlocks({ block: {} })
    await Promise.all([first, second])

    expect(getPostBlocks).toHaveBeenCalledTimes(1)
    expect(fs.writeFileSync).toHaveBeenCalledTimes(3)
  })
})
