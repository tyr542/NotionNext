import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import { useEffect, useRef } from 'react'
import Card from './Card'
import SearchInput from './SearchInput'

export default function SearchNav(props) {
  const { tagOptions, categoryOptions } = props
  const cRef = useRef(null)
  const { locale } = useGlobal()
  useEffect(() => {
    cRef?.current?.focus()
  }, [])

  const sortedTags = tagOptions ? [...tagOptions].sort((a, b) => b.count - a.count) : []
  const len = sortedTags.length
  const t1 = Math.max(1, Math.ceil(len * 0.08))
  const t2 = Math.max(t1, Math.ceil(len * 0.2))
  const t3 = Math.max(t2, Math.ceil(len * 0.4))
  const t4 = Math.max(t3, Math.ceil(len * 0.65))

  return <>
    <div className='my-6 px-2'>
        <SearchInput cRef={cRef} {...props} />
        <Card className='w-full mt-4'>
            <div className='section-heading mb-4'>
                <div className='section-heading-label'>
                    <i className='section-heading-icon mr-2 fas fa-th' />
                    {locale.COMMON.CATEGORY}
                </div>
                <div className='section-heading-divider' />
            </div>
            <div className='space-y-2 px-1'>
                {categoryOptions?.map(category => (
                    <SmartLink
                        key={category.name}
                        href={`/category/${category.name}`}
                        className='category-card'>
                        <div className='category-card-icon'>
                            <i className='fas fa-folder' />
                        </div>
                        <span className='category-card-name'>{category.name}</span>
                        <span className='category-card-count'>{category.count} 篇</span>
                    </SmartLink>
                ))}
            </div>
        </Card>
        <Card className='w-full mt-4'>
            <div className='section-heading mb-4'>
                <div className='section-heading-label'>
                    <i className='section-heading-icon mr-2 fas fa-tag' />
                    {locale.COMMON.TAGS}
                </div>
                <div className='section-heading-divider' />
            </div>
            <div className='tag-pill-grid'>
                {sortedTags.map((tag, i) => {
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
  </>
}
