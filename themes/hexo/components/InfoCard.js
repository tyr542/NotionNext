import { useRouter } from 'next/router'
import Card from './Card'
import SocialButton from './SocialButton'
import MenuGroupCard from './MenuGroupCard'
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'

/**
 * 社交信息卡
 * @param {*} props
 * @returns
 */
export function InfoCard(props) {
  const { className, siteInfo } = props
  const router = useRouter()
  return (
      <Card className={className}>
          <div
              className='justify-center items-center flex py-6 dark:text-gray-100 transform duration-200 cursor-pointer'
              onClick={() => {
                router.push('/')
              }}
          >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <LazyImage src={siteInfo?.icon} className='rounded-full' width={120} alt={siteConfig('AUTHOR')} />
          </div>
          <div className='font-medium text-center text-xl pb-4'>{siteConfig('AUTHOR')}</div>
          
          {/* 優化點 1：將 BIO 文案改為靠左對齊，並增加左右內邊距和行距，營造筆記質感 */}
          <div className='text-sm text-left px-6 leading-relaxed'>{siteConfig('BIO')}</div>
          
          {/* 優化點 2：計數區塊（MenuGroupCard）保留原樣，以維持連結功能 */}
          <MenuGroupCard {...props} />
          
          <SocialButton />
      </Card>
  )
}
