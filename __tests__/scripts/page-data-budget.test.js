const fs = require('fs')
const os = require('os')
const path = require('path')

describe('page-data budget script', () => {
  let tempDir

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'page-data-budget-'))
  })

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  function writePageData(relativePath, pageProps) {
    const filePath = path.join(tempDir, relativePath)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify({ pageProps }), 'utf8')
    return filePath
  }

  it('fails oversized non-article page data and reports top-level prop sizes', () => {
    writePageData('search.json', {
      posts: 'x'.repeat(180),
      notice: 'y'.repeat(80)
    })

    const { analyzePageDataFiles } = require('../../scripts/page-data-budget')
    const result = analyzePageDataFiles({
      pagesDir: tempDir,
      budgetBytes: 100
    })

    expect(result.ok).toBe(false)
    expect(result.failures).toHaveLength(1)
    expect(result.failures[0].relativePath).toBe('search.json')
    expect(result.failures[0].breakdown[0]).toMatchObject({
      key: 'posts'
    })
    expect(result.failures[0].breakdown[1]).toMatchObject({
      key: 'notice'
    })
  })

  it('treats localized non-article page data as enforced', () => {
    writePageData(path.join('zh-TW', 'search.json'), {
      posts: 'x'.repeat(180)
    })
    writePageData(path.join('zh-TW', 'tag.json'), {
      tagOptions: 'x'.repeat(180)
    })
    writePageData(path.join('zh-TW', 'category.json'), {
      categoryOptions: 'x'.repeat(180)
    })
    writePageData('zh-TW.json', {
      posts: 'x'.repeat(180)
    })

    const { analyzePageDataFiles } = require('../../scripts/page-data-budget')
    const result = analyzePageDataFiles({
      pagesDir: tempDir,
      budgetBytes: 100
    })

    expect(result.ok).toBe(false)
    expect(result.failures.map(failure => failure.relativePath)).toEqual(
      expect.arrayContaining([
        path.join('zh-TW', 'search.json'),
        path.join('zh-TW', 'tag.json'),
        path.join('zh-TW', 'category.json'),
        'zh-TW.json'
      ])
    )
  })

  it('reports oversized article page data without failing', () => {
    writePageData('posts/my-article.json', {
      post: {
        blockMap: 'x'.repeat(300)
      }
    })

    const { analyzePageDataFiles } = require('../../scripts/page-data-budget')
    const result = analyzePageDataFiles({
      pagesDir: tempDir,
      budgetBytes: 100
    })

    expect(result.ok).toBe(true)
    expect(result.failures).toHaveLength(0)
    expect(result.reports[0]).toMatchObject({
      relativePath: path.join('posts', 'my-article.json'),
      reportOnly: true
    })
  })
})
