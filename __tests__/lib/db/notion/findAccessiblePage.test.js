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

describe('findAccessiblePage id matching', () => {
  const publicPages = [
    { id: '2ba70f01-9634-816d-8502-e374aa1d2ec1', type: 'Post', slug: 'hello' }
  ]

  it('matches a dashless notion id against a dashed page id', () => {
    const page = findAccessiblePage({
      fullSlug: '2BA70F019634816D8502E374AA1D2EC1',
      publicPages
    })
    expect(page?.slug).toBe('hello')
  })

  it('does not treat short slugs as ids', () => {
    expect(findAccessiblePage({ fullSlug: 'abc', publicPages })).toBeNull()
  })
})
