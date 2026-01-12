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
      <div className='info-card-header'>
        
        {/* 頭像區塊 */}
        <div
          className='avatar-container'
          onClick={() => router.push('/')}
        >
          <div className='avatar-wrapper'> 
            <LazyImage 
              src={siteInfo?.icon} 
              alt={siteConfig('AUTHOR')} 
            />
          </div>
        </div>

        {/* 標題區塊 */}
        <div className='author-info'>
          <div className='author-name'>{siteConfig('AUTHOR')}</div>
        </div>
      </div>

      {/* 2. BIO 簡介 */}
      <div className='bio-text'>
        <p>{siteConfig('BIO')}</p>
      </div>
      
      {/* 3. 計數區塊 (MenuGroupCard) */}
      <div className='info-card-section'>
        <MenuGroupCard {...props} /> 
      </div>
      
      {/* 4. 社交連結按鈕 */}
      <div className='info-card-footer'>
        <SocialButton />
      </div>
      
    </Card>
  )
}
