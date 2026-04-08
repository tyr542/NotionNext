import { render, screen } from '@testing-library/react'

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn((key, fallback = null) => {
    if (key === 'SUB_PATH') return ''
    return fallback
  })
}))

jest.mock('@/lib/global', () => ({
  useGlobal: jest.fn(() => ({
    locale: {
      COMMON: {
        LATEST_POSTS: '最新發佈'
      }
    }
  }))
}))

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    asPath: '/'
  }))
}))

import LatestPostsGroupMini from '@/themes/heo/components/LatestPostsGroupMini'

describe('LatestPostsGroupMini', () => {
  it('shows the publish day for latest posts instead of the last edited day', () => {
    render(
      <LatestPostsGroupMini
        latestPosts={[
          {
            id: 'agent-skills',
            title: 'Agent Skills',
            slug: 'agent-skills',
            href: '/agent-skills',
            publishDay: '2026-3-24',
            lastEditedDay: '2026-3-25'
          }
        ]}
        siteInfo={{ pageCover: '/cover.png' }}
      />
    )

    expect(screen.getByText('2026-3-24')).toBeInTheDocument()
    expect(screen.queryByText('2026-3-25')).not.toBeInTheDocument()
  })
})
