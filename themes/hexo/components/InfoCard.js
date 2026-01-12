import { useRouter } from 'next/router'
import Card from './Card'
import SocialButton from './SocialButton'
import MenuGroupCard from './MenuGroupCard'
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'

/**
 * 社交資訊卡 (Hexo 主題側邊欄)
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
        
        {/* 頭像區塊 */}
        <div
          className='cursor-pointer flex-shrink-0'
          onClick={() => router.push('/')}
        >
          <div className='w-16 h-16 rounded-full overflow-hidden hover:scale-105 transition-transform duration-300'> 
            <LazyImage 
              src={siteInfo?.icon} 
              className='w-full h-full object-cover'
              alt={siteConfig('AUTHOR')} 
            />
          </div>
        </div>

        {/* 標題區塊 */}
        <div className='font-serif ml-4 flex flex-col justify-center text-left'>
          <div className='text-xl font-bold leading-tight'>{siteConfig('AUTHOR')}</div>
        </div>
      </div>

      {/* 2. BIO 簡介 */}
      <div className='text-sm text-left px-6 py-4 leading-relaxed text-gray-700 dark:text-gray-300'>
        <p>{siteConfig('BIO')}</p>
      </div>
      
      {/* 3. 計數區塊 (MenuGroupCard) */}
      <div className='pt-4 mt-4'>
        <MenuGroupCard {...props} /> 
      </div>
      
      {/* 4. 社交連結按鈕 */}
      <div className='pt-4 px-6 pb-6'>
        <SocialButton />
      </div>
      
    </Card>
  )
}
