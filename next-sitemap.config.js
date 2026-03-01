const BLOG = require('./blog.config')

/**
 * 通常没啥用，sitemap交给 /pages/sitemap.xml.js 动态生成
 */
module.exports = {
  siteUrl: BLOG.LINK,
  changefreq: 'daily',
  priority: 0.7,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/_next/', '/admin/', '/private/'] },
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'GPTBot', allow: '/', disallow: ['/api/', '/_next/', '/admin/', '/private/'] },
      { userAgent: 'ClaudeBot', allow: '/', disallow: ['/api/', '/_next/', '/admin/', '/private/'] },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Amazonbot', disallow: '/' },
      { userAgent: 'Google-Extended', disallow: '/' }
    ],
    additionalSitemaps: [
      `${BLOG.LINK}/rss/feed.xml`
    ]
  }
}
