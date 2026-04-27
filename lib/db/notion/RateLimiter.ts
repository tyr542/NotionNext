import fs from 'fs'
import path from 'path'

interface QueueItem<T> {
  requestFunc: () => Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (err: unknown) => void
}

function isErrorWithCode(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error
}

const LOCK_RETRYABLE_ERRORS = new Set(['EEXIST', 'EPERM'])

export class RateLimiter {
  private queue: QueueItem<unknown>[] = []
  private inflight = new Set<string>()
  private isProcessing = false
  private lastRequestTime = 0
  private requestCount = 0
  private windowStart = Date.now()

  constructor(
    private maxRequestsPerMinute = 200,
    private lockFilePath: string = path.resolve(process.cwd(), '.notion-api-lock')
  ) {}

  private async acquireLock() {
    if (!this.lockFilePath) return

    if (fs.existsSync(this.lockFilePath)) {
      const stats = fs.statSync(this.lockFilePath)
      const age = Date.now() - stats.ctimeMs
      if (age > 30 * 1000) {
        try {
          fs.unlinkSync(this.lockFilePath)
          console.warn('[notion-rate-limit] removed stale lock', this.lockFilePath)
        } catch (err) {
          console.error('[notion-rate-limit] failed to remove stale lock', err)
        }
      }
    }

    while (true) {
      try {
        fs.writeFileSync(this.lockFilePath, process.pid.toString(), { flag: 'wx' })
        return
      } catch (err: unknown) {
        if (isErrorWithCode(err) && err.code && LOCK_RETRYABLE_ERRORS.has(err.code)) {
          await new Promise(resolve => setTimeout(resolve, 100))
          continue
        }

        throw err
      }
    }
  }

  private releaseLock() {
    if (!this.lockFilePath) return

    try {
      if (fs.existsSync(this.lockFilePath)) {
        fs.unlinkSync(this.lockFilePath)
      }
    } catch (err) {
      console.error('[notion-rate-limit] failed to release lock', err)
    }
  }

  public enqueue<T>(key: string, requestFunc: () => Promise<T>): Promise<T> {
    if (this.inflight.has(key)) {
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          if (!this.inflight.has(key)) {
            clearInterval(interval)
            this.enqueue(key, requestFunc).then(resolve).catch(reject)
          }
        }, 50)
      })
    }

    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFunc: requestFunc as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject
      })

      if (!this.isProcessing) {
        void this.processQueue()
      }
    })
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false
      return
    }

    this.isProcessing = true

    try {
      await this.acquireLock()
      const now = Date.now()
      const elapsed = now - this.windowStart

      if (elapsed > 60_000) {
        this.requestCount = 0
        this.windowStart = now
      }

      if (this.requestCount >= this.maxRequestsPerMinute) {
        const waitTime = 60_000 - elapsed + 100
        await new Promise(resolve => setTimeout(resolve, waitTime))
        this.requestCount = 0
        this.windowStart = Date.now()
      }

      const minInterval = 300
      const waitTime = Math.max(0, minInterval - (now - this.lastRequestTime))
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }

      const nextItem = this.queue.shift()
      if (!nextItem) return

      const { requestFunc, resolve, reject } = nextItem
      const inflightKey = crypto.randomUUID()
      this.inflight.add(inflightKey)

      try {
        const result = await requestFunc()
        this.lastRequestTime = Date.now()
        this.requestCount++
        resolve(result)
      } catch (err) {
        reject(err)
      } finally {
        this.inflight.delete(inflightKey)
      }
    } catch (err) {
      console.error('[notion-rate-limit] queue processing failed', err)
    } finally {
      this.releaseLock()
      setTimeout(() => {
        void this.processQueue()
      }, 0)
    }
  }
}
