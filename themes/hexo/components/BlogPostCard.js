import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import { BlogPostCardInfo } from './BlogPostCardInfo'

const BlogPostCard = ({ index, post, showSummary, siteInfo }) => {
  // 強制開啟預覽模式 (為了顯示內文而非摘要)
  // 如果你覺得內文載入太慢，可以把這裡改回 siteConfig 的設定
  const showPreview = post.blockMap
  
  // 封面圖邏輯
  if (
    post &&
    !post.pageCoverThumbnail &&
    siteConfig('HEXO_POST_LIST_COVER_DEFAULT', null, CONFIG)
  ) {
    post.pageCoverThumbnail = siteInfo?.pageCover
  }

  const showPageCover =
    siteConfig('HEXO_POST_LIST_COVER', null, CONFIG) &&
    post?.pageCoverThumbnail

  const crossoverEnabled = siteConfig('HEXO_POST_LIST_IMG_CROSSOVER', null, CONFIG)
  const isReversed = crossoverEnabled && index % 2 === 1

  return (
    <div
      className={`${siteConfig('HEXO_POST_LIST_ANIMATION', null, CONFIG) ? 'animate-on-scroll' : ''}`}
    >
      <div
        key={post.id}
        data-aos='fade-up'
        data-aos-easing='ease-in-out'
        data-aos-duration='500'
        data-aos-once='false'
        data-aos-anchor-placement='top-bottom'
        id='blog-post-card'
        className={`group
          w-[96%]              
          md:max-w-[900px]     
          mx-auto              
          flex
          md:flex-row          
          flex-col-reverse     
          items-stretch        
          overflow-hidden
          rounded-xl           
          bg-white/40
          dark:bg-black/40
          shadow-sm            
          backdrop-blur-md
          border border-white/20
          transition-all duration-300
          hover:shadow-lg
          mb-8                 
          md:h-[280px]         /* 稍微增加高度給內文空間 */
          ${isReversed ? 'md:flex-row-reverse' : ''}
        `}
      >
        {/* 文字欄位 */}
        <div className='w-full md:w-7/12 flex flex-col justify-center'>
          <BlogPostCardInfo
            index={index}
            post={post}
            showPageCover={showPageCover}
            showPreview={showPreview} // 傳入 true 以顯示內文
            showSummary={showSummary}
            // 修正對齊邏輯：圖在左(Reversed)則文靠左，圖在右則文靠右
            align={isReversed ? 'left' : 'right'}
          />
        </div>

        {/* 圖片欄位 */}
        {showPageCover && (
          <div className='w-full md:w-5/12 h-48 md:h-full overflow-hidden relative'>
            <SmartLink href={post?.href} className='block h-full w-full'>
                 <LazyImage
                  priority={index === 1}
                  alt={post?.title}
                  src={post?.pageCoverThumbnail}
                  className='h-full w-full object-cover object-center group-hover:scale-105 duration-500 transition-transform'
                />
            </SmartLink>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogPostCard
