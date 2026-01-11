import LazyImage from '@/components/LazyImage'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import WordCount from '@/components/WordCount'
import { siteConfig } from '@/lib/config'

/**
 * 文章內頁的 Hero 區塊 (Final Fix)
 * 修改點：
 * 1. 閱讀時間：利用 post.wordCount 準確計算分鐘數 (除以400)，並只傳遞數字給 WordCount 組件
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

  // --- 閱讀時間修復邏輯 ---
  // 1. 取得字數 (可能是字串 "11865" 或 數字)
  const wordCountStr = post?.wordCount
  // 轉成數字，移除逗號
  const wordCountNum = typeof wordCountStr === 'string' ? parseInt(wordCountStr.replace(/,/g, '')) : wordCountStr

  // 2. 計算閱讀時間 (分鐘數)
  let readingTime = post?.readingTime
  
  // 如果後端沒給有效的時間，我們用字數算 (400字/分)
  // 並且只保留「數字」，因為 WordCount 組件會自己加 "分鐘"
  if (!readingTime || readingTime === '0 分鐘' || readingTime.startsWith('~')) {
    if (wordCountNum > 0) {
      readingTime = Math.ceil(wordCountNum / 400) // 得到 30
    } else {
      readingTime = 1 // 保底 1 分鐘
    }
  } else {
    // 如果後端給的是 "30 分鐘"，我們嘗試只取數字部分，以免 WordCount 重複顯示 "分鐘"
    // (看你的截圖 WordCount 似乎會強制加後綴，所以最好只傳數字)
    const match = readingTime.match(/\d+/)
    if (match) {
        readingTime = match[0]
    }
  }

  return (
    <div id='post-hero' className='w-full mb-8 animate-fade-in px-5 md:px-0'>
      
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
      </div>

      {/* 3. 文章標題 */}
      <h1 className='text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white leading-tight mb-6 text-left'>
        {post.title}
      </h1>

      {/* 4. Tags 標籤 */}
      {post.tagItems?.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-4'>
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

      {/* 5. 字數與閱讀時間 + Busuanzi 計數器 */}
      <div className='flex items-center gap-3 text-xs text-gray-400 mb-8'>
         {/* 傳入純數字的 readingTime */}
         <WordCount wordCount={wordCountStr} readTime={readingTime} />
         
         {/* Busuanzi 頁面訪問量 */}
         {siteConfig('ANALYTICS_BUSUANZI_ENABLE', null, false) && (
           <>
             <span className='text-gray-300'>•</span>
             <span className='busuanzi_container_page_pv whitespace-nowrap'>
               <i className='fas fa-eye' />
               <span className='ml-1 busuanzi_value_page_pv'></span>
             </span>
           </>
         )}
      </div>

      {/* 6. 封面大圖 */}
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
