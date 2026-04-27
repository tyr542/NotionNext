import { fireEvent, render, screen } from '@testing-library/react'

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn((key, fallback = null) => {
    const config = {
      IMAGE_COMPRESS_WIDTH: 1200,
      IMG_LAZY_LOAD_PLACEHOLDER: '/placeholder.png',
      LAZY_LOAD_THRESHOLD: '200px',
      WEBP_SUPPORT: false,
      AVIF_SUPPORT: false
    }

    return key in config ? config[key] : fallback
  })
}))

import LazyImage from '@/components/LazyImage'

const originalImage = global.Image

class MockImage {
  constructor() {
    this.onload = null
    this.onerror = null
    this.decoding = 'async'
    this._src = ''
  }

  get src() {
    return this._src
  }

  set src(value) {
    this._src = value
    setTimeout(() => {
      if (typeof this.onload === 'function') {
        this.onload()
      }
    }, 0)
  }
}

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver

describe('LazyImage Component', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image'
  }

beforeEach(() => {
  global.Image = MockImage
  mockIntersectionObserver.mockClear()
})

afterAll(() => {
  global.Image = originalImage
})

  it('renders with required props', () => {
    render(<LazyImage {...defaultProps} />)

    const image = screen.getByAltText('Test image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('alt', 'Test image')
  })

  it('applies custom className', () => {
    const customClass = 'custom-image-class'
    render(<LazyImage {...defaultProps} className={customClass} />)

    const image = screen.getByAltText('Test image')
    expect(image).toHaveClass(customClass)
  })

  it('sets width and height attributes', () => {
    render(<LazyImage {...defaultProps} width={300} height={200} />)

    const image = screen.getByAltText('Test image')
    expect(image).toHaveAttribute('width', '300')
    expect(image).toHaveAttribute('height', '200')
  })

  it('handles priority loading', () => {
    render(<LazyImage {...defaultProps} priority />)

    const image = screen.getByAltText('Test image')
    expect(image).toHaveAttribute('loading', 'eager')
  })

  it('proxies priority Notion images', () => {
    const src =
      'https://www.notion.so/image/example.png?table=block&id=test&width=1080'

    render(<LazyImage src={src} alt='Notion image' priority imageMaxWidth={800} />)

    const image = screen.getByAltText('Notion image')
    expect(image.getAttribute('src')).toContain('/api/image?url=')
    expect(decodeURIComponent(image.getAttribute('src'))).toContain('width=800')
  })

  it('uses lazy loading by default', () => {
    render(<LazyImage {...defaultProps} />)

    const image = screen.getByAltText('Test image')
    expect(image).toHaveAttribute('loading', 'lazy')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<LazyImage {...defaultProps} onClick={handleClick} />)

    const image = screen.getByAltText('Test image')
    image.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('sets up IntersectionObserver when not priority', () => {
    render(<LazyImage {...defaultProps} />)

    expect(mockIntersectionObserver).toHaveBeenCalled()
  })

  it('does not set up IntersectionObserver for priority images', () => {
    render(<LazyImage {...defaultProps} priority />)

    expect(mockIntersectionObserver).not.toHaveBeenCalled()
  })

  it('handles load event', () => {
    const handleLoad = jest.fn()
    render(<LazyImage {...defaultProps} onLoad={handleLoad} priority />)

    fireEvent.load(screen.getByAltText('Test image'))

    expect(handleLoad).toHaveBeenCalled()
  })

  it('handles error gracefully', () => {
    render(<LazyImage {...defaultProps} />)

    const image = screen.getByAltText('Test image')
    image.dispatchEvent(new Event('error'))

    expect(image).toBeInTheDocument()
  })

  it('applies correct decoding attribute', () => {
    render(<LazyImage {...defaultProps} />)

    const image = screen.getByAltText('Test image')
    expect(image).toHaveAttribute('decoding', 'async')
  })

  it('renders nothing when src is missing', () => {
    render(<LazyImage alt="Test image" />)

    expect(screen.queryByAltText('Test image')).not.toBeInTheDocument()
  })

  it('applies custom styles', () => {
    const customStyle = { border: '1px solid red' }
    render(<LazyImage {...defaultProps} style={customStyle} />)

    const image = screen.getByAltText('Test image')
    expect(image).toHaveStyle('border: 1px solid red')
  })
})
