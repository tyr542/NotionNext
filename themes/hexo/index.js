import replaceSearchResult from '@/components/Mark'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isBrowser } from '@/lib/utils'
import { Transition } from '@headlessui/react'
import dynamic from 'next/dynamic'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import BlogPostArchive from './components/BlogPostArchive'
import BlogPostListPage from './components/BlogPostListPage'
import BlogPostListScroll from './components/BlogPostListScroll'
import ButtonJumpToComment from './components/ButtonJumpToComment'
import ButtonRandomPostMini from './components/ButtonRandomPostMini'
import Card from './components/Card'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import PostHero from './components/PostHero'
import RightFloatArea from './components/RightFloatArea'
import SearchNav from './components/SearchNav'
import SideRight from './components/SideRight'
import SlotBar from './components/SlotBar'
import CONFIG from './config'
import { Style } from './style'

const ArticleAdjacent = dynamic(() => import('./components/ArticleAdjacent'))
const ArticleCopyright = dynamic(() => import('./components/ArticleCopyright'))
const ArticleLock = dynamic(() =>
  import('./components/ArticleLock').then(m => m.ArticleLock)
)
const ArticleRecommend = dynamic(() => import('./components/ArticleRecommend'))
const AlgoliaSearchModal = dynamic(
  () => import('@/components/AlgoliaSearchModal'),
  { ssr: false }
)
const Comment = dynamic(() => import('@/components/Comment'), { ssr: false })
const NotionPage = dynamic(() => import('@/components/NotionPage'))
const RewardCard = dynamic(() => import('./components/RewardCard'))
const ShareBar = dynamic(() => import('@/components/ShareBar'), { ssr: false })
const TocDrawer = dynamic(() => import('./components/TocDrawer'), { ssr: false })
const TocDrawerButton = dynamic(() => import('./components/TocDrawerButton'))

// 主题全局状态
const ThemeGlobalHexo = createContext()
export const useHexoGlobal = () => useContext(ThemeGlobalHexo)

/**
 * 基础布局 采用左右两侧布局，移动端使用顶部导航栏
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const LayoutBase = props => {
  const { post, children, slotTop, className } = props
  const { onLoading, fullWidth } = useGlobal()
  const router = useRouter()
  const showRandomButton = siteConfig('HEXO_MENU_RANDOM', false, CONFIG)

  const headerSlot = router.route === '/' &&
    siteConfig('HEXO_HOME_BANNER_ENABLE', null, CONFIG) ? (
    <Hero {...props} />
  ) : null

  const drawerRight = useRef(null)
  const tocRef = isBrowser ? document.getElementById('article-wrapper') : null

  // 悬浮按钮内容
  const floatSlot = (
    <>
      {post?.toc?.length > 1 && (
        <div className='block lg:hidden'>
          <TocDrawerButton
            onClick={() => {
              drawerRight?.current?.handleSwitchVisible()
            }}
          />
        </div>
      )}
      {post && <ButtonJumpToComment />}
      {showRandomButton && <ButtonRandomPostMini {...props} />}
    </>
  )

  // Algolia搜索框
  const searchModal = useRef(null)

  return (
    <ThemeGlobalHexo.Provider value={{ searchModal }}>
      <div
        id='theme-hexo'
        className={`${siteConfig('FONT_STYLE')} dark:bg-black scroll-smooth`}>
        <Style />

        {/* 顶部导航 */}
        <Header {...props} />

        {/* 顶部嵌入 */}
        <Transition
          show={!onLoading}
          appear={true}
          enter='transition ease-in-out duration-700 transform order-first'
          enterFrom='opacity-0 -translate-y-16'
          enterTo='opacity-100'
          leave='transition ease-in-out duration-300 transform'
          leaveFrom='opacity-100'
          leaveTo='opacity-0 translate-y-16'
          unmount={false}>
          {headerSlot}
        </Transition>

        {/* 主区块 */}
        <main
          id='wrapper'
          className={`${siteConfig('HEXO_HOME_BANNER_ENABLE', null, CONFIG) ? '' : 'pt-16'} bg-hexo-background-gray dark:bg-black w-full py-8 md:px-8 lg:px-24 min-h-screen relative`}>
          <div
            id='container-inner'
            className={
              (JSON.parse(siteConfig('LAYOUT_SIDEBAR_REVERSE'))
                ? 'flex-row-reverse'
                : '') +
              ' w-full mx-auto lg:flex lg:space-x-4 justify-center relative z-10'
            }>
            <div
              className={`${className || ''} w-full ${fullWidth ? '' : 'max-w-4xl'} h-full overflow-hidden`}>
              <Transition
                show={!onLoading}
                appear={true}
                enter='transition ease-out duration-150 transform order-first'
                enterFrom='opacity-0 translate-y-4'
                enterTo='opacity-100'
                leave='transition ease-in-out duration-300 transform'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 -translate-y-16'
                unmount={false}>
                {/* 主区上部嵌入 */}
                {slotTop}

                {children}
              </Transition>
            </div>

            {/* 右侧栏 */}
            <SideRight {...props} />
          </div>
        </main>

        <div className='block lg:hidden'>
          <TocDrawer post={post} cRef={drawerRight} targetRef={tocRef} />
        </div>

        {/* 悬浮菜单 */}
        <RightFloatArea floatSlot={floatSlot} />

        {/* 全文搜索 */}
        <AlgoliaSearchModal cRef={searchModal} {...props} />

        {/* 页脚 */}
        <Footer title={siteConfig('TITLE')} sitePv={props?.sitePv} siteUv={props?.siteUv} />
      </div>
    </ThemeGlobalHexo.Provider>
  )
}

