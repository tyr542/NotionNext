const Card = ({ children, headerSlot, className }) => {
  return <div className={className}>
    <>{headerSlot}</>
    <section className='sidebar-card'>
        {children}
    </section>
  </div>
}
export default Card
