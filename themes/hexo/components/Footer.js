import PoweredBy from '@/components/PoweredBy'
import { siteConfig } from '@/lib/config'

const Footer = ({ title }) => {
  const d = new Date()
  const currentYear = d.getFullYear()
  const since = siteConfig('SINCE')
  const copyrightDate =
    parseInt(since) < currentYear ? since + '-' + currentYear : currentYear

  return (
    <footer 
      className='footer-text relative z-10 flex-shrink-0 justify-center text-center m-auto w-full leading-6 text-gray-600 dark:text-gray-100 text-sm p-6 bg-transparent'
    >
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
