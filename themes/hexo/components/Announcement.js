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
          className="dark:text-gray-300 border dark:border-black rounded-xl lg:p-6 p-4 bg-white dark:bg-hexo-black-gray shadow-sm transition-shadow duration-300 hover:shadow-md"
        >
          {/* 修正：字體放大 (text-base)，顏色改深 (text-gray-900)，保留寬字距 (tracking) 的高級感 */}
          <div className="text-gray-900 dark:text-white text-base tracking-[0.2em] font-medium mb-4 flex items-center">
             {/* 修正：Icon 移除透明度，並加上你的個人強調色 #8c7b75 */}
            <i className='mr-2 fas fa-bullhorn' style={{ color: '#8c7b75' }} />
            {locale.COMMON.ANNOUNCEMENT}
          </div>

          {post && (
            <div id="announcement-content">
              {/* 這裡保持你喜歡的排版：靠左、鬆散行距 */}
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
