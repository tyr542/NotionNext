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
          w-[96%]              /* 手機版寬度 */
          md:max-w-[900px]     /* 電腦版最大寬度 (這裡控制胖瘦！) */
          mx-auto              /* 置中 */
          flex
          md:flex-row          /* 電腦版左右排 */
          flex-col-reverse     /* 手機版圖上文下 */
          items-stretch        /* 讓左右兩邊高度拉伸一致 */
          overflow-hidden
          rounded-xl           /* 圓角稍微小一點點，比較俐落 */
          bg-white/40
          dark:bg-black/40
          shadow-sm            /* 陰影改小一點，比較扁平 */
          backdrop-blur-md
          border border-white/20
          transition-all duration-300
          hover:shadow-lg
          mb-8                 /* 卡片之間的間距 */
          md:h-[260px]         /* 電腦版固定高度 (這裡控制高度！) */
          ${isReversed ? 'md:flex-row-reverse' : ''}
        `}
      >
        {/* 文字欄位 */}
        <div className='w-full md:w-7/12 flex flex-col justify-center'>
          <BlogPostCardInfo
            index={index}
            post={post}
            showPageCover={showPageCover}
            showPreview={showPreview}
            showSummary={showSummary}
            align={isReversed ? 'right' : 'left'}
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
