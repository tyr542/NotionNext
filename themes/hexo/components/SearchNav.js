import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import { useEffect, useRef } from 'react'
import Card from './Card'
import SearchInput from './SearchInput'
import TagItemMini from './TagItemMini'

/**
 * 搜索页面的导航
 * @param {*} props
 * @returns
 */
export default function SearchNav(props) {
  const { tagOptions, categoryOptions } = props
  const cRef = useRef(null)
  const { locale } = useGlobal()
  useEffect(() => {
    // 自动聚焦到搜索框
    cRef?.current?.focus()
  }, [])

  return <>
    <div className='my-6 px-2'>
        <SearchInput cRef={cRef} {...props} />
        {/* 分类 */}
        <Card className='w-full mt-4'>
            <div className='section-title mb-5 mx-3'>
                <i className='fas fa-th' />
                {locale.COMMON.CATEGORY}:
            </div>
            <div id='category-list' className='flex flex-wrap mx-8'>
                {categoryOptions?.map(category => {
                  return (
                      <SmartLink
                          key={category.name}
                          href={`/category/${category.name}`}
                          passHref
                          legacyBehavior>
                          <div className='category-item rounded-lg px-5 py-2'>
                              <i className='mr-4 fas fa-folder' />
                              {category.name}({category.count})
                          </div>
                      </SmartLink>
                  )
                })}
            </div>
        </Card>
        {/* 标签 */}
        <Card className='w-full mt-4'>
            <div className='section-title mb-5 ml-4'>
                <i className='fas fa-tag' />
                {locale.COMMON.TAGS}:
            </div>
            <div id='tags-list' className='flex flex-wrap ml-8'>
                {tagOptions?.map(tag => {
                  return (
                        <div key={tag.name} className='p-2'>
                            <TagItemMini key={tag.name} tag={tag} />
                        </div>
                  )
                })}
            </div>
        </Card>
    </div>
</>
}
