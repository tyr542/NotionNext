import { idToUuid } from 'notion-utils'
import type { SiteData, SiteInfo, UnknownRecord } from '../../site.types'

export interface NotionRecordMap {
  block?: UnknownRecord
}

const EMPTY_SITE_INFO: SiteInfo = {
  title: '',
  description: '',
  pageCover: '',
  icon: '',
  link: ''
}

export function normalizeNotionSite(
  recordMap: NotionRecordMap | null | undefined,
  sitePageId: string,
  from?: string
): SiteData {
  sitePageId = idToUuid(sitePageId)
  void from

  return {
    NOTION_CONFIG: {},
    siteInfo: { ...EMPTY_SITE_INFO },
    notice: null,
    allPages: [],
    allNavPages: [],
    latestPosts: [],
    categoryOptions: [],
    tagOptions: [],
    customNav: [],
    customMenu: [],
    postCount: 0,
    block: recordMap?.block ?? {},
    schema: {},
    rawMetadata: {}
  }
}
