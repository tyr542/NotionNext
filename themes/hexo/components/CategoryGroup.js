import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'

const CategoryGroup = ({ currentCategory, categories }) => {
  const { locale } = useGlobal()

  if (!categories) {
    return <></>
  }

  return (
    <div id='category-group-wrapper'>
      <section className='sidebar-card'>
        
        <div className='sidebar-title'>
          <i className='fas fa-folder' />
          {locale.COMMON.CATEGORY}
        </div>

        <div id='category-list' className='category-list'>
          {categories.map(category => {
            const selected = currentCategory === category.name
            return (
              <SmartLink
                key={category.name}
                href={`/category/${category.name}`}
                passHref
                className={`category-item${selected ? ' selected' : ''}`}
              >
                <div>
                  <i className={`fas ${selected ? 'fa-folder-open' : 'fa-folder'}`} />
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
