import Card from './Card'

/**
 * 以 Google Analytics 4 Data API 取得真實 PV / UV，取代原本的不蒜子（Busuanzi）。
 * 數字由 SSG / ISR 階段的 fetchGlobalAllData() 透過 fetchSitePageviews() 注入 props。
 * sitePv / siteUv 為 null 時代表 GA 未設定或呼叫失敗，以 '—' 替代顯示。
 */
const formatNumber = (value) => {
  if (value === null || value === undefined) return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return n.toLocaleString('en-US')
}

export function AnalyticsCard (props) {
  const { postCount, sitePv, siteUv } = props
  return <Card>
    <div className='ml-2 mb-3 '>
      <i className='fas fa-chart-area' /> 统计
    </div>
    <div className='text-xs  font-light justify-center mx-7'>
      <div className='inline'>
        <div className='flex justify-between'>
          <div>文章数:</div>
          <div>{postCount}</div>
        </div>
      </div>
      <div className='ml-2'>
        <div className='flex justify-between'>
          <div>访问量:</div>
          <div>{formatNumber(sitePv)}</div>
        </div>
      </div>
      <div className='ml-2'>
        <div className='flex justify-between'>
          <div>访客数:</div>
          <div>{formatNumber(siteUv)}</div>
        </div>
      </div>
    </div>
  </Card>
}
