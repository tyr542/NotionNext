// pages/sitemap.xml.js
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { sanitizeNonArticlePageProps } from '@/lib/utils/listPageProps'
import { useRouter } from 'next/router'
import Slug from '../[prefix]'

/**
/**
 * @returns
 */
export const getStaticProps = async () => {
  const from = `auth`
  const props = await fetchGlobalAllData({ from })

  delete props.allPages
  sanitizeNonArticlePageProps(props)
  return {
    props
  }
}

/**
 * 根据notion的slug访问页面
 * 解析二级目录 /article/about
 * @param {*} props
 * @returns
 */
const UI = props => {
  const router = useRouter()
  return <Slug {...props} msg={router?.query?.msg} title={'授权结果'} />
}

export default UI
