import LazyImage from '@/components/LazyImage'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import { useGlobal } from '@/lib/global'

/**
 * 文章內頁的 Hero 區塊 (標題 + 封面圖)
 * 風格：Medium / 雜誌風格 (白底黑字 + 完整大圖)
 * 適配：自動填滿左側內容區 (w-full)，不與右側 Sidebar 衝突
 */
const PostHero = ({ post, siteInfo }) => {
  const { fullWidth } = useGlobal()

  if (!post) {
    return <></>
  }

  // 如果 Notion 設定為全寬頁面，則不顯示 Hero，僅保留一點間距
  if (fullWidth) {
    return <div className='my-8' />
  }

  // 取得封面圖 URL
  const headerImage = post?.pageCover ? post.pageCover : siteInfo?.pageCover

  return (
    <div id='post-hero' className='w-full mb-12 animate-fade-in'>
      
      {/* 1. Meta 資訊：分類與日期 */}
      {/* 置中對齊，讓視覺聚焦 */}
      <div className='flex justify-center items-center gap-2 mb-6 text-sm font-bold tracking-widest mt-12'>
        {post?.category && (
            <>
            {/* 分類使用你的強調色 #8c7b75 */}
            <SmartLink href={`/category/${post.category}`} className='text-[#8c7b75] hover:underline transition-colors'>
                {post.category}
            </SmartLink>
            <span className='text-gray-300'>•</span>
            </>
        )}
        {/* 日期維持灰色 */}
        <span className='text-gray-400 font-sans'>
            {post?.publishDay ? formatDateFmt(post.publishDay, 'yyyy.MM.dd') : post.lastEditedDay}
        </span>
      </div>

      {/* 2. 文章標題：使用 Serif 襯線體，營造文學感 */}
      <h1 className='text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white text-center leading-tight mb-8 px-4'>
        {post.title}
      </h1>

      {/* 3. Tags 標籤：使用摩卡灰 Vibe (與首頁卡片一致) */}
      {post.tagItems?.length > 0 && (
        <div className='flex justify-center flex-wrap gap-2 mb-10'>
          {post.tagItems.map(tag => (
            <SmartLink
              key={tag.name}
              href={`/tag/${encodeURIComponent(tag.name)}`}
              className='
                px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700
                bg-gray-100 dark:bg-gray-800
                text-xs font-bold text-gray-700 dark:text-gray-300
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

      {/* 4. 封面大圖：無遮擋、高畫質 */}
      {/* 使用 w-full 確保填滿左側欄位 */}
      {headerImage && (
        <div className='w-full relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 group'>
           {/* 這裡移除 max-w 限制，讓它跟隨父容器(左側欄)的寬度 */}
           <div className='relative w-full h-auto'>
              <LazyImage
                src={headerImage}
                alt={post.title}
                className='w-full h-auto object-cover max-h-[80vh] transition-transform duration-700 group-hover:scale-[1.005]' 
                priority={true} 
              />
           </div>
        </div>
      )}
    </div>
  )
}

export default PostHero
