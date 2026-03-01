import fs from 'fs'

export function generateRobotsTxt(props) {
  const { siteInfo } = props
  const LINK = siteInfo?.link
  const content = `# 搜尋引擎爬蟲
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /private/

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# AI 搜尋引擎爬蟲（部分開放：允許已發布的公開文章）
User-agent: GPTBot
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /private/

User-agent: ClaudeBot
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /private/

User-agent: PerplexityBot
Allow: /

User-agent: Amazonbot
Disallow: /

User-agent: Google-Extended
Disallow: /

# Host
Host: ${LINK}

# Sitemaps
Sitemap: ${LINK}/sitemap.xml
Sitemap: ${LINK}/rss/feed.xml
`
  try {
    fs.mkdirSync('./public', { recursive: true })
    fs.writeFileSync('./public/robots.txt', content)
  } catch (error) {
    // 在vercel运行环境是只读的，这里会报错；
    // 但在vercel编译阶段、或VPS等其他平台这行代码会成功执行
  }
}
