import { useRouter } from 'next/router'
import Card from './Card'
import SocialButton from './SocialButton'
import MenuGroupCard from './MenuGroupCard'
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'

/**
 * 社交資訊卡 (Hexo 主題側邊欄)
 * 風格：攝影師 / 雜誌專欄風格，優化 BIO 顯示。
 * @param {*} props
 * @returns
 */
export function InfoCard(props) {
  const { className, siteInfo } = props
  const router = useRouter()
  
  // 假設你新增了 'PROFESSION' 和 'SLOGAN' 到 blog.config.js，這裡先用硬編碼作為 Vibe 示範
  // 為了讓代碼更整潔，建議將這兩個變數定義在 blog.config.js 中
  const profession = 'PHOTOGRAPHER / INTP'
  const slogan = '"Vibe Coding" 實踐者，相信直覺跟邏輯並不衝突。'

  return (
    <Card className={className}>
      <div className='flex flex-col items-center py-8 dark:text-gray-100'>
        
        {/* 1. 頭像區塊：點擊回首頁 */}
        <div
          className='transform duration-200 cursor-pointer'
          onClick={() => {
            router.push('/')
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <LazyImage 
            src={siteInfo?.icon} 
            className='rounded-full hover:scale-105 transition-transform duration-300' 
            width={120} 
            alt={siteConfig('AUTHOR')} 
          />
        </div>

        {/* 2. 標題與標語 */}
        <div className='font-serif text-center mt-4'>
          <div className='text-3xl font-bold'>{siteConfig('AUTHOR')}</div>
          {/* 職業/角色標語，使用較細的字體與灰色，增加設計感 */}
          <div className='text-xs font-light text-gray-500 tracking-widest uppercase mt-1'>{profession}</div>
        </div>

      </div>

      {/* 3. BIO 簡介（核心文案） */}
      <div className='text-sm text-left px-6 leading-relaxed mb-4 text-gray-700 dark:text-gray-300'>
        {/* 主要 BIO 描述 */}
        <p className='mb-4'>{siteConfig('BIO')}</p>
        
        {/* Vibe Slogan / 理念 */}
        <p className='italic text-xs text-gray-500 dark:text-gray-400 border-t pt-4 mt-4 border-gray-100 dark:border-gray-800'>{slogan}</p>
      </div>
      
      {/* 4. 計數區塊 (MenuGroupCard) - 恢復！ */}
      <MenuGroupCard {...props} /> 
      
      {/* 5. 社交連結按鈕 */}
      <div className='border-t border-gray-100 dark:border-gray-800 pt-4 px-6'>
        <SocialButton />
      </div>
      
    </Card>
  )
}
