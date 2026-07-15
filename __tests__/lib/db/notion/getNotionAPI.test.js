function deferred() {
  let resolve
  let reject
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })
  return { promise, resolve, reject }
}

async function loadNotionAPI(getPageMock) {
  jest.resetModules()
  jest.doMock('notion-client', () => ({
    NotionAPI: jest.fn(() => ({
      getPage: getPageMock,
      getBlocks: jest.fn(),
      getUsers: jest.fn()
    }))
  }))

  return import('@/lib/db/notion/getNotionAPI')
}

describe('notionAPI in-flight deduplication', () => {
  afterEach(() => {
    jest.dontMock('notion-client')
    jest.clearAllMocks()
  })

  it('shares one underlying request for concurrent same-key page fetches', async () => {
    const pending = deferred()
    const getPageMock = jest.fn(() => pending.promise)
    const { default: notionAPI } = await loadNotionAPI(getPageMock)

    const first = notionAPI.getPage('page-1')
    const second = notionAPI.getPage('page-1')

    expect(getPageMock).toHaveBeenCalledTimes(1)
    expect(first).toBe(second)

    pending.resolve({ block: { 'page-1': {} } })

    await expect(Promise.all([first, second])).resolves.toEqual([
      { block: { 'page-1': {} } },
      { block: { 'page-1': {} } }
    ])
  })

  it('fetches different page keys independently', async () => {
    const getPageMock = jest.fn(async id => ({ block: { [id]: {} } }))
    const { default: notionAPI } = await loadNotionAPI(getPageMock)

    await expect(
      Promise.all([notionAPI.getPage('page-1'), notionAPI.getPage('page-2')])
    ).resolves.toEqual([
      { block: { 'page-1': {} } },
      { block: { 'page-2': {} } }
    ])
    expect(getPageMock).toHaveBeenCalledTimes(2)
  })

  it('removes rejected promises so later same-key fetches can retry', async () => {
    const getPageMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce({ block: { 'page-1': {} } })
    const { default: notionAPI } = await loadNotionAPI(getPageMock)

    await expect(notionAPI.getPage('page-1')).rejects.toThrow(
      'temporary failure'
    )
    await expect(notionAPI.getPage('page-1')).resolves.toEqual({
      block: { 'page-1': {} }
    })
    expect(getPageMock).toHaveBeenCalledTimes(2)
  })
})
