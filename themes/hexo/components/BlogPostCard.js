// BlogPostCard.js
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
    <div>
      <div
        key={post.id}
        data-aos='fade-up'
        data-aos-easing='ease-in-out'
        data-aos-duration='500'
        data-aos-once='false'
        data-aos-anchor-placement='top-bottom'
        id='blog-post-card'
        className={`group
          w-full
          flex
          md:flex-row
          flex-col-reverse
          items-stretch
          overflow-hidden
          rounded-2xl
          bg-white/0
          dark:bg-hexo-black-gray/20
          shadow-md
          backdrop-blur-sm
          ${isReversed ? 'md:flex-row-reverse' : ''}
        `}
      >
        {/* 文字欄位 */}
        <div className='md:w-7/12 flex flex-col justify-center'> {/* 加上 flex-col justify-center 讓文字垂直置中更好看 */}
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
          <div className='md:w-5/12 h-64 md:h-auto overflow-hidden flex-shrink-0'>
            <SmartLink href={post?.href}>
              <LazyImage
                priority={index === 1}
                alt={post?.title}
                src={post?.pageCoverThumbnail}
                className='h-64 w-full rounded-xl object-cover object-center group-hover:scale-105 duration-500'
              />
            </SmartLink>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogPostCard
