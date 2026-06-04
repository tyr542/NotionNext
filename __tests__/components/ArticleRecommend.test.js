import { render, screen } from '@testing-library/react'

jest.mock('@/lib/global', () => ({
  useGlobal: jest.fn(() => ({
    locale: {
      COMMON: {
        RELATE_POSTS: '相關文章'
      }
    }
  }))
}))

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn(() => true)
}))

jest.mock('@/components/LazyImage', () => ({
  __esModule: true,
  default: ({ alt, ...rest }) => <img alt={alt || 'cover'} {...rest} />
}))

jest.mock('@/components/SmartLink', () => ({
  __esModule: true,
  default: ({ children, href, passHref, ...rest }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}))

import ArticleRecommend from '@/themes/hexo/components/ArticleRecommend'

describe('ArticleRecommend', () => {
  it('renders up to six related posts as the same card style', () => {
    render(
      <ArticleRecommend
        siteInfo={{ pageCover: '/fallback.png' }}
        recommendPosts={[
          { id: 'p1', title: '文章一', href: '/p1', pageCoverThumbnail: '/p1.png' },
          { id: 'p2', title: '文章二', href: '/p2', pageCoverThumbnail: '/p2.png' },
          { id: 'p3', title: '文章三', href: '/p3', pageCoverThumbnail: '/p3.png' },
          { id: 'p4', title: '文章四', href: '/p4', pageCoverThumbnail: '/p4.png' },
          { id: 'p5', title: '文章五', href: '/p5', pageCoverThumbnail: '/p5.png' },
          { id: 'p6', title: '文章六', href: '/p6', pageCoverThumbnail: '/p6.png' },
          { id: 'p7', title: '文章七', href: '/p7', pageCoverThumbnail: '/p7.png' }
        ]}
      />
    )

    expect(screen.getByText('相關文章')).toBeInTheDocument()
    expect(screen.getByText('文章一')).toBeInTheDocument()
    expect(screen.getByText('文章六')).toBeInTheDocument()
    expect(screen.queryByText('文章七')).not.toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(6)
  })
})
