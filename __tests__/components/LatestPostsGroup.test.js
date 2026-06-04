import { render, screen } from '@testing-library/react'

jest.mock('@/lib/global', () => ({
  useGlobal: jest.fn(() => ({
    locale: {
      COMMON: {
        LATEST_UPDATES: '最新更新'
      }
    }
  }))
}))

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    asPath: '/'
  }))
}))

jest.mock('@/components/LazyImage', () => ({
  __esModule: true,
  default: ({ alt }) => <img alt={alt} />
}))

jest.mock('@/components/SmartLink', () => ({
  __esModule: true,
  default: ({ children, href, passHref, ...rest }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}))

import LatestPostsGroup from '@/themes/hexo/components/LatestPostsGroup'

describe('LatestPostsGroup', () => {
  it('renders the editorial A layout with a plain date label and heading divider hook', () => {
    const { container } = render(
      <LatestPostsGroup
        latestPosts={[
          {
            id: 'gmail-drive',
            title: 'n8n 怎麼連上你的 Gmail 跟 Drive？Google OAuth 設定 20 分鐘搞定',
            href: '/gmail-drive',
            lastEditedDay: '2026-6-4',
            pageCoverThumbnail: '/cover.png'
          }
        ]}
        siteInfo={{ pageCover: '/fallback.png' }}
      />
    )

    const title = screen.getByText(
      'n8n 怎麼連上你的 Gmail 跟 Drive？Google OAuth 設定 20 分鐘搞定'
    )
    const date = screen.getByText('2026-6-4')
    const headingLabel = container.querySelector('.latest-updates-heading-label')
    const titleWrapper = title.closest('div')

    expect(container.querySelector('.latest-updates-heading-divider')).not.toBeNull()
    expect(headingLabel).not.toBeNull()
    expect(headingLabel.textContent).toContain('最新更新')
    expect(date).toBeInTheDocument()
    expect(screen.queryByText('更新於 2026-6-4')).not.toBeInTheDocument()
    expect(titleWrapper.className).toContain('latest-updates-title')
  })
})
