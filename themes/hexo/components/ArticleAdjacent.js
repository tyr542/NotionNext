import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import { siteConfig } from '@/lib/config'

/**
 * 上一篇，下一篇文章
 * @param {prev,next} param0
 * @returns
 */
export default function ArticleAdjacent ({ prev, next }) {
  if (!prev || !next || !siteConfig('HEXO_ARTICLE_ADJACENT', null, CONFIG)) {
    return <></>
  }
  return (
    <section className='grid gap-4 pt-8 text-gray-800 md:grid-cols-2'>
      <SmartLink
        href={`/${prev.slug}`}
        passHref
        className='group flex min-h-[88px] w-full items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-colors duration-200 hover:border-gray-300 dark:border-gray-700 dark:bg-transparent dark:text-white dark:hover:border-gray-500'>
        <i className='fas fa-angle-left text-xs text-gray-400 transition-colors duration-200 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300' />
        <div className='min-w-0 flex-1'>
          <div className='mb-1 text-xs tracking-wide text-gray-400 dark:text-gray-500'>
            上一篇
          </div>
          <div className='line-clamp-2 text-sm leading-6 text-gray-700 transition-colors duration-200 group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-white'>
            {prev.title}
          </div>
        </div>
      </SmartLink>
      <SmartLink
        href={`/${next.slug}`}
        passHref
        className='group flex min-h-[88px] w-full items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-right transition-colors duration-200 hover:border-gray-300 dark:border-gray-700 dark:bg-transparent dark:text-white dark:hover:border-gray-500'>
        <div className='min-w-0 flex-1'>
          <div className='mb-1 text-xs tracking-wide text-gray-400 dark:text-gray-500'>
            下一篇
          </div>
          <div className='line-clamp-2 text-sm leading-6 text-gray-700 transition-colors duration-200 group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-white'>
            {next.title}
          </div>
        </div>
        <i className='fas fa-angle-right text-xs text-gray-400 transition-colors duration-200 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300' />
      </SmartLink>
    </section>
  )
}
