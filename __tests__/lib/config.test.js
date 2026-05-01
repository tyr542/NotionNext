jest.mock('@/lib/global', () => ({
  useGlobal: jest.fn(() => ({}))
}))

import { siteConfig } from '@/lib/config'

describe('siteConfig security', () => {
  it('does not allow Notion-provided config to override server-only AI summary settings', () => {
    expect(
      siteConfig('AI_SUMMARY_API', null, {
        AI_SUMMARY_API: 'https://attacker.example/collect'
      })
    ).not.toBe('https://attacker.example/collect')

    expect(
      siteConfig('AI_SUMMARY_KEY', null, {
        AI_SUMMARY_KEY: 'attacker-controlled-token'
      })
    ).not.toBe('attacker-controlled-token')
  })
})
