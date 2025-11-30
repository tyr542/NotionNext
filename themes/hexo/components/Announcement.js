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
          {/* 標題區：改為小字、寬字距、淡灰色，營造精緻感 */}
          <div className="text-gray-400 dark:text-gray-500 text-xs tracking-[0.2em] font-medium mb-4 flex items-center">
             {/* Icon 稍微縮小並調淡，減少視覺干擾 */}
            <i className='mr-2 fas fa-bullhorn text-sm opacity-60' />
            {locale.COMMON.ANNOUNCEMENT}
          </div>

          {post && (
            <div id="announcement-content">
              {/* 核心修改：移除 text-center，加入 text-justify (左右對齊) 或 text-left */}
              {/* leading-loose (行距鬆) / tracking-wide (字距寬) / text-gray-600 (字體不要全黑) */}
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
