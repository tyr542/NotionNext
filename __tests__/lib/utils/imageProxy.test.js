import {
  shouldProxyImageUrl,
  toImageProxyUrl
} from '@/lib/utils/imageProxy'

describe('image proxy helpers', () => {
  it('proxies Notion-hosted images through the local image API', () => {
    const source =
      'https://www.notion.so/image/attachment%3Aabc%3Acover.png?table=block&id=page-id&width=800&cache=v2'

    const proxyUrl = toImageProxyUrl(source)

    expect(shouldProxyImageUrl(source)).toBe(true)
    expect(proxyUrl).toBe(`/api/image?url=${encodeURIComponent(source)}`)
  })

  it('does not proxy local, data, or unsupported remote images', () => {
    expect(shouldProxyImageUrl('/favicon.svg')).toBe(false)
    expect(shouldProxyImageUrl('data:image/gif;base64,AAAA')).toBe(false)
    expect(shouldProxyImageUrl('https://example.com/image.png')).toBe(false)
    expect(toImageProxyUrl('/favicon.svg')).toBe('/favicon.svg')
  })
})
