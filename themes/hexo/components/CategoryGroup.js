import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'

const CategoryGroup = ({ currentCategory, categories }) => {
  const { locale } = useGlobal()

  if (!categories) {
    return <></>
  }

  return (
    <div id='category-group-wrapper'>
      {/* 這裡保留卡片外框，為了配合標題的韓系風格 */}
      <section className="dark:text-gray-300 border dark:border-black rounded-xl lg:p-6 p-4 bg-white dark:bg-hexo-black-gray shadow-sm transition-shadow duration-300 hover:shadow-md">
        
        {/* 標題區：只改這裡 -> 放大字體、加寬字距、Icon 使用強調色 #8c7b75 */}
        <div className="text-gray-900 dark:text-white text-base tracking-[0.2em] font-medium mb-4 flex items-center">
          <i className='mr-2 fas fa-folder' style={{ color: '#8c7b75' }} />
          {locale.COMMON.CATEGORY}
        </div>

        {/* 內容區：完全還原你原本的代碼邏輯 (indigo 色、mx-4、w-full) */}
        <div id='category-list' className='dark:border-gray-600 flex flex-wrap mx-4'>
          {categories.map(category => {
            const selected = currentCategory === category.name
            return (
              <SmartLink
                key={category.name}
                href={`/category/${category.name}`}
                passHref
                className={(selected
                  ? 'hover:text-white dark:hover:text-white bg-indigo-600 text-white '
                  : 'dark:text-gray-400 text-gray-500 hover:text-white dark:hover:text-white hover:bg-indigo-600') +
                  ' text-sm w-full items-center duration-300 px-2 cursor-pointer py-1 font-light'}
              >
                <div>
                  <i className={`mr-2 fas ${selected ? 'fa-folder-open' : 'fa-folder'}`} />
                  {category.name}({category.count})
                </div>
              </SmartLink>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default CategoryGroup
