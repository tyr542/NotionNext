import { validateEnvironmentVariables } from '@/lib/config/env-validation'

describe('validateEnvironmentVariables', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('fails validation when public environment variables contain likely secrets', () => {
    process.env = {
      ...originalEnv,
      NOTION_PAGE_ID: '123e4567-e89b-12d3-a456-426614174000',
      NEXT_PUBLIC_LEAKED_SECRET:
        ['not-a-real', 'secret', 'key'].join('_')
    }

    const result = validateEnvironmentVariables()

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain(
      'Potential Sensitive Data exposed in public environment variable: NEXT_PUBLIC_LEAKED_SECRET'
    )
  })
})
