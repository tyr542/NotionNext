import imageProxy from '@/pages/api/image'

const createRes = () => {
  const res = { headers: {}, statusCode: 0, body: null }
  res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v }
  res.status = code => { res.statusCode = code; return res }
  res.json = body => { res.body = body; return res }
  res.send = body => { res.body = body; return res }
  return res
}

const fakeResponse = (status, headers = {}, body = '') => ({
  status,
  ok: status >= 200 && status < 300,
  headers: { get: name => headers[name.toLowerCase()] ?? null },
  arrayBuffer: async () => Uint8Array.from(Buffer.from(body)).buffer
})

const notionUrl = 'https://www.notion.so/image/https%3A%2F%2Fexample.com%2Fa.svg'

describe('/api/image', () => {
  const originalFetch = global.fetch
  afterEach(() => { global.fetch = originalFetch })

  it('rejects a redirect that leaves the allowlist', async () => {
    global.fetch = jest.fn(async () =>
      fakeResponse(302, { location: 'http://169.254.169.254/latest/meta-data' })
    )
    const res = createRes()
    await imageProxy({ query: { url: notionUrl } }, res)
    expect(res.statusCode).toBe(400)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('serves SVG with a sandbox CSP and nosniff', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce(fakeResponse(302, { location: 'https://img.notionusercontent.com/ext/a.svg' }))
      .mockResolvedValueOnce(fakeResponse(200, { 'content-type': 'image/svg+xml' }, '<svg/>'))
    const res = createRes()
    await imageProxy({ query: { url: notionUrl } }, res)
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-security-policy']).toContain('sandbox')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })

  it('rejects images larger than the limit', async () => {
    global.fetch = jest.fn(async () =>
      fakeResponse(200, { 'content-type': 'image/png', 'content-length': String(20 * 1024 * 1024) })
    )
    const res = createRes()
    await imageProxy({ query: { url: notionUrl } }, res)
    expect(res.statusCode).toBe(413)
  })
})
