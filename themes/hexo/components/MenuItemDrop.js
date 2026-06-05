import SmartLink from '@/components/SmartLink'
import { useState } from 'react'
/**
 * 支持二级展开的菜单
 * @param {*} param0
 * @returns
 */
export const MenuItemDrop = ({ link }) => {
  const [show, changeShow] = useState(false)
  const hasSubMenu = link?.subMenus?.length > 0

  if (!link || !link.show) {
    return null
  }

  return (
    <div
      className='relative'
      onMouseOver={() => changeShow(true)}
      onMouseOut={() => changeShow(false)}>
      {!hasSubMenu && (
        <SmartLink
          href={link?.href}
          target={link?.target}
          className=' menu-link pl-2 pr-4 no-underline tracking-widest pb-1'>
          {link?.icon && <i className={link?.icon} />} {link?.name}
        </SmartLink>
      )}

      {hasSubMenu && (
        <div className='cursor-pointer menu-link pl-2 pr-4 no-underline tracking-widest pb-1 flex items-center'>
          {link?.icon && <i className={link?.icon} />} {link?.name}
          <i
            className={`pl-2 fa fa-angle-down text-xs duration-300 ${show ? 'rotate-180' : 'rotate-0'}`}></i>
        </div>
      )}

      {/* 子菜单 */}
      {hasSubMenu && (
        <ul
          className={`${show ? 'visible opacity-100 translate-y-0 pointer-events-auto' : 'invisible opacity-0 -translate-y-1 pointer-events-none'} absolute left-0 top-full z-30 pt-3 transition-all duration-200 ease-out`}>
          {/* pt-3 作為透明懸停橋接區，避免滑鼠移到卡片時選單收起 */}
          <div className='min-w-[11rem] overflow-hidden rounded-xl border border-black/5 dark:border-white/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg shadow-black/[0.06]'>
            {link.subMenus.map((sLink, index) => {
              return (
                <li key={index} className='list-none'>
                  <SmartLink
                    href={sLink.href}
                    target={link?.target}
                    className='flex w-full items-center gap-2 px-4 py-2.5 text-sm font-light tracking-wide text-gray-700 dark:text-gray-200 hover:bg-[#574b47] hover:text-white transition-colors duration-150 whitespace-nowrap'>
                    {sLink?.icon && <i className={`${sLink.icon} w-4 text-center opacity-70`} />}
                    {sLink.title}
                  </SmartLink>
                </li>
              )
            })}
          </div>
        </ul>
      )}
    </div>
  )
}
