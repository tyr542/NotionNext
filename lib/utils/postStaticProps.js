import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'

/**
 * 文章类路由 getStaticProps 的统一返回
 * - Notion 数据取不到时：执行期（ISR 重建）直接抛错，Next 会继续提供上一版成功的页面，
 *   避免把「空站 / 找不到」写进缓存；构建期照常返回，让构建不中断
 * - 找不到文章：返回 notFound，回应真正的 404（之前是 200 的软 404）
 * @param {*} props resolvePostProps 的结果
 * @param {'build'|'stale'|'on-demand'|undefined} revalidateReason Next 15 getStaticProps context 提供
 * @returns
 */
export function toPostStaticResult(props, revalidateReason) {
  const revalidate = process.env.EXPORT
    ? undefined
    : siteConfig(
      'NEXT_REVALIDATE_SECOND',
      BLOG.NEXT_REVALIDATE_SECOND,
      props?.NOTION_CONFIG
    )

  if (props?.notionDataUnavailable && revalidateReason && revalidateReason !== 'build') {
    throw new Error('[ISR] Notion data unavailable, keep the previously generated page')
  }

  if (!props?.post) {
    return { notFound: true, revalidate }
  }

  return { props, revalidate }
}
