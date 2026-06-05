import { getFullTextContent } from './getPageContentText'

/**
 * FAQ Schema 自動化
 *
 * 從文章的 blockMap 自動偵測「常見問題」區塊，組成 schema.org FAQPage JSON-LD，
 * 供 SEO.js 注入 <head>，提升 GEO 引用率與 AI 摘要可被擷取性。
 *
 * 偵測規則（對齊使用者實際撰寫慣例，2026-06-05 從真實文章反推）：
 * - 進入 FAQ 區：標題（sub_header / H2）文字含「常見問題 / FAQ / 常見問答 / Q&A」
 * - 問題：FAQ 區內的 `header_4` block（react-notion-x 渲染成 notion-h4）
 * - 答案：問題之後、到下一個問題 / 分組標題 / 分隔線之前的所有內文塊（text / list / code / quote）
 * - 跳過：sub_sub_header（H3 分組標題，如「1. 認識這張證照」）、callout、divider、區前引言
 * - 結束 FAQ 區：遇到下一個 sub_header（H2）
 *
 * 問題編號（Q1、Q2…）在每個分組會重置，因此以「問題全文」為 key，不靠編號。
 */

// 觸發進入 FAQ 區的 H2 標題關鍵字
const FAQ_HEADING_KEYWORDS = [
  '常見問題',
  '常见问题',
  'FAQ',
  '常見問答',
  '常见问答',
  'Q&A',
  'Q & A'
]

// 問題使用的 block type（Notion header_4，非標準三級標題）
const QUESTION_TYPE = 'header_4'

// 視為答案內容的 block type
const ANSWER_TYPES = ['text', 'bulleted_list', 'numbered_list', 'code', 'quote']

// 出現即結束「當前問題」答案收集、但仍留在 FAQ 區的 block type
const ANSWER_BOUNDARY_TYPES = ['sub_sub_header', 'header', 'divider']

/**
 * 取得 block 標題列純文字
 * @param {object} blockValue Notion block 的 value
 * @returns {string}
 */
function getBlockTitle(blockValue) {
  return getFullTextContent(blockValue?.properties?.title).trim()
}

/**
 * 遞迴取得 block 及其子 block 的純文字（答案可能含巢狀清單）
 * @param {object} blockMap post.blockMap
 * @param {string} blockId
 * @returns {string}
 */
function getBlockTextDeep(blockMap, blockId) {
  const value = blockMap?.block?.[blockId]?.value
  if (!value) return ''
  let text = getBlockTitle(value)
  if (Array.isArray(value.content)) {
    for (const childId of value.content) {
      const childText = getBlockTextDeep(blockMap, childId)
      if (childText) text += (text ? '\n' : '') + childText
    }
  }
  return text
}

/**
 * 從 post 產生 FAQPage 結構化資料
 * @param {object} post 文章物件，需含 blockMap、id、content
 * @returns {object|null} FAQPage JSON-LD 物件，無 FAQ 則回 null
 */
export function extractFAQSchema(post) {
  const blockMap = post?.blockMap
  if (!blockMap?.block || !post?.id) return null

  const rootId = post.id
  const order =
    post.content || blockMap.block?.[rootId]?.value?.content || []
  if (!order.length) return null

  const questions = []
  let inFaq = false
  let current = null // { name, answerParts: [] }

  const flush = () => {
    if (current) {
      const answer = current.answerParts.join('\n').trim()
      if (current.name && answer) {
        questions.push({ name: current.name, answer })
      }
    }
    current = null
  }

  for (const blockId of order) {
    const value = blockMap.block?.[blockId]?.value
    if (!value) continue
    const type = value.type

    // FAQ 區起止由 H2（sub_header）控制
    if (type === 'sub_header') {
      const title = getBlockTitle(value)
      const isFaqHeading = FAQ_HEADING_KEYWORDS.some(keyword =>
        title.toLowerCase().includes(keyword.toLowerCase())
      )
      if (isFaqHeading) {
        flush()
        inFaq = true
        continue
      }
      if (inFaq) {
        // 下一個 H2 → FAQ 區結束
        flush()
        inFaq = false
        continue
      }
    }

    if (!inFaq) continue

    // 問題
    if (type === QUESTION_TYPE) {
      flush()
      const name = getBlockTitle(value)
        .replace(/^Q\s*\d+\s*[：:.、,)）]\s*/i, '') // 去除「Q1：」之類前綴
        .trim()
      current = { name, answerParts: [] }
      continue
    }

    // 分組標題 / 分隔線 → 收束當前問題，留在 FAQ 區
    if (ANSWER_BOUNDARY_TYPES.includes(type)) {
      flush()
      continue
    }

    // 答案內容
    if (current && ANSWER_TYPES.includes(type)) {
      const text = getBlockTextDeep(blockMap, blockId)
      if (text) current.answerParts.push(text)
    }
  }
  flush()

  if (!questions.length) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.name,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer
      }
    }))
  }
}

export default extractFAQSchema
