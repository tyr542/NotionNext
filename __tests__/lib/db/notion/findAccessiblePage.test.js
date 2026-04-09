import { findAccessiblePage } from '@/lib/db/notion/findAccessiblePage'

describe('findAccessiblePage', () => {
  it('finds invisible content by slug when it is excluded from public lists', () => {
    const page = findAccessiblePage({
      fullSlug: 'guides/private-preview',
      publicPages: [
        {
          id: 'published-post',
          type: 'Post',
          slug: 'guides/public-post'
        }
      ],
      invisiblePages: [
        {
          id: 'invisible-post',
          type: 'Post',
          slug: 'guides/private-preview',
          status: 'Invisible'
        }
      ]
    })

    expect(page?.id).toBe('invisible-post')
  })

  it('prefers public content when the same slug exists in both sources', () => {
    const page = findAccessiblePage({
      fullSlug: 'guides/shared-slug',
      publicPages: [
        {
          id: 'published-post',
          type: 'Post',
          slug: 'guides/shared-slug'
        }
      ],
      invisiblePages: [
        {
          id: 'invisible-post',
          type: 'Post',
          slug: 'guides/shared-slug',
          status: 'Invisible'
        }
      ]
    })

    expect(page?.id).toBe('published-post')
  })

  it('ignores menu-style rows and supports id lookup fallbacks', () => {
    const page = findAccessiblePage({
      fullSlug: 'notion-page-id',
      publicPages: [
        {
          id: 'menu-root',
          type: 'Menu',
          slug: 'notion-page-id'
        }
      ],
      invisiblePages: [
        {
          id: 'notion-page-id',
          type: 'Page',
          slug: 'hidden-page',
          status: 'Invisible'
        }
      ]
    })

    expect(page?.id).toBe('notion-page-id')
  })
})
