function isPrivateHostname(hostname) {
  const normalizedHostname = hostname.toLowerCase()

  if (
    normalizedHostname === 'localhost' ||
    normalizedHostname.endsWith('.localhost')
  ) {
    return true
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(normalizedHostname)) {
    const parts = normalizedHostname.split('.').map(Number)
    return (
      parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 169 && parts[1] === 254) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168)
    )
  }

  return false
}

export function isSafeAiSummaryEndpoint(aiSummaryAPI) {
  try {
    const endpoint = new URL(aiSummaryAPI)
    return endpoint.protocol === 'https:' && !isPrivateHostname(endpoint.hostname)
  } catch {
    return false
  }
}

/**
 * get Ai summary
 * @returns {Promise<string>}
 * @param aiSummaryAPI
 * @param aiSummaryKey
 * @param truncatedText
 */
export async function getAiSummary(aiSummaryAPI, aiSummaryKey, truncatedText) {
  try {
    if (!isSafeAiSummaryEndpoint(aiSummaryAPI)) {
      console.warn('[aiSummary] Unsafe AI summary endpoint skipped:', aiSummaryAPI)
      return null
    }

    console.log('请求文章摘要', truncatedText.slice(0, 100))
    const response = await fetch(aiSummaryAPI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: aiSummaryKey,
        content: truncatedText
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.summary
    } else {
      throw new Error('Response not ok')
    }
  } catch (error) {
    console.error('ChucklePostAI：请求失败', error)
    return null
  }
}


/**
 * 获取文章摘要
 * @param props
 * @param pageContentText
 * @returns {Promise<void>}
 */
export async function getPageAISummary(post, pageContentText) {
  const { getDataFromCache, setDataToCache } = await import(
    '@/lib/cache/cache_manager'
  )
  const { siteConfig } = await import('@/lib/config')

  const aiSummaryAPI = siteConfig('AI_SUMMARY_API')
  if (aiSummaryAPI) {
    const cacheKey = `ai_summary_${post.id}`
    let aiSummary = await getDataFromCache(cacheKey)
    if (aiSummary) {
      post.aiSummary = aiSummary
    } else {
      const aiSummaryKey = siteConfig('AI_SUMMARY_KEY')
      const aiSummaryCacheTime = siteConfig('AI_SUMMARY_CACHE_TIME')
      const wordLimit = siteConfig('AI_SUMMARY_WORD_LIMIT', '1000')
      let content = ''
      for (let heading of post.toc) {
        content += heading.text + ' '
      }
      content += pageContentText
      const combinedText = post.title + ' ' + content
      const truncatedText = combinedText.slice(0, wordLimit)
      aiSummary = await getAiSummary(aiSummaryAPI, aiSummaryKey, truncatedText)
      await setDataToCache(cacheKey, aiSummary, aiSummaryCacheTime)
      post.aiSummary = aiSummary
    }
  }
}
