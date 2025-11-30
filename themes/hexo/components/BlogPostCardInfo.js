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
  align = 'left' // 'left' | 'right' (僅影響電腦版)
}) => {
  const dateText = post?.publishDay || post.lastEditedDay
  
  // 邏輯核心：判斷是否靠右
  // 注意：這裡的邏輯是「電腦版 reversed 才靠右」，手機版永遠強制靠左
  const isRight = align === 'right'

  // 設定對齊 class：手機版預設 left/start，電腦版(md)才啟用 isRight 判斷
  const justifyClass = isRight 
    ? 'justify-start md:justify-end' 
    : 'justify-start'
    
  const alignClass = isRight 
    ? 'text-left items-start md:text-right md:items-end' 
    : 'text-left items-start'

  // 預覽模式通常強制置中，若非預覽則跟隨 align
  const metaJustify = showPreview ? 'justify-center' : justifyClass

  return (
    <article
      className={`flex flex-col h-full lg:p-8 p-6 ${
        showPageCover && !showPreview
          ? 'w-full'
          : 'w-full'
      }`}
    >
      {/* 整個文字縱向區塊 */}
      <div className={`flex flex-col justify-center h-full w-full ${alignClass}`}>
        
        {/* 第一排：分類 + 日期 */}
        {(post?.category || dateText) && (
          <div
            className={`flex w-full items-center mb-4 text-xs md:text-sm font-medium tracking-widest text-gray-400 dark:text-gray-500 ${metaJustify}`}
          >
            {post?.category && (
              <>
                <SmartLink
                  href={`/category/${post.category}`}
                  className='hover:text-blue-500 uppercase transition-colors'
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

        {/* 標題 */}
        <h2 className='text-xl md:text-3xl font-extrabold text-gray-800 dark:text-gray-100 leading-tight mb-4'>
          <SmartLink href={post?.href}>
            <span className='transition-all hover:text-blue-600 dark:hover:text-blue-400'>
              {post?.title}
            </span>
          </SmartLink>
        </h2>

        {/* 摘要或預覽內容 */}
        {showPreview && post?.blockMap ? (
          <div className='mt-2 w-full'>
            <NotionPage post={post} />
          </div>
        ) : (
          showSummary &&
          post?.summary && (
            <p className='text-sm md:text-base text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed opacity-80 mb-6'>
              {post.summary}
            </p>
          )
        )}

        {/* Tag 列：跟著文字方向對齊 */}
        {post.tagItems?.length > 0 && (
          <div className={`flex flex-wrap gap-2 w-full mb-6 ${justifyClass}`}>
            {post.tagItems.map(tag => (
              <TagItemMini key={tag.name} tag={tag} />
            ))}
          </div>
        )}

        {/* 底部：留言數 + 閱讀全文 */}
        <div
          className={`flex w-full items-center gap-4 ${justifyClass}`}
        >
          {siteConfig('BLOG_COMMENT', null, CONFIG) &&
            siteConfig('BLOG_COMMENT_TWIKOO_ENV_ID', null, CONFIG) && (
              <TwikooCommentCount
                post={post}
                className='text-xs text-gray-400 dark:text-gray-500'
              />
            )}

          <SmartLink
            href={post?.href}
            className='group inline-flex items-center text-sm font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
          >
            閱讀全文
            <span className='ml-1 transform group-hover:translate-x-1 transition-transform'>→</span>
          </SmartLink>
        </div>
      </div>
    </article>
  )
}
