import { useRouter } from 'next/router'
import Card from './Card'
import SocialButton from './SocialButton'
import MenuGroupCard from './MenuGroupCard'
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'

/**
 * 社交資訊卡 (Hexo 主題側邊欄)
 * 風格：極簡、無邊框、頭像與名字並排。
 * 優化：增加各區塊間距，讓視覺呼吸。
 * @param {*} props
 * @returns
 */
export function InfoCard(props) {
  const { className, siteInfo } = props
  const router = useRouter()
  
  return (
    <Card className={className}>
      
      {/* 1. 頭像與名字：並排區塊 */}
      <div className='flex items-center pt-8 px-6 pb-4 dark:text-gray-100'>
        
        {/* 頭像區塊：用 DIV 包住，強制圓形裁切 */}
        <div
          className='transform duration-200 cursor-pointer flex-shrink-0'
          onClick={() => {
            router.push('/')
          }}
        >
          {/* 【關鍵修改】：新增一個 DIV，強制設定尺寸、圓形、溢出隱藏 */}
          <div className='w-16 h-16 rounded-full overflow-hidden hover:scale-105 transition-transform duration-300'> 
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <LazyImage 
              src={siteInfo?.icon} 
              className='w-full h-full object-cover' // 移除 rounded-full，讓父 div 控制
              // width={64} // 移除 width，讓父 div w-16 h-16 控制
              alt={siteConfig('AUTHOR')} 
            />
          </div>
        </div>

        {/* 標題區塊：放在頭像右邊 */}
        <div className='font-serif ml-4 flex flex-col justify-center text-left'>
          {/* 名字：閃電煎餃 (text-xl) */}
          <div className='text-xl font-bold leading-tight'>{siteConfig('AUTHOR')}</div>
        </div>
      </div>

      {/* 2. BIO 簡介（核心文案） */}
      <div className='text-sm text-left px-6 py-4 leading-relaxed text-gray-700 dark:text-gray-300'>
        <p className=''>{siteConfig('BIO')}</p>
      </div>
      
      {/* 3. 計數區塊 (MenuGroupCard) - 增加 mt-4 呼吸間距 */}
      <div className='pt-4 mt-4'> {/* 【關鍵間距】mt-4 讓它與上方 BIO 區隔 */}
        <MenuGroupCard {...props} /> 
      </div>
      
      {/* 4. 社交連結按鈕 - 增加 pt-4 間距 */}
      <div className='pt-4 px-6 pb-6'>
        <SocialButton />
      </div>
      
    </Card>
  )
}
