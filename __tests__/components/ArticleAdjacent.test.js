import { render, screen } from '@testing-library/react'

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn(() => true)
}))

jest.mock('@/components/SmartLink', () => ({
  __esModule: true,
  default: ({ children, href, passHref, ...rest }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}))

import ArticleAdjacent from '@/themes/hexo/components/ArticleAdjacent'

describe('ArticleAdjacent', () => {
  it('renders previous and next articles as two cards with labels', () => {
    render(
      <ArticleAdjacent
        prev={{ slug: 'prev-post', title: '上一篇標題' }}
        next={{ slug: 'next-post', title: '下一篇標題' }}
      />
    )

    expect(screen.getByText('上一篇')).toBeInTheDocument()
    expect(screen.getByText('下一篇')).toBeInTheDocument()
    expect(screen.getByText('上一篇標題')).toBeInTheDocument()
    expect(screen.getByText('下一篇標題')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /上一篇標題/ })).toHaveAttribute(
      'href',
      '/prev-post'
    )
    expect(screen.getByRole('link', { name: /下一篇標題/ })).toHaveAttribute(
      'href',
      '/next-post'
    )
  })
})
