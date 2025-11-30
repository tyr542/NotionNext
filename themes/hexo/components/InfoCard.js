import { useRouter } from 'next/router'
import Card from './Card'
import SocialButton from './SocialButton'
import MenuGroupCard from './MenuGroupCard'
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'

/**
 * 社交資訊卡 (Hexo 主題側邊欄)
 * 風格：極簡、無邊框、頭像與名字並排。
 * @param {*} props
 * @returns
 */
export function InfoCard(props) {
  const { className, siteInfo } = props
  const router = useRouter()
  
  // 【修正 1, 3】移除所有 AI 猜測的 Vibe 資訊
  // const profession = 'PHOTOGRAPHER / INTP' // 刪除
  // const slogan = '"Vibe Coding" 實踐者，相信直覺跟邏輯並不衝突。' // 刪除

  return (
    <Card className={className}>
      {/* 【修正 4】 移除 border-b */}
      <div 
        className='flex items-center py-6 px-6 dark:text-gray-100' // border-b 已移除
      >
        
        {/* 1. 頭像區塊：點擊回首頁 */}
        <div
          className='transform duration-200 cursor-pointer flex-shrink-0'
          onClick={() => {
            router.push('/')
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <LazyImage 
            src={siteInfo?.icon} 
            className='rounded-full hover:scale-105 transition-transform duration-300' 
            width={72} 
            alt={siteConfig('AUTHOR')} 
          />
        </div>

        {/* 2. 標題區塊：放在頭像右邊 */}
        <div className='font-serif ml-4 flex flex-col justify-center text-left'>
          {/* 【修正 2】 煎餃沾醬的字縮小 (從 text-2xl 降級為 text-xl) */}
          <div className='text-xl font-bold leading-tight'>{siteConfig('AUTHOR')}</div>
          {/* 【修正 3】 移除 profession 標語 */}
        </div>
      </div>

      {/* 3. BIO 簡介（核心文案） */}
      {/* 【修正 4】 移除所有 border 和 Slogan 區塊 */}
      <div className='text-sm text-left px-6 py-4 leading-relaxed text-gray-700 dark:text-gray-300'>
        {/* 主要 BIO 描述 */}
        <p className=''>{siteConfig('BIO')}</p>
        
        {/* Vibe Slogan / 理念 區塊已刪除 */}
      </div>
      
      {/* 4. 計數區塊 (MenuGroupCard) */}
      {/* 【修正 4】 移除 border-t */}
      <div className='pt-4'>
        <MenuGroupCard {...props} /> 
      </div>
      
      {/* 5. 社交連結按鈕 */}
      {/* 【修正 4】 移除 border-t */}
      <div className='pt-4 px-6 pb-6'>
        <SocialButton />
      </div>
      
    </Card>
  )
}
