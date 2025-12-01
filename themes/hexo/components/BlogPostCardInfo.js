import NotionIcon from '@/components/NotionIcon'
import NotionPage from '@/components/NotionPage'
import TwikooCommentCount from '@/components/TwikooCommentCount'
import { siteConfig } from '@/lib/config'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'

/**
 * 博客列表的文字内容
 */
export const BlogPostCardInfo = ({
  post,
  showPreview,
  showPageCover,
  showSummary,
  align = 'left'
}) => {
  const dateText = post?.publishDay || post.lastEditedDay
  const isRight = align === 'right'

  // 對齊邏輯
  const justifyClass = isRight
    ? 'justify-start md:justify-end'
    : 'justify-start'

  const alignClass = isRight
    ? 'text-left items-start md:text-right md:items-end'
    : 'text-left items-start'

  return (
    <article className='flex flex-col h-full w-full p-4 md:p-8 relative overflow-hidden'> 
      
      {/* 內容垂直置中區塊 */}
      <div className={`flex flex-col justify-center h-full w-full ${alignClass}`}>
        
        {/* 1. 分類與日期 */}
        {(post?.category || dateText) && (
          <div className={`flex w-full items-center mb-3 text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 ${justifyClass}`}>
            {post?.category && (
              <>
                <SmartLink 
                  href={`/category/${post.category}`} 
                  className='hover:text-[#8c7b75] uppercase transition-colors' // 強調色 #8c7b75
                >
                  {post.category}
                </SmartLink>
                <span className='mx-2'>•</span>
              </>
            )}
            {dateText && (
              <span className='tabular-nums font-sans'>{formatDateFmt(dateText, 'yyyy.MM.dd')}</span>
            )}
          </div>
        )}

        {/* 標題 - 已調整縮小字級 (text-base md:text-lg) 並增加行高 (leading-normal) */}
        <h2 className='text-base md:text-lg font-bold text-gray-800 dark:text-gray-100 leading-normal mb-3 line-clamp-1 md:line-clamp-2'>
          <SmartLink href={post?.href}>
            <span className='hover:text-[#8c7b75] dark:hover:text-[#8c7b75] transition-colors'> {/* 強調色 #8c7b75 */}
              {post?.title}
            </span>
          </SmartLink>
        </h2>

        {/* 3. 內文預覽區塊：整合原始摘要邏輯 */}
        <div className={`w-full flex-grow relative overflow-hidden text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 opacity-90 ${isRight ? 'md:text-right' : 'md:text-left'}`}>
              
             {/* 情況 1: 預覽模式 (顯示 Notion 內文) */}
             {showPreview && post?.blockMap && (
               <div className='max-h-[80px] overflow-hidden pointer-events-none'>
                 <NotionPage post={post} />
               </div>
             )}

             {/* 情況 2: 摘要模式 (復刻原始邏輯：非預覽 或 強制顯示摘要 時) */}
             {(!showPreview || showSummary) && !post.results && (
               <p className='line-clamp-3'>{post.summary}</p>
             )}
             
        </div>
        
        {/* 2. Tag 區塊：灰色背景 -> Hover 變強調色 #8c7b75 */}
        {post.tagItems?.length > 0 && (
            <div className={`mb-4 w-full flex items-center overflow-hidden ${justifyClass}`}>
              <div className='flex flex-nowrap gap-2 overflow-x-hidden text-ellipsis whitespace-nowrap'>
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
            </div>
        )}

        {/* 底部資訊列：閱讀全文 */}
        <div className={`flex w-full items-center ${justifyClass} mt-auto`}> 
           <SmartLink
             href={post?.href}
             className='group inline-flex items-center text-sm font-bold text-gray-800 dark:text-white hover:text-[#8c7b75] dark:hover:text-[#8c7b75] transition-colors'
           >
             閱讀全文
             <span className='ml-1 transform group-hover:translate-x-1 transition-transform'>→</span>
           </SmartLink>
        </div>

      </div>
    </article>
  )
}
