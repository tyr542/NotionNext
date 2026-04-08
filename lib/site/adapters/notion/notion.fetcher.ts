import { getOrSetDataWithCache } from '@/lib/cache/cache_manager'
import { fetchNotionPageBlocks } from '@/lib/db/notion/getPostBlocks'
import type { NotionRecordMap } from './notion.normalizer'

export async function fetchNotionRecordMap(
  pageId: string,
  from?: string
): Promise<NotionRecordMap> {
  return getOrSetDataWithCache(
    `site_data_${pageId}`,
    async () => fetchNotionPageBlocks(pageId, from, 0),
    pageId,
    from
  ) as Promise<NotionRecordMap>
}
