import SmartLink from '@/components/SmartLink'

const TagItemMini = ({ tag, selected = false }) => {
  return (
    <SmartLink
      key={tag}
      href={selected ? '/' : `/tag/${encodeURIComponent(tag.name)}`}
      passHref
      className={`tag-mini ${selected ? 'selected' : ''} notion-${tag.color}_background`}>
      <div className='font-light'>
        {selected && <i className='mr-1 fa-tag'/>} 
        {tag.name + (tag.count ? `(${tag.count})` : '')} 
      </div>
    </SmartLink>
  );
}

export default TagItemMini
