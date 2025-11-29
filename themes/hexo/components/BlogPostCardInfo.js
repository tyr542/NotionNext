// BlogPostCardInfo.js
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
  align = 'left' // 'left' | 'right'
}) => {
  const dateText = post?.publishDay || post.lastEditedDay
  const isRight = align === 'right'

  // 設定各個區塊的對齊 class
  const justifyClass = isRight ? 'justify-end' : 'justify-start'
  const alignClass = isRight ? 'items-end text-right' : 'items-start text-left'
  
  // 預覽模式通常強制置中，若非預覽則跟隨 align
  const metaJustify = showPreview ? 'justify-center' : justifyClass

  return (
    <article
      className={`flex flex-col h-full lg:p-6 p-4 ${
        showPageCover && !showPreview
          ? 'w-full md:max-h-60'
          : 'w-full'
      }`}
    >
      {/* 整個文字縱向區塊 */}
      <div className={`flex flex-col h-full w-full ${alignClass}`}>
        
        {/* 第一排：分類 + 日期 */}
        {(post?.category || dateText) && (
          <div
            className={`flex w-full items-center text-xs md:text-sm text-gray-400 dark:text-gray-500 ${metaJustify}`}
          >
            {post?.category && (
              <>
                <SmartLink
                  href={`/category/${post.category}`}
                  className='tracking-wide hover:underline'
                >
                  {post.category}
                </SmartLink>
                <span className='mx-2'>•</span>
              </>
            )}
            {dateText && (
              <span>{formatDateFmt(dateText, 'yyyy.MM.dd')}</span>
            )}
          </div>
        )}

        {/* 標題 */}
        <h2 className='mt-3 text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100'>
          <SmartLink href={post?.href}>
            <span className='transition-all group-hover:text-blue-600 dark:group-hover:text-blue-400'>
              {post?.title}
            </span>
          </SmartLink>
        </h2>

        {/* 摘要或預覽內容 */}
        {showPreview && post?.blockMap ? (
          <div className='mt-3 w-full'>
            <NotionPage post={post} />
          </div>
        ) : (
          showSummary &&
          post?.summary && (
            <p className='mt-3 text-sm md:text-base text-gray-600 dark:text-gray-300 line-clamp-3'>
              {post.summary}
            </p>
          )
        )}

        {/* Tag 列：重點修改，讓 Tag 也可以跟著靠左或靠右 */}
        {post.tagItems?.length > 0 && (
          <div className={`mt-3 flex flex-wrap gap-2 w-full ${justifyClass}`}>
            {post.tagItems.map(tag => (
              <TagItemMini key={tag.name} tag={tag} />
            ))}
          </div>
        )}

        {/* 底部：留言數 + 閱讀全文 */}
        <div
          className={`mt-4 flex w-full items-center gap-4 ${justifyClass}`}
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
            className='inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:underline'
          >
            閱讀全文
            <span className='ml-1'>↗</span>
          </SmartLink>
        </div>
      </div>
    </article>
  )
}
