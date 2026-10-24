jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn(() => 60)
}))

import { toPostStaticResult } from '@/lib/utils/postStaticProps'

describe('toPostStaticResult', () => {
  it('returns notFound when the post is missing', () => {
    expect(toPostStaticResult({ post: null }, 'stale')).toEqual({
      notFound: true,
      revalidate: 60
    })
  })

  it('returns props when the post exists', () => {
    const props = { post: { id: 'a' } }
    expect(toPostStaticResult(props, 'stale')).toEqual({ props, revalidate: 60 })
  })

  it('throws during ISR when Notion data is unavailable so the old page is kept', () => {
    expect(() =>
      toPostStaticResult({ post: null, notionDataUnavailable: true }, 'stale')
    ).toThrow('Notion data unavailable')
  })

  it('does not throw at build time even when Notion data is unavailable', () => {
    expect(
      toPostStaticResult({ post: null, notionDataUnavailable: true }, 'build')
    ).toEqual({ notFound: true, revalidate: 60 })
  })
})
