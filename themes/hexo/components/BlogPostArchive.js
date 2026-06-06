import SmartLink from '@/components/SmartLink'

const BlogPostArchive = ({ posts = [], archiveTitle }) => {
  if (!posts || posts.length === 0) {
    return <></>
  }

  return (
    <div className='archive-year-group'>
      <div className='section-heading mt-10 mb-4' id={archiveTitle}>
        <div className='section-heading-label' style={{ fontSize: '1.4rem' }}>
          <i className='section-heading-icon mr-2 fas fa-calendar-alt' />
          {archiveTitle}
        </div>
        <div className='section-heading-divider' />
      </div>
      <ul className='archive-list'>
        {posts?.map(post => (
          <li key={post.id} className='archive-item'>
            <span className='archive-item-date'>{post.date?.start_date}</span>
            <SmartLink href={post?.href} className='archive-item-title'>
              {post.title}
            </SmartLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default BlogPostArchive
