import LazyImage from '@/components/LazyImage'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'

/**
 * 文章內頁的 Hero 區塊 (標題 + 封面圖)
 * 風格：卡片式設計 (資訊全部收納在白色框框內)
 * 功能：新增「回到列表」、限制圖片高度、解決導航遮擋
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
    <div id='post-hero' className='w-full mb-6 animate-fade-in'>
      
      {/* 白色卡片容器：將所有資訊包在裡面 */}
      <div className='bg-white dark:bg-[#18171d] p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col'>
        
        {/* 1. 回到列表按鈕 */}
        <div className='w-full flex justify-start mb-6'>
          <button 
            onClick={() => router.push('/')}
            className='group flex items-center text-sm font-bold text-gray-400 hover:text-[#8c7b75] transition-colors gap-1'
          >
            <span className='group-hover:-translate-x-1 transition-transform duration-200'>←</span>
            回到列表
          </button>
        </div>

        {/* 2. Meta 資訊：分類與日期 */}
        <div className='flex flex-wrap items-center gap-3 text-sm font-bold tracking-widest mb-4'>
           {/* 日期放前面或後面都可以，這裡參考圖二放前面 */}
           <span className='text-gray-400 font-sans'>
            {post?.publishDay ? formatDateFmt(post.publishDay, 'yyyy.MM.dd') : post.lastEditedDay}
           </span>
           
           {post?.category && (
            <>
            <span className='text-gray-300'>•</span>
            {/* 分類使用你的強調色 #8c7b75 */}
            <SmartLink href={`/category/${post.category}`} className='text-[#8c7b75] hover:underline transition-colors'>
                {post.category}
            </SmartLink>
            </>
           )}
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
                  px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700
                  bg-gray-50 dark:bg-gray-800
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

        {/* 5. 封面大圖：限制高度，圓角處理 */}
        {headerImage && (
          <div className='w-full relative rounded-2xl overflow-hidden shadow-sm group'>
             {/* 1. w-full: 寬度填滿卡片
                2. aspect-video: 保持 16:9 比例 (如果不想要固定比例，可以拿掉)
                3. max-h-[450px]: 強制限制最大高度，避免圖片太長
             */}
             <div className='relative w-full max-h-[450px] overflow-hidden'>
                <LazyImage
                  src={headerImage}
                  alt={post.title}
                  className='w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]' 
                  priority={true} 
                />
             </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default PostHero
