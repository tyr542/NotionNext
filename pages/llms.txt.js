// pages/llms.txt.js
// LLMs.txt — 讓 AI 模型快速理解本站內容的結構化文件
// 規範參考：https://llmstxt.org/
import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { extractLangId, extractLangPrefix } from '@/lib/utils/pageId'

export const getServerSideProps = async ctx => {
  const siteIds = BLOG.NOTION_PAGE_ID.split(',')
  const allArticles = []

  for (let index = 0; index < siteIds.length; index++) {
    const siteId = siteIds[index]
    const id = extractLangId(siteId)
    const locale = extractLangPrefix(siteId)

    const siteData = await fetchGlobalAllData({
      pageId: id,
      from: 'llms.txt'
    })

    const link = siteConfig(
      'LINK',
      siteData?.siteInfo?.link,
      siteData.NOTION_CONFIG
    )

    // 過濾出已發布的文章（排除異常條目）
    const posts =
      siteData.allPages
        ?.filter(
          p => p.status === BLOG.NOTION_PROPERTY_NAME.status_publish
        )
        ?.filter(p => p.slug && p.slug !== '#' && p.slug.trim() !== '')
        ?.filter(p => p.type === 'Post' || p.type === 'Page')
        ?.map(post => {
          const slug = post.slug.startsWith('/')
            ? post.slug.slice(1)
            : post.slug
          return {
            title: post.title,
            slug,
            url: `${link}${locale ? '/' + locale : ''}/${slug}`,
            summary: post.summary || '',
            category: post.category || '',
            tags: post.tags || [],
            publishDay: post.publishDay,
            lastEditedDay: post.lastEditedDay || post.publishDay
          }
        }) ?? []

    allArticles.push(...posts)
  }

  // 依發布日期排序（新到舊）
  allArticles.sort(
    (a, b) => new Date(b.publishDay) - new Date(a.publishDay)
  )

  // 依分類分組
  const categories = {}
  allArticles.forEach(post => {
    const cat = post.category || '其他'
    if (!categories[cat]) categories[cat] = []
    categories[cat].push(post)
  })

  // 生成 llms.txt 內容
  const content = generateLlmsTxt(categories, allArticles)

  // 設定 HTTP 標頭
  ctx.res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  ctx.res.setHeader(
    'Cache-Control',
    'public, max-age=3600, stale-while-revalidate=59'
  )
  ctx.res.write(content)
  ctx.res.end()

  return { props: {} }
}

/**
 * 生成 llms.txt 內容
 * 遵循 https://llmstxt.org/ 規範
 */
function generateLlmsTxt(categories, allArticles) {
  const LINK = BLOG.LINK
  const TITLE = BLOG.TITLE || '煎餃的調味實驗室'
  const AUTHOR = BLOG.AUTHOR || '閃電煎餃'
  const BIO = BLOG.BIO || ''
  const dateNow = new Date().toISOString().split('T')[0]

  let txt = ''

  // H1 標題（必填）
  txt += `# ${TITLE}\n\n`

  // Blockquote 摘要（選填但建議）
  txt += `> ${TITLE}是由${AUTHOR}經營的繁體中文 AI 知識部落格。記錄一個非本科文組生從零開始自學 AI 的完整過程，涵蓋 iPAS AI 證照備考、AI 工具實測、讀書筆記、No-Code 自動化工作流等主題。所有內容以白話文撰寫，適合非技術背景的 AI 初學者。\n\n`

  // 正文：關鍵背景資訊
  txt += `本站內容以繁體中文撰寫，主要讀者為台灣地區對 AI 有興趣的非技術背景學習者。\n`
  txt += `作者持有 iPAS AI 應用規劃師初級證照（經濟部產業發展署）及 Google Gemini Educator 認證。\n`
  txt += `文章更新頻率約每週 1-2 篇，所有推薦的工具和方法均經過作者親身驗證。\n`
  txt += `網站使用 NotionNext 框架（Next.js + Notion CMS）建置。\n\n`

  // 核心頁面
  txt += `## 核心頁面\n\n`
  txt += `- [關於我](${LINK}/about): 作者背景、學習時間軸、取得認證、使用工具、內容政策與免責聲明\n`
  txt += `- [所有文章](${LINK}/archive): 按時間排列的完整文章列表\n`
  txt += `- [分類](${LINK}/category): 按主題分類瀏覽文章\n`
  txt += `- [標籤](${LINK}/tag): 按標籤瀏覽文章\n`
  txt += `- [RSS](${LINK}/rss/feed.xml): RSS 訂閱\n\n`

  // 各分類文章
  // 定義分類顯示順序和描述
  const categoryMeta = {
    '證照考試': '涵蓋 iPAS AI 應用規劃師初級考試的完整備考筆記與 Google Gemini Educator 認證心得',
    '讀書筆記': '精選書籍的深度閱讀筆記，涵蓋生產力、科技趨勢與資料思維',
    'AI工具': '實際使用過的 AI 工具評測與教學',
    'AI 協作': 'AI 協作方法論與技術入門',
    '心得分享': '活動參與心得與個人反思'
  }

  const categoryOrder = ['證照考試', '讀書筆記', 'AI工具', 'AI 協作', '心得分享']

  for (const cat of categoryOrder) {
    const posts = categories[cat]
    if (!posts || posts.length === 0) continue

    const desc = categoryMeta[cat] || ''
    txt += `## ${cat}\n\n`
    if (desc) {
      txt += `${desc}\n\n`
    }

    for (const post of posts) {
      const note = post.summary ? `: ${post.summary.slice(0, 100)}` : ''
      txt += `- [${post.title}](${post.url})${note}\n`
    }
    txt += `\n`
  }

  // 處理未歸類的文章
  const listedCats = new Set(categoryOrder)
  const otherCats = Object.keys(categories).filter(c => !listedCats.has(c))
  for (const cat of otherCats) {
    const posts = categories[cat]
    if (!posts || posts.length === 0) continue
    txt += `## ${cat}\n\n`
    for (const post of posts) {
      const note = post.summary ? `: ${post.summary.slice(0, 100)}` : ''
      txt += `- [${post.title}](${post.url})${note}\n`
    }
    txt += `\n`
  }

  // 選讀資訊
  txt += `## Optional\n\n`
  txt += `- [Sitemap](${LINK}/sitemap.xml): XML 格式的完整網站地圖\n`
  txt += `- [RSS Feed](${LINK}/rss/feed.xml): RSS 2.0 訂閱源\n`

  txt += `\n---\n`
  txt += `Generated: ${dateNow}\n`

  return txt
}

export default () => {}