/**
 * 首页
 * 是一个博客列表，嵌入一个Hero大图
 * @param {*} props
 * @returns
 */
const LayoutIndex = props => {
  return <LayoutPostList {...props} className='pt-8' />
}

/**
 * 博客列表
 * @param {*} props
 * @returns
 */
const LayoutPostList = props => {
  return (
    <div className='pt-8'>
      <SlotBar {...props} />
      {siteConfig('POST_LIST_STYLE') === 'page' ? (
        <BlogPostListPage {...props} />
      ) : (
        <BlogPostListScroll {...props} />
      )}
    </div>
  )
}

/**
 * 搜索
 * @param {*} props
 * @returns
 */
const LayoutSearch = props => {
  const { keyword } = props
  const router = useRouter()
  const currentSearch = keyword || router?.query?.s

  useEffect(() => {
    if (currentSearch) {
      replaceSearchResult({
        doms: document.getElementsByClassName('replace'),
        search: keyword,
        target: {
          element: 'span',
          className: 'text-red-500 border-b border-dashed'
        }
      })
    }
  })

  return (
    <div className='pt-8'>
      <SearchNav {...props} />
      {currentSearch && (
        <div id='posts-wrapper' className='mt-2'>
          {siteConfig('POST_LIST_STYLE') === 'page' ? (
            <BlogPostListPage {...props} />
          ) : (
            <BlogPostListScroll {...props} />
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 歸檔
 * @param {*} props
 * @returns
 */
const LayoutArchive = props => {
  const { archivePosts } = props
  const { locale } = useGlobal()
  return (
    <div className='pt-8'>
      <Card className='w-full'>
        <div className='section-heading mb-2'>
          <div className='section-heading-label'>
            <i className='section-heading-icon mr-2 fas fa-archive' />
            {locale.NAV.ARCHIVE || '文章封存'}
          </div>
          <div className='section-heading-divider' />
        </div>
        <div className='md:px-8 px-1 pb-12'>
          {Object.keys(archivePosts).map(archiveTitle => (
            <BlogPostArchive
              key={archiveTitle}
              posts={archivePosts[archiveTitle]}
              archiveTitle={archiveTitle}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}

/**
 * 文章詳情
 * @param {*} props
 * @returns
 */
const LayoutSlug = props => {
  const { post, lock, validPassword } = props
  const router = useRouter()
  const waiting404 = siteConfig('POST_WAITING_TIME_FOR_404') * 1000
  useEffect(() => {
    // 404
    if (!post) {
      setTimeout(
        () => {
          if (isBrowser) {
            const article = document.querySelector('#article-wrapper #notion-article')
            if (!article) {
              router.push('/404').then(() => {
                console.warn('找不到頁面', router.asPath)
              })
            }
          }
        },
        waiting404
      )
    }
  }, [post])
  return (
    <>
      {/* 最終微調：使用自定義像素值 [34px]，完美齊頭對齊 */}
      <div className='w-full lg:mt-[34px] lg:hover:shadow lg:border rounded-t-xl lg:rounded-xl lg:px-2 lg:py-4 bg-white dark:bg-hexo-black-gray dark:border-black article'>
        {lock && <ArticleLock validPassword={validPassword} />}

        {!lock && post && (
          <div className='overflow-x-auto flex-grow mx-auto md:w-full md:px-5 '>
            <article
              id='article-wrapper'
              itemScope
              itemType='https://schema.org/Movie'
              className='subpixel-antialiased overflow-y-hidden'>

              {/* PostHero 在這裡 */}
              <PostHero {...props} />

              {/* Notion文章主体 */}
              <section className='px-5 justify-center mx-auto max-w-2xl lg:max-w-full'>
                {post && <NotionPage post={post} />}
              </section>

              {/* 分享 */}
              <ShareBar post={post} />
              {post?.type === 'Post' && (
                <>
                  <ArticleCopyright {...props} />
                  <RewardCard />
                  <ArticleRecommend {...props} />
                  <ArticleAdjacent {...props} />
                </>
              )}
            </article>

            <div className='pt-4 border-dashed'></div>

            {/* 評論互動 */}
            <div className='duration-200 overflow-x-auto bg-white dark:bg-hexo-black-gray px-3'>
              <Comment frontMatter={post} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

/**
 * 404
 * @param {*} props
 * @returns
 */
const Layout404 = props => {
  const router = useRouter()
  const { locale } = useGlobal()
  useEffect(() => {
    // 延時3秒如果加載失敗就返回首頁
    setTimeout(() => {
      if (isBrowser) {
        const article = document.querySelector('#article-wrapper #notion-article')
        if (!article) {
          router.push('/').then(() => {
            // console.log('找不到頁面', router.asPath)
          })
        }
      }
    }, 3000)
  })
  return (
    <>
      <div className='text-black w-full h-screen text-center justify-center content-center items-center flex flex-col'>
        <div className='dark:text-gray-200'>
          <h2 className='inline-block border-r-2 border-gray-600 mr-2 px-3 py-2 align-top'>
            404
          </h2>
          <div className='inline-block text-left h-32 leading-10 items-center'>
            <h2 className='m-0 p-0'>{locale.COMMON.NOT_FOUND}</h2>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * 分類列表
 * @param {*} props
 * @returns
 */
const LayoutCategoryIndex = props => {
  const { categoryOptions, allNavPages } = props
  const { locale } = useGlobal()
  const [expandedCategory, setExpandedCategory] = useState(null)

  const toggleCategory = name => {
    setExpandedCategory(prev => (prev === name ? null : name))
  }

  return (
    <div className='mt-8'>
      <Card className='w-full'>
        <div className='section-heading mb-4'>
          <div className='section-heading-label'>
            <i className='section-heading-icon mr-2 fas fa-th' />
            {locale.COMMON.CATEGORY}
          </div>
          <div className='section-heading-divider' />
        </div>
        <div className='space-y-3 px-1'>
          {categoryOptions?.map(category => {
            const isExpanded = expandedCategory === category.name
            const posts = isExpanded
              ? (allNavPages || [])
                  .filter(p => p.category === category.name)
                  .sort((a, b) =>
                    new Date(b.lastEditedDate || 0) - new Date(a.lastEditedDate || 0)
                  )
                  .slice(0, 5)
              : []

            return (
              <div key={category.name}>
                <div
                  onClick={() => toggleCategory(category.name)}
                  className={`category-card${isExpanded ? ' category-card-expanded' : ''}`}>
                  <div className='category-card-icon'>
                    <i className={`fas ${isExpanded ? 'fa-folder-open' : 'fa-folder'}`} />
                  </div>
                  <span className='category-card-name'>{category.name}</span>
                  <span className='category-card-count'>{category.count} 篇</span>
                  <i className={`fas fa-chevron-right category-card-arrow${isExpanded ? ' category-card-arrow-open' : ''}`} />
                </div>
                {isExpanded && posts.length > 0 && (
                  <div className='category-card-posts'>
                    {posts.map(post => (
                      <SmartLink key={post.id} href={post.href} className='category-card-post'>
                        <span className='category-card-post-date'>
                          {(post.lastEditedDate || '').slice(0, 10).replace(/-/g, '.')}
                        </span>
                        <span className='category-card-post-title'>{post.title}</span>
                      </SmartLink>
                    ))}
                    <SmartLink
                      href={`/category/${category.name}`}
                      className='category-card-viewall'>
                      查看全部 →
                    </SmartLink>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

/**
 * 標籤列表
 * @param {*} props
 * @returns
 */
const LayoutTagIndex = props => {
  const { tagOptions } = props
  const { locale } = useGlobal()
  const sorted = [...tagOptions].sort((a, b) => b.count - a.count)
  const len = sorted.length
  const t1 = Math.max(1, Math.ceil(len * 0.08))
  const t2 = Math.max(t1, Math.ceil(len * 0.2))
  const t3 = Math.max(t2, Math.ceil(len * 0.4))
  const t4 = Math.max(t3, Math.ceil(len * 0.65))

  return (
    <div className='mt-8'>
      <Card className='w-full'>
        <div className='section-heading mb-4'>
          <div className='section-heading-label'>
            <i className='section-heading-icon mr-2 fas fa-tag' />
            {locale.COMMON.TAGS}
          </div>
          <div className='section-heading-divider' />
        </div>
        <div className='tag-pill-grid'>
          {sorted.map((tag, i) => {
            const tier = i < t1 ? 'tag-pill-t1' : i < t2 ? 'tag-pill-t2' : i < t3 ? 'tag-pill-t3' : i < t4 ? 'tag-pill-t4' : ''
            return (
              <SmartLink
                key={tag.name}
                href={`/tag/${encodeURIComponent(tag.name)}`}
                className={`tag-pill ${tier}`}>
                {tag.name} ({tag.count})
              </SmartLink>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

export {
  Layout404,
  LayoutArchive,
  LayoutBase,
  LayoutCategoryIndex,
  LayoutIndex,
  LayoutPostList,
  LayoutSearch,
  LayoutSlug,
  LayoutTagIndex,
  CONFIG as THEME_CONFIG
}
