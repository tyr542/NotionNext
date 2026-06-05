import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'

/**
 * 關聯推薦文章
 * @returns
 */
export default function ArticleRecommend({ recommendPosts, siteInfo }) {
  const { locale } = useGlobal()
  const visiblePosts = recommendPosts?.slice(0, 6) || []

  if (
    !siteConfig('HEXO_ARTICLE_RECOMMEND', null, CONFIG) ||
    visiblePosts.length === 0
  ) {
    return <></>
  }

  return (
    <div className='pt-8'>
      <div className='section-heading mb-2 flex flex-nowrap justify-between'>
        <div className='section-heading-label'>
          <i className='section-heading-icon mr-2 fas fa-thumbs-up' />
          {locale.COMMON.RELATE_POSTS}
        </div>
        <div className='section-heading-divider' />
      </div>
      <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
        {visiblePosts.map(post => {
          const headerImage = post?.pageCoverThumbnail || siteInfo?.pageCover

          return (
            <SmartLink
              key={post.id}
              title={post.title}
              href={post?.href}
              passHref
              className='flex h-40 cursor-pointer overflow-hidden rounded-xl'>
              <div className='relative h-full w-full group'>
                <div className='flex h-full w-full items-center justify-center duration-300'>
                  <div className='z-10 line-clamp-3 select-none px-4 text-center text-lg font-bold text-white shadow-text'>
                    {post.title}
                  </div>
                </div>
                <LazyImage
                  src={headerImage}
                  className='absolute top-0 h-full w-full object-cover object-center transform duration-200 group-hover:scale-110 group-hover:brightness-50'
                />
                <div className='absolute bottom-0 left-0 h-3/4 w-full'>
                  <div className='absolute h-full w-full bg-gradient-to-b from-transparent to-black opacity-80 transition-all duration-700 group-hover:opacity-100' />
                </div>
              </div>
            </SmartLink>
          )
        })}
      </div>
    </div>
  )
}
