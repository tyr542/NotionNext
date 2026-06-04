import { getRecommendPost } from '@/lib/utils/post'

describe('getRecommendPost', () => {
  it('prioritizes shared tag count, then same category, then recency', () => {
    const currentPost = {
      id: 'current',
      type: 'Post',
      title: 'Current Post',
      tags: ['ai', 'automation', 'notion'],
      category: 'Workflow',
      publishDate: 100
    }

    const allPosts = [
      currentPost,
      {
        id: 'shared-two-other-category',
        type: 'Post',
        title: 'Shared Two Other Category',
        tags: ['ai', 'automation'],
        category: 'Tools',
        publishDate: 100
      },
      {
        id: 'shared-one-same-category-newest',
        type: 'Post',
        title: 'Shared One Same Category Newest',
        tags: ['ai'],
        category: 'Workflow',
        publishDate: 999
      },
      {
        id: 'shared-two-same-category-older',
        type: 'Post',
        title: 'Shared Two Same Category Older',
        tags: ['ai', 'automation'],
        category: 'Workflow',
        publishDate: 200
      },
      {
        id: 'shared-two-same-category-newer',
        type: 'Post',
        title: 'Shared Two Same Category Newer',
        tags: ['ai', 'automation'],
        category: 'Workflow',
        publishDate: 300
      }
    ]

    const result = getRecommendPost(currentPost, allPosts, 10)

    expect(result.map(post => post.id)).toEqual([
      'shared-two-same-category-newer',
      'shared-two-same-category-older',
      'shared-two-other-category',
      'shared-one-same-category-newest'
    ])
  })

  it('fills extension reads with same-category posts without forcing six low-quality matches', () => {
    const currentPost = {
      id: 'current',
      type: 'Post',
      title: 'Current Post',
      tags: ['ai', 'automation', 'notion'],
      category: 'Workflow',
      publishDate: 100
    }

    const allPosts = [
      currentPost,
      {
        id: 'shared-two-same-category',
        type: 'Post',
        title: 'Shared Two Same Category',
        tags: ['ai', 'automation'],
        category: 'Workflow',
        publishDate: 200
      },
      {
        id: 'shared-one-other-category',
        type: 'Post',
        title: 'Shared One Other Category',
        tags: ['ai'],
        category: 'Tools',
        publishDate: 500
      },
      {
        id: 'same-category-no-shared-tags',
        type: 'Post',
        title: 'Same Category No Shared Tags',
        tags: ['seo'],
        category: 'Workflow',
        publishDate: 900
      },
      {
        id: 'irrelevant-post',
        type: 'Post',
        title: 'Irrelevant Post',
        tags: ['finance'],
        category: 'Business',
        publishDate: 999
      }
    ]

    const result = getRecommendPost(currentPost, allPosts, 6)

    expect(result.map(post => post.id)).toEqual([
      'shared-two-same-category',
      'shared-one-other-category',
      'same-category-no-shared-tags'
    ])
    expect(result).toHaveLength(3)
  })

  it('caps same-category fallback posts to keep unrelated fill-ins conservative', () => {
    const currentPost = {
      id: 'current',
      type: 'Post',
      title: 'Current Post',
      tags: ['ai', 'automation'],
      category: 'Workflow',
      publishDate: 100
    }

    const allPosts = [
      currentPost,
      {
        id: 'shared-tag-post',
        type: 'Post',
        title: 'Shared Tag Post',
        tags: ['ai'],
        category: 'Tools',
        publishDate: 200
      },
      {
        id: 'same-category-fallback-1',
        type: 'Post',
        title: 'Same Category Fallback 1',
        tags: ['seo'],
        category: 'Workflow',
        publishDate: 900
      },
      {
        id: 'same-category-fallback-2',
        type: 'Post',
        title: 'Same Category Fallback 2',
        tags: ['career'],
        category: 'Workflow',
        publishDate: 800
      },
      {
        id: 'same-category-fallback-3',
        type: 'Post',
        title: 'Same Category Fallback 3',
        tags: ['writing'],
        category: 'Workflow',
        publishDate: 700
      }
    ]

    const result = getRecommendPost(currentPost, allPosts, 6)

    expect(result.map(post => post.id)).toEqual([
      'shared-tag-post',
      'same-category-fallback-1',
      'same-category-fallback-2'
    ])
    expect(result).toHaveLength(3)
  })
})
