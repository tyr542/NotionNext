import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData, getPostBlocks } from '@/lib/db/SiteDataApi'
import { generateRobotsTxt } from '@/lib/utils/robots.txt'
import { generateRss } from '@/lib/utils/rss'
import { generateSitemapXml } from '@/lib/utils/sitemap.xml'
import { DynamicLayout } from '@/themes/theme'
import { generateRedirectJson } from '@/lib/utils/redirect'
import { isCloudflareWorkers } from '@/lib/utils/runtime'
import { checkDataFromAlgolia } from '@/lib/plugins/algolia'
import { sortPostsForList } from '@/lib/utils/postSort'
import { sanitizeListItemsForProps } from '@/lib/utils/listPageProps'

/**
 * 首页布局
 * @param {*} props
 * @returns
 */
const Index = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutIndex' {...props} />
}

const stripRichPostFields = post => {
  if (!post || typeof post !== 'object') {
    return post
  }

  const lightweightPost = { ...post }
  delete lightweightPost.blockMap
  delete lightweightPost.content
  delete lightweightPost.toc
  return lightweightPost
}

const createRssProps = props => ({
  ...props,
  latestPosts: props.latestPosts?.map(stripRichPostFields) || []
})

/**
 * SSG 获取数据
 * @returns
 */
export async function getStaticProps(req) {
  const { locale } = req
  const from = 'index'
  const props = await fetchGlobalAllData({ from, locale })
  // 执行期取不到 Notion 时抛错，让 ISR 继续提供上一版首页，而不是缓存空站
  if (
    props?.notionDataUnavailable &&
    req?.revalidateReason &&
    req.revalidateReason !== 'build'
  ) {
    throw new Error('[ISR] Notion data unavailable, keep the previous homepage')
  }
  const POST_PREVIEW_LINES = siteConfig(
    'POST_PREVIEW_LINES',
    12,
    props?.NOTION_CONFIG
  )
  props.posts = sortPostsForList(
    sanitizeListItemsForProps(
      props.allPages?.filter(page => page.type === 'Post' && page.status === 'Published')
    )
  )

  // 处理分页
  if (siteConfig('POST_LIST_STYLE') === 'scroll') {
    // 滚动列表默认给前端返回所有数据
  } else if (siteConfig('POST_LIST_STYLE') === 'page') {
    props.posts = props.posts?.slice(
      0,
      siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG)
    )
  }

  // 预览文章内容
  const enableHomePostPreview =
    siteConfig('POST_LIST_PREVIEW', false, props?.NOTION_CONFIG) &&
    siteConfig('HOME_POST_LIST_PREVIEW', false, props?.NOTION_CONFIG)

  if (enableHomePostPreview) {
    for (const i in props.posts) {
      const post = props.posts[i]
      if (post.password && post.password !== '') {
        continue
      }
      post.blockMap = await getPostBlocks(post.id, 'slug', POST_PREVIEW_LINES)
    }
  }

  // 生成robotTxt
  if (props.notice?.blockMap) {
    props.notice = { ...props.notice }
    delete props.notice.blockMap
  }

  // 這幾個檔案寫進 public/，只在建置時寫得進去。
  // Cloudflare Workers 執行期檔案系統唯讀，寫了只會報 EPERM、白耗運算時間；
  // 正式站的 sitemap、RSS、robots 靠每天自動重建一次更新（.github/workflows/daily-rebuild.yml）
  if (!isCloudflareWorkers()) {
    generateRobotsTxt(props)
    // 生成Feed订阅
    // 要等寫完：建置結束前 RSS 檔得落地，才會被打包成靜態檔（2026-11-25 Codex 審查建議）
    await generateRss(createRssProps(props))
    // 生成
    generateSitemapXml(props)
    if (siteConfig('UUID_REDIRECT', false, props?.NOTION_CONFIG)) {
      // 生成重定向 JSON
      generateRedirectJson(props)
    }
  }
  // 检查数据是否需要从algolia删除
  checkDataFromAlgolia(props)

  // 生成全文索引 - 仅在 yarn build 时执行 && process.env.npm_lifecycle_event === 'build'

  delete props.allPages

  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}

export default Index
