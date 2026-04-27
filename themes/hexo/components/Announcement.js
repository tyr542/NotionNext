import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import dynamic from 'next/dynamic'

const NotionPage = dynamic(() => import('@/components/NotionPage'))

const Announcement = ({ post, className }) => {
  const { locale } = useGlobal()
  if (!post) {
    return <></>
  }

  if (post?.blockMap) {
    return (
      <div className={className}>
        <section
          id='announcement-wrapper'
          className='sidebar-card'
        >
          <div className='sidebar-title'>
            <i className='fas fa-bullhorn' />
            {locale.COMMON.ANNOUNCEMENT}
          </div>

          {post && (
            <div id='announcement-content'>
              <NotionPage 
                post={post} 
                className='text-left leading-8 tracking-wide text-gray-600 dark:text-gray-300' 
              />
            </div>
          )}
        </section>
      </div>
    )
  }

  if (!post?.title && !post?.summary) {
    return <></>
  }

  return (
    <div className={className}>
      <section
        id='announcement-wrapper'
        className='sidebar-card'
      >
        <div className='sidebar-title'>
          <i className='fas fa-bullhorn' />
          {locale.COMMON.ANNOUNCEMENT}
        </div>

        <div
          id='announcement-content'
          className='text-left leading-7 tracking-wide text-gray-600 dark:text-gray-300'
        >
          {post?.title &&
            (post?.href ? (
              <SmartLink
                href={post.href}
                className='font-medium text-gray-800 hover:underline dark:text-gray-100'
              >
                {post.title}
              </SmartLink>
            ) : (
              <div className='font-medium text-gray-800 dark:text-gray-100'>
                {post.title}
              </div>
            ))}

          {post?.summary && (
            <p className='mt-2 text-sm line-clamp-4'>{post.summary}</p>
          )}
        </div>
      </section>
    </div>
  )
}
export default Announcement
