import { useGlobal } from '@/lib/global'
import dynamic from 'next/dynamic'

const NotionPage = dynamic(() => import('@/components/NotionPage'))

const Announcement = ({ post, className }) => {
  const { locale } = useGlobal()
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
  } else {
    return <></>
  }
}
export default Announcement
