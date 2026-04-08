import {
  isPublishedPost,
  isPublishedPublicContent,
  isPublishedPage
} from '@/lib/db/notion/publicContent'
import BLOG from '@/blog.config'

const originalPropertyNames = { ...BLOG.NOTION_PROPERTY_NAME }

describe('public content filters', () => {
  afterEach(() => {
    BLOG.NOTION_PROPERTY_NAME = { ...originalPropertyNames }
  })

  it('treats published posts as public content', () => {
    const post = {
      type: 'Post',
      status: 'Published',
      slug: 'hello-world'
    }

    expect(isPublishedPost(post)).toBe(true)
    expect(isPublishedPublicContent(post)).toBe(true)
  })

  it('treats published pages as public content but not posts', () => {
    const page = {
      type: 'Page',
      status: 'Published',
      slug: 'about'
    }

    expect(isPublishedPage(page)).toBe(true)
    expect(isPublishedPost(page)).toBe(false)
    expect(isPublishedPublicContent(page)).toBe(true)
  })

  it('rejects invisible, backend-only, and slugless records from public exposure', () => {
    const cases = [
      {
        type: 'Post',
        status: 'Invisible',
        slug: 'future-post'
      },
      {
        type: 'Menu',
        status: 'Published',
        slug: 'menu-root'
      },
      {
        type: 'Notice',
        status: 'Published',
        slug: 'notice'
      },
      {
        type: 'Page',
        status: 'Published',
        slug: '#'
      },
      {
        type: 'Page',
        status: 'Published',
        slug: '   '
      }
    ]

    cases.forEach(item => {
      expect(isPublishedPost(item)).toBe(false)
      expect(isPublishedPage(item)).toBe(false)
      expect(isPublishedPublicContent(item)).toBe(false)
    })
  })

  it('keeps normalized posts and pages public when Notion option labels are customized', () => {
    BLOG.NOTION_PROPERTY_NAME = {
      ...BLOG.NOTION_PROPERTY_NAME,
      status_publish: '已發布',
      type_post: '文章',
      type_page: '頁面'
    }

    const post = {
      type: 'Post',
      status: 'Published',
      slug: 'hello-world'
    }

    const page = {
      type: 'Page',
      status: 'Published',
      slug: 'about'
    }

    expect(isPublishedPost(post)).toBe(true)
    expect(isPublishedPage(page)).toBe(true)
    expect(isPublishedPublicContent(post)).toBe(true)
    expect(isPublishedPublicContent(page)).toBe(true)
  })
})
