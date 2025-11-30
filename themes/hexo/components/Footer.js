import PoweredBy from '@/components/PoweredBy'
import { siteConfig } from '@/lib/config'

const Footer = ({ title }) => {
  const d = new Date()
  const currentYear = d.getFullYear()
  const since = siteConfig('SINCE')
  const copyrightDate =
    parseInt(since) < currentYear ? since + '-' + currentYear : currentYear

  // 移除了 dark:bg-black 和 bg-hexo-light-gray，讓背景變為透明或繼承父層
  return (
    <footer 
      // 確保背景完全透明 (bg-transparent)
      className='relative z-10 flex-shrink-0 justify-center text-center m-auto w-full leading-6 text-gray-600 dark:text-gray-100 text-sm p-6 bg-transparent'
      // 新增：使用行內樣式 (style) 強制定義繁體中文字體堆棧，確保顯示正確且優美
      style={{ fontFamily: "'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif" }}
    >
      <i className='fas fa-copyright' /> {`${copyrightDate}`}
      <span>
        {/* 將心形 (fa-heart) 替換為平底鍋 (fa-skillet)。如果你的 Font Awesome 版本不支援 skillet，可能需要換成 fa-utensils (餐具) */}
        <i className='mx-1 animate-pulse fas fa-skillet' />
        <a
          href={siteConfig('LINK')}
          className='underline font-bold dark:text-gray-300 '>
          {siteConfig('AUTHOR')}
        </a>
        .<br />
        {/* 備案資訊已移除 */}
        <span className='hidden busuanzi_container_site_pv'>
          <i className='fas fa-eye' />
          <span className='px-1 busuanzi_value_site_pv'> </span>
        </span>
        <span className='pl-2 hidden busuanzi_container_site_uv'>
          <i className='fas fa-users' />
          <span className='px-1 busuanzi_value_site_uv'> </span>
        </span>
        {/* 調整長篇文字樣式：改用 p 標籤，並調整大小(text-sm)、行高(leading-relaxed)和上邊距(pt-2) */}
        <p className='text-sm leading-relaxed pt-2 text-light-400 dark:text-gray-400'>
          {title} {siteConfig('BIO') && <>|</>} {siteConfig('BIO')}
        </p>
        <PoweredBy className='justify-center' />
      </span>
      <br />
    </footer>
  )
}

export default Footer
