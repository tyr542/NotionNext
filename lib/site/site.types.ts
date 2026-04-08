export interface FetchSiteParams {
  pageId: string
  from?: string
  locale?: string
}

export type UnknownRecord = Record<string, unknown>

export interface SiteInfo {
  title: string
  description: string
  pageCover: string
  icon: string
  link: string
}

export type PageStatus = 'Published' | 'Invisible'
export type PageType = 'Post' | 'Page' | 'Notice' | 'Menu' | 'SubMenu'

export interface PageDate {
  start_date?: string
  start_time?: string
  end_date?: string
  end_time?: string
  time_zone?: string
  lastEditedDay?: string
}

export interface TagItem {
  name: string
}

export interface BasePage {
  id?: string
  title: string
  slug: string
  type: PageType
  status: PageStatus
  summary?: string
  category?: string
  tags?: string[]
  tagItems?: TagItem[]
  date?: PageDate
  publishDate?: number
  lastEditedDate?: number
  pageCoverThumbnail?: string
  pageIcon?: string
  href?: string
  ext?: UnknownRecord
}

export interface NavPage {
  id?: string
  title: string
  slug: string
  summary?: string
  category?: string
  tags?: string[]
  pageCoverThumbnail?: string
  pageIcon?: string
  href?: string
  publishDate?: number
  lastEditedDate?: number
  ext?: UnknownRecord
}

export interface MenuItem {
  name: string
  icon?: string | null
  href?: string
  target?: string
  show: boolean
  subMenus?: MenuItem[]
}

export interface SiteData {
  NOTION_CONFIG: UnknownRecord

  siteInfo: SiteInfo
  notice: BasePage | null

  allPages: BasePage[]
  allNavPages: NavPage[]
  latestPosts: BasePage[]

  categoryOptions: UnknownRecord[]
  tagOptions: UnknownRecord[]

  customNav: MenuItem[]
  customMenu: MenuItem[]

  postCount: number

  block?: UnknownRecord
  schema?: UnknownRecord
  rawMetadata?: UnknownRecord
  pageIds?: string[]
}
