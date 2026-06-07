jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn(() => null)
}))

jest.mock('@fisch0920/medium-zoom', () =>
  jest.fn(() => ({
    clone: jest.fn(() => ({
      attach: jest.fn()
    }))
  }))
)

jest.mock('react-notion-x', () => ({
  NotionRenderer: () => null
}))

import { wrapTablesForMobile } from '@/components/NotionPage'

describe('wrapTablesForMobile', () => {
  it('wraps notion tables in a dedicated horizontal scroll container', () => {
    document.body.innerHTML = `
      <div id="article">
        <table class="notion-simple-table">
          <tbody>
            <tr><td>Header</td><td>Value</td></tr>
          </tbody>
        </table>
      </div>
    `

    const article = document.getElementById('article')
    wrapTablesForMobile(article)

    const wrapper = article.querySelector('.notion-table-scroll')
    const table = article.querySelector('.notion-simple-table')

    expect(wrapper).not.toBeNull()
    expect(wrapper.firstElementChild).toBe(table)
  })

  it('does not wrap the same table twice', () => {
    document.body.innerHTML = `
      <div id="article">
        <table class="notion-simple-table">
          <tbody>
            <tr><td>Header</td><td>Value</td></tr>
          </tbody>
        </table>
      </div>
    `

    const article = document.getElementById('article')
    wrapTablesForMobile(article)
    wrapTablesForMobile(article)

    expect(article.querySelectorAll('.notion-table-scroll')).toHaveLength(1)
  })
})
