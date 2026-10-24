import BLOG from '@/blog.config'
import { idToUuid } from 'notion-utils'
import ReactNotionX from 'react-notion-x'
import formatDate from '../../utils/formatDate'
import { fetchNotionPageBlocks } from './getPostBlocks'
import { checkStrIsNotionId, checkStrIsUuid } from '@/lib/utils'
import { extractLangId } from '@/lib/utils/pageId'
import { normalizeNotionMetadata } from './normalizeUtil'

/**
 * 根据页面ID获取文章
 * @param {*} pageId
 * @returns
 */
export async function fetchPageFromNotion(pageId) {
  const blockMap = await fetchNotionPageBlocks(pageId, 'slug')
  if (!blockMap) {
    return null
  }
  if (checkStrIsNotionId(pageId)) {
    pageId = idToUuid(pageId)
  }
  if (!checkStrIsUuid(pageId)) {
    return null
  }
  const postInfo = blockMap?.block?.[pageId]?.value
  if (!postInfo) {
    return null
  }
  // 2026-10 資安：只渲染本站 Notion 工作區的頁面，避免任意公開頁面借本站網域顯示
  const pageSpaceId = (postInfo.type ? postInfo : postInfo.value)?.space_id
  const siteSpaceIds = await getSiteSpaceIds()
  if (!pageSpaceId || !siteSpaceIds.includes(pageSpaceId)) {
    console.warn('[fetchPageFromNotion] page outside site workspace:', pageId)
    return null
  }
  return {
    id: pageId,
    type: postInfo.type,
    category: '',
    tags: [],
    title: postInfo?.properties?.title?.[0] || null,
    status: 'Published',
    createdTime: formatDate(
      new Date(postInfo.created_time).toString(),
      BLOG.LANG
    ),
    lastEditedDay: formatDate(
      new Date(postInfo?.last_edited_time).toString(),
      BLOG.LANG
    ),
    fullWidth: postInfo?.fullWidth || false,
    page_cover: getPageCover(postInfo) || BLOG.HOME_BANNER_IMAGE || null,
    date: {
      start_date: formatDate(
        new Date(postInfo?.last_edited_time).toString(),
        BLOG.LANG
      )
    },
    blockMap
  }
}

let siteSpaceIdsPromise = null

/**
 * 本站 Notion 工作区 id：优先读 NOTION_WORKSPACE_ID（逗号分隔），否则从站点数据库根页推导
 * 推导失败返回空数组，调用方据此拒绝渲染
 */
function getSiteSpaceIds() {
  if (process.env.NOTION_WORKSPACE_ID) {
    return Promise.resolve(
      process.env.NOTION_WORKSPACE_ID.split(',').map(s => s.trim()).filter(Boolean)
    )
  }
  if (!siteSpaceIdsPromise) {
    const rootIds = BLOG.NOTION_PAGE_ID.split(',').map(s => idToUuid(extractLangId(s.trim())))
    siteSpaceIdsPromise = Promise.all(
      rootIds.map(async rootId => {
        const rootMap = await fetchNotionPageBlocks(rootId, 'workspace-check')
        return normalizeNotionMetadata(rootMap?.block, rootId)?.space_id || null
      })
    )
      .then(ids => ids.filter(Boolean))
      .then(ids => {
        if (ids.length === 0) siteSpaceIdsPromise = null
        return ids
      })
      .catch(() => {
        siteSpaceIdsPromise = null
        return []
      })
  }
  return siteSpaceIdsPromise
}

function getPageCover(postInfo) {
  const pageCover = postInfo.format?.page_cover
  if (pageCover) {
    if (pageCover.startsWith('/')) return BLOG.NOTION_HOST + pageCover
    if (pageCover.startsWith('http')) {
      console.log('ReactNotionX', ReactNotionX)
      return pageCover
    }
    // return defaultMapImageUrl(pageCover, postInfo)
    return null
  }
}
