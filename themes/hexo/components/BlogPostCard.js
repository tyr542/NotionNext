import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import { BlogPostCardInfo } from './BlogPostCardInfo'

const BlogPostCard = ({ index, post, showSummary, siteInfo }) => {
  // 強制開啟預覽模式
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
          /* --- Vibe Coding 修改重點 --- */
          /* 舊設定: md:h-[280px] -> 會鎖死高度導致爆框 */
          /* 新設定: md:min-h-[280px] md:h-auto -> 設低消，但也允許無線暢飲 */
          md:min-h-[280px] 
          md:h-auto
          /* -------------------------- */
          ${isReversed ? 'md:flex-row-reverse' : ''}
        `}
      >
        {/* 文字欄位 */}
        <div className='w-full md:w-7/12 flex flex-col justify-center py-6 px-4 md:px-8'> 
          {/* 加入 py-6 確保文字爆多時，上下還有呼吸空間 */}
          <BlogPostCardInfo
            index={index}
            post={post}
            showPageCover={showPageCover}
            showPreview={showPreview}
            showSummary={showSummary}
            align={isReversed ? 'left' : 'right'}
          />
        </div>

        {/* 圖片欄位 */}
        {showPageCover && (
          <div className='w-full md:w-5/12 h-48 md:h-auto overflow-hidden relative'>
             {/* 圖片容器改為 h-auto 配合 items-stretch 自動跟隨文字區高度 */}
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
