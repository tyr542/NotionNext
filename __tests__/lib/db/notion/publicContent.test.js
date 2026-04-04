import {
  isPublishedPost,
  isPublishedPublicContent,
  isPublishedPage
} from '@/lib/db/notion/publicContent'

describe('public content filters', () => {
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
})
