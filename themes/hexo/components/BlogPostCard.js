import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import { BlogPostCardInfo } from './BlogPostCardInfo'

const BlogPostCard = ({ index, post, showSummary, siteInfo }) => {
  const showPreview =
    siteConfig('HEXO_POST_LIST_PREVIEW', null, CONFIG) && post.blockMap

  if (
    post &&
    !post.pageCoverThumbnail &&
    siteConfig('HEXO_POST_LIST_COVER_DEFAULT', null, CONFIG)
  ) {
    post.pageCoverThumbnail = siteInfo?.pageCover
  }

  const showPageCover =
    siteConfig('HEXO_POST_LIST_COVER', null, CONFIG) &&
    post?.pageCoverThumbnail &&
    !showPreview

  const crossoverEnabled = siteConfig('HEXO_POST_LIST_IMG_CROSSOVER', null, CONFIG)
  // 判斷是否為偶數項目，用於左右交替排版
  const isReversed = crossoverEnabled && index % 2 === 1

  return (
    <div
      className={`w-full max-w-7xl mx-auto ${siteConfig('HEXO_POST_LIST_ANIMATION', null, CONFIG) ? 'animate-on-scroll' : ''}`}
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
          w-[96%] md:w-full mx-auto   /* 手機版內縮 96%，電腦版全寬 */
          flex
          md:flex-row                 /* 電腦版左右排 */
          flex-col-reverse            /* 手機版反轉：圖在上(DOM後)，文在下(DOM前) */
          items-center                /* 垂直置中 */
          overflow-hidden
          rounded-2xl
          bg-white/40                 /* 白天模式 40% 透明度 */
          dark:bg-black/40            /* 夜間模式 40% 透明度 */
          shadow-md
          backdrop-blur-md            /* 毛玻璃效果增強 */
          border border-white/20      /* 增加一點邊框質感 */
          transition-all duration-300
          hover:shadow-xl
          mb-6 md:mb-12               /* 增加卡片間距，讓呼吸感更強 */
          ${isReversed ? 'md:flex-row-reverse' : ''} /* 電腦版反轉控制 */
        `}
      >
        {/* 文字欄位 */}
        <div className='w-full md:w-7/12 flex flex-col justify-center p-2'>
          <BlogPostCardInfo
            index={index}
            post={post}
            showPageCover={showPageCover}
            showPreview={showPreview}
            showSummary={showSummary}
            align={isReversed ? 'right' : 'left'} // 將對齊邏輯傳入 Info
          />
        </div>

        {/* 圖片欄位 */}
        {showPageCover && (
          <div className='w-full md:w-5/12 h-64 md:h-full overflow-hidden flex-shrink-0 relative'>
            <SmartLink href={post?.href}>
              <div className='h-64 md:h-80 w-full relative overflow-hidden'>
                 <LazyImage
                  priority={index === 1}
                  alt={post?.title}
                  src={post?.pageCoverThumbnail}
                  className='h-full w-full object-cover object-center group-hover:scale-110 duration-700 transition-transform'
                />
                {/* 圖片遮罩，讓文字交界處更柔和 (可選) */}
                {/* <div className='absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300'></div> */}
              </div>
            </SmartLink>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogPostCard
