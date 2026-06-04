import LazyImage from '@/components/LazyImage'
import { useGlobal } from '@/lib/global'
// import Image from 'next/image'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'

/**
 * 最新文章列表
 * @param posts 所有文章数据
 * @param sliceCount 截取展示的数量 默认6
 * @constructor
 */
const LatestPostsGroup = ({ latestPosts, siteInfo }) => {
  // 获取当前路径
  const currentPath = useRouter().asPath
  const { locale } = useGlobal()
  const latestUpdatesLabel =
    locale?.COMMON?.LATEST_UPDATES ||
    locale?.COMMON?.LAST_EDITED_TIME ||
    'Latest updates'

  if (!latestPosts) {
    return <></>
  }

  return (
    <>
      <div className='latest-updates-heading mb-2 px-1 flex flex-nowrap justify-between'>
        <div className='latest-updates-heading-label'>
          <i className='latest-updates-heading-icon mr-2 fas fas fa-history' />
          {latestUpdatesLabel}
        </div>
        <div className='latest-updates-heading-divider' />
      </div>
      {latestPosts.map(post => {
        const headerImage = post?.pageCoverThumbnail
          ? post.pageCoverThumbnail
          : siteInfo?.pageCover
        const selected = currentPath === post?.href

        return (
          <SmartLink
            key={post.id}
            title={post.title}
            href={post?.href}
            passHref
            className={'latest-updates-item my-3 flex items-start'}>
            <div className='latest-updates-thumb w-20 h-14 overflow-hidden relative'>
              <LazyImage
                alt={post?.title}
                src={`${headerImage}`}
                className='object-cover w-full h-full'
              />
            </div>
            <div
              className={
                (selected ? ' text-indigo-400 ' : 'dark:text-gray-400 ') +
                ' latest-updates-body text-sm min-w-0 flex-1 overflow-hidden hover:text-indigo-600 duration-200 rounded ' +
                ' hover:text-indigo-400 cursor-pointer'
              }>
              <div className='latest-updates-copy'>
                {post.lastEditedDay && (
                  <div className='latest-updates-meta'>{post.lastEditedDay}</div>
                )}
                <div className='latest-updates-title break-words whitespace-normal leading-snug'>
                  {post.title}
                </div>
              </div>
            </div>
          </SmartLink>
        )
      })}
    </>
  )
}
export default LatestPostsGroup
