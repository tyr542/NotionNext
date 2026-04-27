import fs from 'fs'

import { RateLimiter } from '@/lib/db/notion/RateLimiter'

describe('RateLimiter', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('retries lock acquisition when the lock file open returns EPERM', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false)

    const writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync')
    writeFileSyncSpy
      .mockImplementationOnce(() => {
        throw Object.assign(new Error('operation not permitted'), { code: 'EPERM' })
      })
      .mockImplementationOnce(() => undefined)

    const limiter = new RateLimiter(200, 'D:\\coding\\git\\NotionNext\\.notion-api-lock')

    const acquireLockPromise = limiter.acquireLock()
    await jest.runOnlyPendingTimersAsync()
    await acquireLockPromise

    expect(writeFileSyncSpy).toHaveBeenCalledTimes(2)
  })
})
