import NotionIcon from '@/components/NotionIcon'
import NotionPage from '@/components/NotionPage'
import TwikooCommentCount from '@/components/TwikooCommentCount'
import { siteConfig } from '@/lib/config'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import TagItemMini from './TagItemMini'

/**
 * 博客列表的文字内容
 * @param {*} param0
 * @returns
 */
export const BlogPostCardInfo = ({
  post,
  showPreview,
  showPageCover,
  showSummary
}) => {
  
  const dateText = post?.publishDay || post.lastEditedDay
  
  return (
    <article
      className={`flex flex-col justify-between lg:p-6 p-4  ${showPageCover && !showPreview ? 'md:w-7/12 w-full md:max-h-60' : 'w-full'}`}>
      <div>
        <header className={showPreview ? 'text-center' : ''}>
  {/* 第一排：分類 + 日期 */}
  <div
    className={`flex items-center text-xs md:text-sm text-gray-400 ${
      showPreview ? 'justify-center' : 'justify-start'
    }`}
  >
    {post?.category && (
      <>
        <span className='tracking-wide'>{post.category}</span>
        <span className='mx-2'>•</span>
      </>
    )}
    <span>{dateText}</span>
  </div>

  {/* 第二排：標題 */}
  <h2 className='mt-2'>
    <SmartLink
      href={post?.href}
      passHref
      className='line-clamp-2 replace cursor-pointer text-2xl leading-tight font-normal text-gray-600 dark:text-gray-100 hover:text-indigo-700 dark:hover:text-indigo-400'
    >
      {siteConfig('POST_TITLE_ICON') && (
        <NotionIcon icon={post.pageIcon} />
      )}
      <span className='menu-link'>{post.title}</span>
    </SmartLink>
  </h2>
</header>

        {/* 摘要 */}
        {(!showPreview || showSummary) && !post.results && (
          <main className='line-clamp-2 replace my-3 text-gray-700  dark:text-gray-300 text-sm font-light leading-7'>
            {post.summary}
          </main>
        )}

        {/* 搜索结果 */}
        {post.results && (
          <p className='line-clamp-2 mt-4 text-gray-700 dark:text-gray-300 text-sm font-light leading-7'>
            {post.results.map((r, index) => (
              <span key={index}>{r}</span>
            ))}
          </p>
        )}

        {/* 预览 */}
        {showPreview && (
          <div className='overflow-ellipsis truncate'>
            <NotionPage post={post} />
          </div>
        )}
      </div>

            <div>
        {/* 第四排：閱讀全文 */}
        <SmartLink
          href={post?.href}
          passHref
          className='inline-flex items-center mt-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-700 dark:hover:text-indigo-400'
        >
          閱讀全文
          <span className='ml-1'>→</span>
        </SmartLink>
      </div>
    </article>
  )
}
