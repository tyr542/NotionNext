import { timingSafeEqual } from 'crypto'
import { cleanCache } from '@/lib/cache/local_file_cache'

function tokensMatch(given, expected) {
  if (typeof given !== 'string') return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * 清理缓存
 * 必须配置 CACHE_TOKEN，未配置时拒绝所有请求；令牌优先读 Authorization: Bearer，兼容旧的 ?token=
 * @param {*} req
 * @param {*} res
 */
export default function handler(req, res) {
  const validToken = process.env.CACHE_TOKEN
  if (!validToken) {
    return res.status(503).json({ status: 'error', message: 'Cache API disabled.' })
  }

  const auth = req.headers.authorization || ''
  const given = auth.startsWith('Bearer ') ? auth.slice(7) : req.query.token
  if (!tokensMatch(given, validToken)) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized. Invalid cache token.' })
  }

  try {
    cleanCache()
    res.status(200).json({ status: 'success', message: 'Clean cache successful!' })
  } catch (error) {
    res.status(400).json({ status: 'error', message: 'Clean cache failed!' })
  }
}
