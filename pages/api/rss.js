import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { getCachedFeed } from '@/lib/utils/rss'

const FORMATS = {
  rss: { contentType: 'application/rss+xml; charset=utf-8', render: feed => feed.rss2() },
  atom: { contentType: 'application/atom+xml; charset=utf-8', render: feed => feed.atom1() },
  json: { contentType: 'application/feed+json; charset=utf-8', render: feed => feed.json1() }
}

const loadFeedProps = async () => {
  const props = await fetchGlobalAllData({ from: 'rss-api' })
  if (props?.notionDataUnavailable) {
    throw new Error('Notion data unavailable')
  }
  return props
}

/**
 * RSS 后援：/rss/feed.xml 等静态文件不存在时由 next.config.js 的 rewrites 转到这里
 * 用法：/api/rss?format=rss|atom|json
 */
export default async function handler(req, res) {
  const format = FORMATS[req.query.format] ? req.query.format : 'rss'
  try {
    const feed = await getCachedFeed(loadFeedProps)
    res.setHeader('Content-Type', FORMATS[format].contentType)
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600')
    res.status(200).send(FORMATS[format].render(feed))
  } catch (error) {
    console.warn('[api/rss] failed to build feed', error?.message || error)
    res.setHeader('Cache-Control', 'no-store')
    res.status(503).json({ error: 'Feed temporarily unavailable' })
  }
}
