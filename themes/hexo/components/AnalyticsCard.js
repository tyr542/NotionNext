import Card from './Card'

/**
 * 側欄統計卡：只顯示文章數。2026-11-24 起拿掉 GA 瀏覽數（部署到 Cloudflare Workers 後 GA Data API 的 gRPC 跑不動）。
 */
export function AnalyticsCard (props) {
  const { postCount } = props
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
    </div>
  </Card>
}
