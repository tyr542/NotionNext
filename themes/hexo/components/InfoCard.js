import { useRouter } from 'next/router'
import Card from './Card'
import SocialButton from './SocialButton'
import MenuGroupCard from './MenuGroupCard'
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'

/**
 * 社交資訊卡 (Hexo 主題側邊欄)
 * 風格：並排/雜誌專欄風格，頭像與名字並排。
 * @param {*} props
 * @returns
 */
export function InfoCard(props) {
  const { className, siteInfo } = props
  const router = useRouter()
  
  // 假設你新增了 'PROFESSION' 和 'SLOGAN' 到 blog.config.js，這裡先用硬編碼作為 Vibe 示範
  const profession = 'PHOTOGRAPHER / INTP'
  const slogan = '"Vibe Coding" 實踐者，相信直覺跟邏輯並不衝突。'

  return (
    <Card className={className}>
      {/* 【修改點 1】 頂部容器改為 flex-row 並垂直置中 (items-center) */}
      <div 
        className='flex items-center py-8 px-6 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800'
      >
        
        {/* 1. 頭像區塊：點擊回首頁 */}
        <div
          className='transform duration-200 cursor-pointer flex-shrink-0' // flex-shrink-0 確保頭像不被擠壓
          onClick={() => {
            router.push('/')
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <LazyImage 
            src={siteInfo?.icon} 
            className='rounded-full hover:scale-105 transition-transform duration-300' 
            width={72} // 頭像縮小一點點，讓並排效果更好
            alt={siteConfig('AUTHOR')} 
          />
        </div>

        {/* 2. 標題與標語區塊：放在頭像右邊 */}
        <div className='font-serif ml-4 flex flex-col justify-center text-left'>
          {/* 名字：老大 Boss */}
          <div className='text-xl md:text-2xl font-bold leading-tight'>{siteConfig('AUTHOR')}</div>
          {/* 職業/角色標語，使用較細的字體與灰色，增加設計感 */}
          <div className='text-xs font-light text-gray-500 tracking-wider uppercase mt-1'>{profession}</div>
        </div>
      </div>

      {/* 3. BIO 簡介（核心文案） */}
      {/* 移除原本頭像區塊下的 border-b，這裡補上 */}
      <div className='text-sm text-left px-6 py-6 leading-relaxed mb-4 text-gray-700 dark:text-gray-300'>
        {/* 主要 BIO 描述 */}
        <p className='mb-4'>{siteConfig('BIO')}</p>
        
        {/* Vibe Slogan / 理念 */}
        <p className='italic text-xs text-gray-500 dark:text-gray-400 border-t pt-4 mt-4 border-gray-100 dark:border-gray-800'>{slogan}</p>
      </div>
      
      {/* 4. 計數區塊 (MenuGroupCard) */}
      {/* 給它一個 border-t 讓它跟 BIO 區塊分隔開 */}
      <div className='border-t border-gray-100 dark:border-gray-800 pt-4'>
        <MenuGroupCard {...props} /> 
      </div>
      
      {/* 5. 社交連結按鈕 */}
      <div className='border-t border-gray-100 dark:border-gray-800 pt-4 px-6 pb-6'>
        <SocialButton />
      </div>
      
    </Card>
  )
}
