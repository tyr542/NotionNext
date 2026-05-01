jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn(() => 'https://example.com')
}))

import { validateInputMiddleware } from '@/lib/middleware/security'

describe('validateInputMiddleware', () => {
  function createResponse() {
    return {
      statusCode: 200,
      body: null,
      status: jest.fn(function (code) {
        this.statusCode = code
        return this
      }),
      json: jest.fn(function (body) {
        this.body = body
        return this
      })
    }
  }

  it('rejects schema fields that use an unknown type', () => {
    const req = {
      body: {
        count: 'not-a-number'
      }
    }
    const res = createResponse()
    const next = jest.fn()
    const middleware = validateInputMiddleware({
      body: {
        count: { type: 'integer' }
      }
    })

    middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.body.details).toContain('body.count must be of type integer')
    expect(next).not.toHaveBeenCalled()
  })
})
