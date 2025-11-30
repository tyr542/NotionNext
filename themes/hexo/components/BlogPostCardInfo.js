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

  const justifyClass = isRight
    ? 'justify-start md:justify-end'
    : 'justify-start'

  const alignClass = isRight
    ? 'text-left items-start md:text-right md:items-end'
    : 'text-left items-start'

  const metaJustify = showPreview ? 'justify-center' : justifyClass

  return (
    <article className='flex flex-col h-full w-full p-4 md:p-6'> {/* 縮減 padding */}
      
      {/* 內容垂直置中 */}
      <div className={`flex flex-col justify-center h-full w-full ${alignClass}`}>
        
        {/* 日期與分類 */}
        {(post?.category || dateText) && (
          <div className={`flex w-full items-center mb-2 text-xs font-medium tracking-wider text-gray-400 dark:text-gray-500 ${metaJustify}`}>
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

        {/* 摘要 (移除 showSummary 檢查，強制顯示) */}
        {!showPreview && post?.summary && (
            <p className='hidden md:block text-sm text-gray-600 dark:text-gray-400 line-clamp-2 md:line-clamp-3 leading-relaxed mb-4 opacity-90'>
              {post.summary}
            </p>
        )}
        
        {/* 預覽模式 (通常很少用，先留著) */}
        {showPreview && post?.blockMap && (
          <div className='mt-2 w-full'>
            <NotionPage post={post} />
          </div>
        )}

        {/* 底部資訊列：Tag 與 閱讀全文 */}
        <div className={`flex w-full items-center justify-between mt-auto`}> 
          {/* Tag 改到左邊或跟隨對齊? 這裡為了整齊，我們讓 Tag 跟閱讀全文分開兩邊，或者照你的需求跟隨對齊 */}
          {/* 為了視覺平衡，我建議 Tag 跟隨 alignClass，但這裡我們先用 flex-row 讓它們排在一起 */}
          
          <div className={`flex flex-wrap gap-2 ${justifyClass} w-full items-center`}>
             {post.tagItems?.length > 0 && post.tagItems.map(tag => (
                <TagItemMini key={tag.name} tag={tag} />
             ))}
             
             {/* 如果 Tag 很多，閱讀全文可能會被擠下去，所以用 flex-wrap */}
             {/* 這裡我們把閱讀全文放在最後 */}
             <div className='flex-grow'></div>

             <SmartLink
              href={post?.href}
              className='flex-shrink-0 inline-flex items-center text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-widest'
            >
              Read More
              <span className='ml-1'>→</span>
            </SmartLink>
          </div>
        </div>

      </div>
    </article>
  )
}
