import { getLatestUpdatedPosts } from '@/lib/utils/postSort'

describe('getLatestUpdatedPosts', () => {
  it('sorts published posts by last edited date and falls back to publish date', () => {
    const posts = [
      {
        id: 'older-but-updated',
        type: 'Post',
        status: 'Published',
        title: 'Older but updated',
        publishDate: 1710000000000,
        lastEditedDate: 1730000000000
      },
      {
        id: 'newer-published',
        type: 'Post',
        status: 'Published',
        title: 'Newer published',
        publishDate: 1720000000000,
        lastEditedDate: 1720000000000
      },
      {
        id: 'fallback-publish-date',
        type: 'Post',
        status: 'Published',
        title: 'Fallback publish date',
        publishDate: 1740000000000
      },
      {
        id: 'draft-post',
        type: 'Post',
        status: 'Draft',
        title: 'Draft post',
        publishDate: 1750000000000,
        lastEditedDate: 1750000000000
      }
    ]

    const result = getLatestUpdatedPosts(posts, 3)

    expect(result.map(post => post.id)).toEqual([
      'fallback-publish-date',
      'older-but-updated',
      'newer-published'
    ])
  })
})
