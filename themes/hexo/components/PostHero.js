import LazyImage from '@/components/LazyImage'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'

/**
 * 文章內頁的 Hero 區塊 (Boss 專屬客製版)
 * 修改點：
 * 1. 齊頭對齊：維持 -mt-4
 * 2. 閱讀時間 Hack V3：使用「目錄長度」來估算，這比隨機數更準確反映文章結構
 */
const PostHero = ({ post, siteInfo }) => {
  const { fullWidth } = useGlobal()
  const router = useRouter()

  if (!post) {
    return <></>
  }

  if (fullWidth) {
    return <div className='my-8' />
  }

  const headerImage = post?.pageCover ? post.pageCover : siteInfo?.pageCover
  const datePublished = post?.publishDay
  const dateLastEdited = post?.lastEditedDay
  const showLastEdited = dateLastEdited && dateLastEdited !== datePublished

  // --- 閱讀時間 Hack V3 (基於目錄結構) ---
  let readingTime = post?.readingTime

  if (!readingTime || readingTime === '0 分鐘' || readingTime === '1 分鐘') {
    const tocLength = post?.toc?.length || 0
    // 演算法：每個目錄標題算 1 分鐘，再加上基本分 1 分鐘
    // 如果沒有目錄 (短文)，就預設 2 分鐘
    // 如果目錄很多 (長文)，時間就會自動變長
    const estimatedMinutes = tocLength > 0 ? (tocLength * 1.5) + 1 : 2
    readingTime = Math.round(estimatedMinutes) + ' 分鐘'
  }

  return (
    // 【關鍵修改】： md:-mt-4 
    // 負邊距提拉，確保跟右邊齊頭
    <div id='post-hero' className='w-full mb-8 animate-fade-in px-5 md:px-0 md:-mt-4'>
      
      {/* 1. 回到列表按鈕 */}
      <div className='w-full flex justify-start mb-6'>
        <button 
          onClick={() => router.push('/')}
          className='group flex items-center text-sm font-bold text-gray-400 hover:text-[#8c7b75] transition-colors gap-1'
        >
          <span className='group-hover:-translate-x-1 transition-transform duration-200 text-lg'>←</span>
          回到列表
        </button>
      </div>

      {/* 2. Meta 資訊 */}
      <div className='flex flex-wrap items-center gap-3 text-sm font-bold tracking-widest mb-3 text-gray-400 leading-6'>
          
          {/* 分類 */}
          {post?.category && (
          <>
            <SmartLink href={`/category/${post.category}`} className='text-[#8c7b75] hover:underline transition-colors'>
                {post.category}
            </SmartLink>
            <span className='text-gray-300'>/</span>
          </>
          )}

          {/* 發佈日期 */}
          <span className='font-sans whitespace-nowrap'>
            {formatDateFmt(datePublished, 'yyyy.MM.dd')} 發佈
          </span>

          {/* 更新日期 */}
          {showLastEdited && (
            <>
              <span className='text-gray-300'>/</span>
              <span className='font-sans whitespace-nowrap'>
                {formatDateFmt(dateLastEdited, 'yyyy.MM.dd')} 更新
              </span>
            </>
          )}

          {/* 閱讀時間 */}
          <span className='text-gray-300'>/</span>
          <span className='font-sans whitespace-nowrap flex items-center gap-1'>
            <i className='fas fa-clock text-xs opacity-70'></i>
            閱讀約 {readingTime}
          </span>
      </div>

      {/* 3. 文章標題 */}
      <h1 className='text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white leading-tight mb-6 text-left'>
        {post.title}
      </h1>

      {/* 4. Tags 標籤 */}
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

      <hr className='mt-8 border-gray-100 dark:border-gray-800' />
    </div>
  )
}

export default PostHero
