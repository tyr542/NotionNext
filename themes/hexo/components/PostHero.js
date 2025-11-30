import LazyImage from '@/components/LazyImage'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'

/**
 * 文章內頁的 Hero 區塊 (緊湊收納版)
 * 風格：完全收納在白色卡片內，圖片縮小，不喧賓奪主
 * 修復：圖片高度限制、導覽列遮擋問題
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

  return (
    <div id='post-hero' className='w-full mb-4 animate-fade-in relative z-0'>
      
      {/* 白色卡片容器 */}
      {/* 移除過大的 Padding，改用適中的 p-8，讓資訊更集中 */}
      <div className='bg-white dark:bg-[#18171d] p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col'>
        
        {/* 1. 回到列表按鈕 (強化版) */}
        <div className='w-full flex justify-start mb-4'>
          <button 
            onClick={() => router.push('/')}
            className='group flex items-center text-sm font-bold text-gray-500 hover:text-[#8c7b75] transition-colors gap-2 px-3 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800'
          >
            <span className='group-hover:-translate-x-1 transition-transform duration-200 text-lg'>←</span>
            回到列表
          </button>
        </div>

        {/* 2. Meta 資訊：日期與分類 */}
        <div className='flex flex-wrap items-center gap-3 text-sm font-bold tracking-widest mb-3 text-gray-400'>
           <span className='font-sans'>
            {post?.publishDay ? formatDateFmt(post.publishDay, 'yyyy.MM.dd') : post.lastEditedDay}
           </span>
           
           {post?.category && (
            <>
            <span className='text-gray-300'>/</span>
            {/* 分類使用你的強調色 #8c7b75 */}
            <SmartLink href={`/category/${post.category}`} className='text-[#8c7b75] hover:underline transition-colors'>
                {post.category}
            </SmartLink>
            </>
           )}
        </div>

        {/* 3. 文章標題 */}
        <h1 className='text-2xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white leading-tight mb-4 text-left'>
          {post.title}
        </h1>

        {/* 4. Tags 標籤 */}
        {post.tagItems?.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-6'>
            {post.tagItems.map(tag => (
              <SmartLink
                key={tag.name}
                href={`/tag/${encodeURIComponent(tag.name)}`}
                className='
                  px-2 py-1 rounded-md 
                  bg-gray-100 dark:bg-gray-800
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

        {/* 5. 封面大圖：強力縮小版 */}
        {/* 這裡不再讓圖片貼著邊緣，而是給它圓角，並且限制高度為 300px (h-48 md:h-[300px]) */}
        {headerImage && (
          <div className='w-full relative rounded-xl overflow-hidden shadow-inner bg-gray-50 dark:bg-gray-900 mt-2'>
             <div className='relative w-full h-48 md:h-[280px] overflow-hidden'>
                <LazyImage
                  src={headerImage}
                  alt={post.title}
                  className='w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700' 
                  priority={true}
                  style={{ objectFit: 'cover' }} // 強制裁切填滿，不變形
                />
             </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default PostHero
