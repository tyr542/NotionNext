import { useEffect, useState } from 'react'
import { isBrowser } from '@/lib/utils'

/**
 * 顶部页面阅读进度条
 * @returns {JSX.Element}
 * @constructor
 */
const Progress = ({ targetRef, showPercent = true }) => {
  const currentRef = targetRef?.current || targetRef
  const [percent, changePercent] = useState(0)
  const scrollListener = () => {
    const target = currentRef || (isBrowser && document.getElementById('article-wrapper'))
    if (target) {
      const clientHeight = target.clientHeight
      const scrollY = window.pageYOffset
      const fullHeight = clientHeight - window.outerHeight
      let per = parseFloat(((scrollY / fullHeight) * 100).toFixed(0))
      if (per > 100) per = 100
      if (per < 0) per = 0
      changePercent(per)
    }
  }

  useEffect(() => {
    document.addEventListener('scroll', scrollListener)
    return () => document.removeEventListener('scroll', scrollListener)
  }, [])

  return (
    <div className="h-5 w-full shadow-2xl bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-indigo-500 duration-200 rounded-full transition-all"
        style={{ width: `${percent}%` }}
      >
        {showPercent && (
          <div className="absolute right-2 top-0 bottom-0 flex items-center text-white text-xs">

{percent}%</div>
        )}
      </div>
    </div>
  )
}

export default Progress
