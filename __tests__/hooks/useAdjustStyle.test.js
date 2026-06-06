import { fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'

import useAdjustStyle from '@/hooks/useAdjustStyle'

function TestHarness() {
  useAdjustStyle()

  return (
    <div>
      <div className='notion-callout-text' data-testid='callout'>
        <span className='notion-link-mention'>
          <a className='notion-link-mention-link' href='https://example.com/in-callout'>
            <img
              className='notion-link-mention-icon'
              src='broken-callout-icon.png'
              alt='LangChain Blog'
            />
            <span className='notion-link-mention-provider'>LangChain Blog</span>
            <span className='notion-link-mention-title'>Context Engineering</span>
          </a>
          <div className='notion-link-mention-preview'>
            <article className='notion-link-mention-card'>
              <img
                className='notion-link-mention-preview-thumbnail'
                src='broken-callout-preview.png'
                alt='Context Engineering'
              />
            </article>
          </div>
        </span>
      </div>

      <div data-testid='outside'>
        <span className='notion-link-mention'>
          <a className='notion-link-mention-link' href='https://example.com/outside'>
            <img
              className='notion-link-mention-icon'
              src='broken-outside-icon.png'
              alt='Outside Provider'
            />
            <span className='notion-link-mention-provider'>Outside Provider</span>
            <span className='notion-link-mention-title'>Outside Title</span>
          </a>
          <div className='notion-link-mention-preview'>
            <article className='notion-link-mention-card'>
              <img
                className='notion-link-mention-preview-thumbnail'
                src='broken-outside-preview.png'
                alt='Outside Preview'
              />
            </article>
          </div>
        </span>
      </div>
    </div>
  )
}

describe('useAdjustStyle link mention handling', () => {
  it('only applies icon fallback inside notion callouts', async () => {
    const { container } = render(<TestHarness />)
    const icons = container.querySelectorAll('.notion-link-mention-icon')
    const calloutIcon = icons[0]
    const outsideIcon = icons[1]

    fireEvent.error(calloutIcon)
    fireEvent.error(outsideIcon)

    await waitFor(() => {
      expect(calloutIcon.nextElementSibling).toHaveClass('notion-link-mention-fallback')
    })

    expect(calloutIcon).toHaveStyle({ display: 'none' })
    expect(calloutIcon.nextElementSibling).toHaveTextContent('LB')

    expect(outsideIcon).not.toHaveStyle({ display: 'none' })
    expect(outsideIcon.nextElementSibling).toHaveClass('notion-link-mention-provider')
  })

  it('only hides broken preview thumbnails inside notion callouts', async () => {
    const { container } = render(<TestHarness />)
    const previews = container.querySelectorAll('.notion-link-mention-preview-thumbnail')
    const calloutPreview = previews[0]
    const outsidePreview = previews[1]

    fireEvent.error(calloutPreview)
    fireEvent.error(outsidePreview)

    await waitFor(() => {
      expect(calloutPreview).toHaveStyle({ display: 'none' })
    })

    expect(outsidePreview).not.toHaveStyle({ display: 'none' })
  })

  it('processes callout link mentions added after initial render', async () => {
    render(<TestHarness />)

    const wrapper = document.createElement('div')
    wrapper.innerHTML = `
      <div class="notion-callout-text">
        <span class="notion-link-mention">
          <a class="notion-link-mention-link" href="https://example.com/dynamic">
            <img class="notion-link-mention-icon" src="broken-dynamic-icon.png" alt="Dynamic Provider" />
            <span class="notion-link-mention-provider">Dynamic Provider</span>
            <span class="notion-link-mention-title">Dynamic Title</span>
          </a>
        </span>
      </div>
    `

    document.body.appendChild(wrapper)
    const dynamicIcon = wrapper.querySelector('.notion-link-mention-icon')

    await waitFor(() => {
      expect(dynamicIcon.dataset.fallbackBound).toBe('true')
    })

    fireEvent.error(dynamicIcon)

    await waitFor(() => {
      expect(dynamicIcon.nextElementSibling).toHaveClass('notion-link-mention-fallback')
    })
  })
})
