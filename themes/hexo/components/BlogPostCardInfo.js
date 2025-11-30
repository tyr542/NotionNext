import NotionIcon from '@/components/NotionIcon'
import NotionPage from '@/components/NotionPage'
import TwikooCommentCount from '@/components/TwikooCommentCount'
import { siteConfig } from '@/lib/config'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import TagItemMini from './TagItemMini'
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

  // 對齊邏輯：電腦版(md)根據 align 決定，手機版一律靠左
  const justifyClass = isRight
    ? 'justify-start md:justify-end'
    : 'justify-start'

  const alignClass = isRight
    ? 'text-left items-start md:text-right md:items-end'
    : 'text-left items-start'

  return (
    <article className='flex flex-col h-full w-full p-4 md:p-8 relative overflow-hidden'> 
      
      {/* 內容垂直置中 */}
      <div className={`flex flex-col justify-center h-full w-full ${alignClass}`}>
        
        {/* 日期與分類 */}
        {(post?.category || dateText) && (
          <div className={`flex w-full items-center mb-3 text-xs font-medium tracking-wider text-gray-400 dark:text-gray-500 ${justifyClass}`}>
            {post?.category && (
              <>
                <SmartLink href={`/category/${post.category}`} className='hover:text-blue-500 uppercase transition-colors'>
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

        {/* 標題 */}
        <h2 className='text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 leading-tight mb-3 line-clamp-1 md:line-clamp-2'>
          <SmartLink href={post?.href}>
            <span className='hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>
              {post?.title}
            </span>
          </SmartLink>
        </h2>

        {/* 內文預覽區塊 (取代摘要) */}
        {/* 使用 NotionPage 渲染真實 Block，並限制高度 */}
        <div className={`w-full flex-grow relative overflow-hidden text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 opacity-90 ${isRight ? 'md:text-right' : 'md:text-left'}`}>
           {post?.blockMap ? (
             <div className='max-h-[80px] overflow-hidden pointer-events-none'>
               <NotionPage post={post} />
             </div>
           ) : (
             <p className='line-clamp-3'>{post.summary}</p>
           )}
           {/* 底部漸層遮罩，讓文字看起來是自然淡出 */}
           {/* <div className='absolute bottom-0 w-full h-8 bg-gradient-to-t from-white/80 to-transparent dark:from-black/80'></div> */}
        </div>
        
        {/* 底部資訊列：Tag 與 閱讀全文 */}
        <div className={`flex w-full items-center gap-4 mt-auto ${justifyClass}`}> 
           {/* 如果圖在右邊(文字靠右)，我們把 Tag 放左邊，閱讀全文放右邊? 還是全部跟隨對齊? */}
           {/* 為了整齊，這裡全部跟隨 justifyClass 對齊 */}
           
           {/* 如果是靠右對齊，Tag 在前(左)，閱讀全文在後(右)會有點怪，通常閱讀全文要在最外側 */}
           {/* 我們利用 flex-row 和 order 來控制 */}

           <div className={`flex items-center gap-4 ${isRight ? 'flex-row' : 'flex-row'}`}>
              
              {/* Tag 區塊 */}
              {!isRight && post.tagItems?.length > 0 && (
                 <div className='flex gap-2'>
                   {post.tagItems.map(tag => <TagItemMini key={tag.name} tag={tag} />)}
                 </div>
              )}

              <SmartLink
                href={post?.href}
                className='group inline-flex items-center text-sm font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
              >
                閱讀全文
                <span className='ml-1 transform group-hover:translate-x-1 transition-transform'>→</span>
              </SmartLink>

              {/* Tag 區塊 (靠右對齊時放在左側) */}
              {isRight && post.tagItems?.length > 0 && (
                 <div className='flex gap-2'>
                   {post.tagItems.map(tag => <TagItemMini key={tag.name} tag={tag} />)}
                 </div>
              )}
           </div>
        </div>

      </div>
    </article>
  )
}
