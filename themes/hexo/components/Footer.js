import PoweredBy from '@/components/PoweredBy'
import { siteConfig } from '@/lib/config'

const formatStat = (value) => {
  if (value === null || value === undefined) return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return n.toLocaleString('en-US')
}

const Footer = ({ title, sitePv, siteUv }) => {
  const d = new Date()
  const currentYear = d.getFullYear()
  const since = siteConfig('SINCE')
  const copyrightDate =
    parseInt(since) < currentYear ? since + '-' + currentYear : currentYear

  return (
    <footer
      className='footer-text relative z-10 flex-shrink-0 justify-center text-center m-auto w-full leading-6 text-gray-600 dark:text-gray-100 text-sm p-6 bg-transparent'
    >
      <div className='mb-3 text-xs text-light-400 dark:text-gray-400'>
        <span className='mx-2'>
          <i className='fas fa-eye mr-1' /> 總瀏覽 {formatStat(sitePv)}
        </span>
        <span className='mx-2'>
          <i className='fas fa-user-friends mr-1' /> 訪客 {formatStat(siteUv)}
        </span>
      </div>
      <i className='fas fa-copyright' /> {`${copyrightDate}`}
      <span>
        <i className='mx-1 animate-pulse fas fa-skillet' />
        <a
          href={siteConfig('LINK')}
          className='underline font-bold dark:text-gray-300 '>
          {siteConfig('AUTHOR')}
        </a>
        .<br />
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
