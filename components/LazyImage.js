import { siteConfig } from '@/lib/config'
import { toImageProxyUrl } from '@/lib/utils/imageProxy'
import Head from 'next/head'
import { useRef } from 'react'

/**
 * 圖片載入元件
 * priority=true → eager + preload + 走 image proxy
 * priority=false → 瀏覽器原生 loading="lazy"，不再用自製 IntersectionObserver
 *   （舊版 IO 在 viewport 跳躍式滾動時會漏觸發，導致圖片永遠停在 placeholder）
 *
 * @param {Object} [props]
 * @param {boolean} [props.priority]
 * @param {string} [props.id]
 * @param {string} [props.src]
 * @param {string} [props.alt]
 * @param {string} [props.placeholderSrc]
 * @param {string} [props.className]
 * @param {number|string} [props.width]
 * @param {number|string} [props.height]
 * @param {number} [props.imageMaxWidth]
 * @param {string} [props.title]
 * @param {Function} [props.onLoad]
 * @param {Function} [props.onClick]
 * @param {Object} [props.style]
 */
export default function LazyImage({
  priority,
  id,
  src,
  alt,
  placeholderSrc,
  className,
  width,
  height,
  imageMaxWidth,
  title,
  onLoad,
  onClick,
  style
} = {}) {
  const maxWidth = imageMaxWidth || siteConfig('IMAGE_COMPRESS_WIDTH')
  const defaultPlaceholderSrc = siteConfig('IMG_LAZY_LOAD_PLACEHOLDER')
  const sizedSrc = resizeImageForViewport(src, maxWidth)
  // 所有 Notion 圖都走 /api/image proxy；非 Notion URL toImageProxyUrl 會原樣返回。
  // 原本只有 priority=true 走 proxy，導致非 priority（LOGO、第 3 篇之後封面）直接打
  // notion.so/image/... 被 Notion 的 hotlink 防護擋掉。
  const finalSrc = toImageProxyUrl(sizedSrc)
  const imageRef = useRef(null)

  const handleImageLoaded = () => {
    if (typeof onLoad === 'function') {
      onLoad()
    }
  }

  const handleImageError = () => {
    if (!imageRef.current) return
    if (placeholderSrc && imageRef.current.src !== placeholderSrc) {
      imageRef.current.src = placeholderSrc
    } else if (defaultPlaceholderSrc) {
      imageRef.current.src = defaultPlaceholderSrc
    }
  }

  if (!src) {
    return null
  }

  const imgProps = {
    ref: imageRef,
    src: finalSrc || defaultPlaceholderSrc,
    'data-src': src,
    alt: alt || 'Lazy loaded image',
    onLoad: handleImageLoaded,
    onError: handleImageError,
    className: className || '',
    style,
    width: width || 'auto',
    height: height || 'auto',
    onClick,
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    fetchpriority: priority ? 'high' : 'auto'
  }

  if (id) imgProps.id = id
  if (title) imgProps.title = title

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...imgProps} />
      {priority && finalSrc && (
        <Head>
          <link
            rel='preload'
            as='image'
            href={finalSrc}
            fetchpriority='high'
          />
        </Head>
      )}
    </>
  )
}

const resizeImageForViewport = (src, maxWidth) => {
  if (!src) {
    return null
  }

  const screenWidth = Math.min(
    (typeof window !== 'undefined' && window?.screen?.width) || maxWidth,
    maxWidth
  )

  try {
    const url = new URL(src)

    if (url.searchParams.has('width')) {
      url.searchParams.set('width', screenWidth)
      return url.toString()
    }

    if (url.searchParams.has('w')) {
      url.searchParams.set('w', screenWidth)
      return url.toString()
    }

    if (url.pathname.startsWith('/image/')) {
      url.searchParams.set('width', screenWidth)
      url.searchParams.set('cache', 'v2')
      return url.toString()
    }
  } catch (error) {
    return src
  }

  return src
}
