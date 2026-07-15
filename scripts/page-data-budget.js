#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const DEFAULT_BUDGET_BYTES = 250 * 1024

function walkJsonFiles(dir) {
  if (!fs.existsSync(dir)) {
    return []
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(entryPath))
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(entryPath)
    }
  }

  return files
}

function getPageProps(json) {
  return json?.pageProps || json?.props || json || {}
}

function propSize(value) {
  return Buffer.byteLength(JSON.stringify(value) || '', 'utf8')
}

function getPropBreakdown(pageProps) {
  return Object.entries(pageProps || {})
    .map(([key, value]) => ({
      key,
      bytes: propSize(value)
    }))
    .sort((a, b) => b.bytes - a.bytes)
}

function isNonArticlePage(relativePath) {
  let normalized = relativePath.replace(/\\/g, '/')
  if (/^[a-z]{2}(?:-[A-Z]{2})?\.json$/.test(normalized)) {
    return true
  }

  normalized = normalized.replace(/^[a-z]{2}(?:-[A-Z]{2})?\//, '')
  return [
    /^index\.json$/,
    /^404\.json$/,
    /^500\.json$/,
    /^page\//,
    /^search(?:\/|\.json$)/,
    /^archive(?:\/|\.json$)/,
    /^tag(?:\/|\.json$)/,
    /^category(?:\/|\.json$)/
  ].some(pattern => pattern.test(normalized))
}

function analyzePageDataFiles({
  pagesDir = path.join(process.cwd(), '.next', 'server', 'pages'),
  budgetBytes = DEFAULT_BUDGET_BYTES
} = {}) {
  const reports = walkJsonFiles(pagesDir).map(filePath => {
    const relativePath = path.relative(pagesDir, filePath)
    const raw = fs.readFileSync(filePath, 'utf8')
    const json = JSON.parse(raw)
    const bytes = Buffer.byteLength(raw, 'utf8')
    const reportOnly = !isNonArticlePage(relativePath)
    const breakdown = getPropBreakdown(getPageProps(json))

    return {
      filePath,
      relativePath,
      bytes,
      reportOnly,
      breakdown
    }
  })

  reports.sort((a, b) => b.bytes - a.bytes)

  const failures = reports.filter(
    report => !report.reportOnly && report.bytes > budgetBytes
  )

  return {
    ok: failures.length === 0,
    budgetBytes,
    reports,
    failures
  }
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`
  }
  return `${(bytes / 1024).toFixed(1)}KB`
}

function printReport(result) {
  console.log(
    `Page-data budget: non-article pages must stay below ${formatBytes(
      result.budgetBytes
    )}`
  )

  result.reports.slice(0, 20).forEach(report => {
    const mode = report.reportOnly ? 'report-only' : 'enforced'
    console.log(`\n${report.relativePath} ${formatBytes(report.bytes)} ${mode}`)
    report.breakdown.slice(0, 8).forEach(item => {
      console.log(`  ${item.key}: ${formatBytes(item.bytes)}`)
    })
  })

  if (result.failures.length > 0) {
    console.error('\nPage-data budget failures:')
    result.failures.forEach(report => {
      console.error(
        `- ${report.relativePath}: ${formatBytes(report.bytes)} exceeds ${formatBytes(
          result.budgetBytes
        )}`
      )
    })
  }
}

if (require.main === module) {
  const result = analyzePageDataFiles()
  printReport(result)
  process.exit(result.ok ? 0 : 1)
}

module.exports = {
  analyzePageDataFiles,
  formatBytes,
  isNonArticlePage
}
