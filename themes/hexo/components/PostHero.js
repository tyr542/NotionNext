import LazyImage from '@/components/LazyImage'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import WordCount from '@/components/WordCount' // 【新增】引入原生字數統計組件

/**
 * 文章內頁的 Hero 區塊 (原生組件版)
 * 修改點：
 * 1. 移除負邊距 (-mt)，修復「回到列表」被遮擋的問題
 * 2. 使用 <WordCount /> 原生組件顯示字數與時間
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

  return (
    // 【修改點 1】 移除了 md:-mt-4，改回正常的無邊距，確保內容不被切掉
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

          {/* 【修改點 2】 使用原生 WordCount 組件 */}
          <span className='text-gray-300'>/</span>
          <WordCount wordCount={post.wordCount} readTime={post.readingTime} />
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
