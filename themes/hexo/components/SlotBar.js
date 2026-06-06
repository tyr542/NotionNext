import SmartLink from '@/components/SmartLink'

export default function SlotBar(props) {
  const { tag, category } = props

  if (tag) {
    return (
      <div className='px-2 mb-4'>
        <SmartLink href={`/tag/${encodeURIComponent(tag)}`} className='slot-bar-link'>
          <div className='section-heading'>
            <div className='section-heading-label'>
              <i className='section-heading-icon mr-2 fas fa-tag' />
              {tag}
            </div>
            <div className='section-heading-divider' />
          </div>
        </SmartLink>
      </div>
    )
  } else if (category) {
    return (
      <div className='px-2 mb-4'>
        <SmartLink href={`/category/${category}`} className='slot-bar-link'>
          <div className='section-heading'>
            <div className='section-heading-label'>
              <i className='section-heading-icon mr-2 fas fa-folder-open' />
              {category}
            </div>
            <div className='section-heading-divider' />
          </div>
        </SmartLink>
      </div>
    )
  }
  return <></>
}
