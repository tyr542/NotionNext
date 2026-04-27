/**
 * Runtime and deployment-oriented configuration.
 */
const parseBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()

    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true
    }

    if (['false', '0', 'no', 'off', ''].includes(normalized)) {
      return false
    }
  }

  return fallback
}

const isBuildLifecycle =
  process.env.npm_lifecycle_event === 'build' ||
  process.env.npm_lifecycle_event === 'export'

const isProd =
  process.env.VERCEL_ENV === 'production' ||
  process.env.NODE_ENV === 'production' ||
  parseBoolean(process.env.EXPORT)

const enableCache =
  process.env.ENABLE_CACHE !== undefined
    ? parseBoolean(process.env.ENABLE_CACHE)
    : isBuildLifecycle

module.exports = {
  SUB_PATH: '', // leave this empty unless you want to deploy in a folder
  DEBUG: process.env.NEXT_PUBLIC_DEBUG || false, // show debug controls
  // Tailwind custom background colors
  BACKGROUND_LIGHT: '#eeeeee', // use hex value, don't forget '#' e.g #fffefc
  BACKGROUND_DARK: '#000000', // use hex value, don't forget '#'

  // Redis cache endpoint
  REDIS_URL: process.env.REDIS_URL || '',

  ENABLE_CACHE: enableCache, // enabled by default only during build/export
  isProd, // works for Vercel, export mode, and self-hosted production
  BUNDLE_ANALYZER: process.env.ANALYZE === 'true' || false, // show bundle report
  VERSION: (() => {
    try {
      // Prefer the injected version, then fall back to package.json
      return (
        process.env.NEXT_PUBLIC_VERSION || require('../package.json').version
      )
    } catch (error) {
      console.warn('Failed to load package.json version:', error)
      return '1.0.0' // safe fallback
    }
  })()
}
