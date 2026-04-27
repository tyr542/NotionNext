import BLOG from '@/blog.config'
import FileCache from './local_file_cache'
import MemoryCache from './memory_cache'
import RedisCache from './redis_cache'

// In-memory cache writes are only safe during build/export or non-prod runs.
const canWriteEphemeralCache =
  process.env.npm_lifecycle_event === 'build' ||
  process.env.npm_lifecycle_event === 'export' ||
  !BLOG['isProd']

const cacheEnabled = Boolean(BLOG.ENABLE_CACHE)
const canWritePersistentCache =
  Boolean(BLOG.REDIS_URL) ||
  (process.env.ENABLE_FILE_CACHE &&
    process.env.ENABLE_FILE_CACHE !== 'false')

/**
 * Read from cache first, otherwise fetch and store.
 * @param key
 * @param getDataFunction
 * @param getDataArgs
 * @returns {Promise<*|null>}
 */
export async function getOrSetDataWithCache(
  key,
  getDataFunction,
  ...getDataArgs
) {
  return getOrSetDataWithCustomCache(key, null, getDataFunction, ...getDataArgs)
}

/**
 * Same as getOrSetDataWithCache, but with a custom TTL.
 * @param key
 * @param customCacheTime
 * @param getDataFunction
 * @param getDataArgs
 * @returns {Promise<*|null>}
 */
export async function getOrSetDataWithCustomCache(
  key,
  customCacheTime,
  getDataFunction,
  ...getDataArgs
) {
  const dataFromCache = await getDataFromCache(key)
  if (dataFromCache) {
    return dataFromCache
  }

  const data = await getDataFunction(...getDataArgs)
  if (data) {
    await setDataToCache(key, data, customCacheTime)
  }

  return data || null
}

/**
 * Read cached data when caching is enabled.
 * @param {*} key
 * @returns
 */
export async function getDataFromCache(key, force) {
  if (cacheEnabled || force) {
    const dataFromCache = await getApi().getCache(key)
    if (!dataFromCache || JSON.stringify(dataFromCache) === '[]') {
      return null
    }
    return dataFromCache
  } else {
    return null
  }
}

/**
 * Write cache data only when the current backend is safe for the environment.
 * @param {*} key
 * @param {*} data
 * @param {*} customCacheTime
 * @returns
 */
export async function setDataToCache(key, data, customCacheTime) {
  if (
    !cacheEnabled ||
    (!canWriteEphemeralCache && !canWritePersistentCache) ||
    !data
  ) {
    return
  }

  await getApi().setCache(key, data, customCacheTime)
}

export async function delCacheData(key) {
  if (!cacheEnabled) {
    return
  }

  await getApi().delCache(key)
}

/**
 * Resolve the active cache backend.
 * @returns
 */
export function getApi() {
  if (BLOG.REDIS_URL) {
    return RedisCache
  } else if (process.env.ENABLE_FILE_CACHE) {
    return FileCache
  } else {
    return MemoryCache
  }
}
