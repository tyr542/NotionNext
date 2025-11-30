import LazyImage from '@/components/LazyImage'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'

/**
 * 文章內頁的 Hero 區塊 (終極完美版)
 * 修改點：
 * 1. 齊頭對齊微調
 * 2. Meta 資訊擴充：[分類] / [發佈] / [更新]
 * 3. 新增閱讀時間估算
 */
const PostHero = ({ post, siteInfo }) => {
  const { fullWidth } = useGlobal()
  const router = useRouter()

  if (!post) {
    return <></>
  }

  // 如果 Notion 設定為全寬頁面，則不顯示 Hero
  if (fullWidth) {
    return <div className='my-8' />
  }

  // 取得封面圖 URL
  const headerImage = post?.pageCover ? post.pageCover : siteInfo?.pageCover

  // 計算發佈與更新日期是否相同
  const datePublished = post?.publishDay
  const dateLastEdited = post?.lastEditedDay
  const showLastEdited = dateLastEdited && dateLastEdited !== datePublished

  // 估算閱讀時間 (假設 NotionNext 後端沒算，我們前端簡單算一下)
  // 如果 post.readingTime 存在就用它，不然就用字數/400
  const readingTime = post?.readingTime || Math.ceil((post?.summary?.length || 0) * 2 / 400) + ' 分鐘' 
  // 註：這只是粗略估計，因為拿不到完整純文字內容，通常 NotionNext 會在後端算好傳過來
  // 如果你的 post 物件裡沒有 readingTime，這裡可能需要依賴後端支援，或者你可以開啟 WORD_COUNT 開關

  return (
    <div id='post-hero' className='w-full mb-8 animate-fade-in px-5 md:px-0'>
      
      {/* 1. 回到列表按鈕 */}
      {/* 保持無 margin-top，讓 index.js 的 lg:mt-4 控制齊頭 */}
      <div className='w-full flex justify-start mb-6'>
        <button 
          onClick={() => router.push('/')}
          className='group flex items-center text-sm font-bold text-gray-400 hover:text-[#8c7b75] transition-colors gap-1'
        >
          <span className='group-hover:-translate-x-1 transition-transform duration-200 text-lg'>←</span>
          回到列表
        </button>
      </div>

      {/* 2. Meta 資訊：[分類] / [發佈] / [更新] / [閱讀時間] */}
      <div className='flex flex-wrap items-center gap-3 text-sm font-bold tracking-widest mb-3 text-gray-400 leading-6'>
          
          {/* A. 分類 */}
          {post?.category && (
          <>
            {/* 分類使用你的強調色 #8c7b75 */}
            <SmartLink href={`/category/${post.category}`} className='text-[#8c7b75] hover:underline transition-colors'>
                {post.category}
            </SmartLink>
            <span className='text-gray-300'>/</span>
          </>
          )}

          {/* B. 發佈日期 */}
          <span className='font-sans whitespace-nowrap'>
            {formatDateFmt(datePublished, 'yyyy.MM.dd')} 發佈
          </span>

          {/* C. 更新日期 (如果有不同才顯示) */}
          {showLastEdited && (
            <>
              <span className='text-gray-300'>/</span>
              <span className='font-sans whitespace-nowrap'>
                {formatDateFmt(dateLastEdited, 'yyyy.MM.dd')} 更新
              </span>
            </>
          )}

          {/* D. 閱讀時間 (前面加一個小 icon) */}
          <span className='text-gray-300'>/</span>
          <span className='font-sans whitespace-nowrap flex items-center gap-1'>
            <i className='fas fa-clock text-xs opacity-70'></i> {/* FontAwesome Icon */}
            閱讀約 {readingTime}
          </span>
      </div>

      {/* 3. 文章標題 */}
      <h1 className='text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white leading-tight mb-6 text-left'>
        {post.title}
      </h1>

      {/* 4. Tags 標籤：背景加深為 bg-gray-200 */}
      {post.tagItems?.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-8'>
          {post.tagItems.map(tag => (
            <SmartLink
              key={tag.name}
              href={`/tag/${encodeURIComponent(tag.name)}`}
              className='
                px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700
                bg-gray-200 dark:bg-gray-800 
                text-xs font-bold text-gray-600 dark:text-gray-300
                transition-all duration-200
                hover:bg-[#8c7b75] dark:hover:bg-[#8c7b75]
                hover:text-white dark:hover:text-white
              '
            >
              #{tag.name}
            </SmartLink>
          ))}
        </div>
      )}

      {/* 5. 封面大圖 */}
      {headerImage && (
        <div className='w-full relative rounded-xl overflow-hidden shadow-sm bg-gray-50 dark:bg-gray-900 mt-4 border border-gray-100 dark:border-gray-800'>
            <div className='relative w-full max-h-[400px] overflow-hidden'>
              <LazyImage
                src={headerImage}
                alt={post.title}
                className='w-full h-auto object-cover object-center hover:scale-[1.01] transition-transform duration-700' 
                priority={true}
              />
            </div>
        </div>
      )}

      {/* 分隔線 */}
      <hr className='mt-8 border-gray-100 dark:border-gray-800' />
    </div>
  )
}

export default PostHero
