import md5 from 'js-md5'
import { webcrypto } from 'crypto'

import {
  createArticlePasswordHash,
  isVersionedArticlePasswordHash,
  verifyArticlePassword,
  ARTICLE_PASSWORD_HASH_VERSION
} from '@/lib/utils/articlePassword'

describe('article password hashing', () => {
  it('continues to verify legacy md5 article passwords', async () => {
    const slug = 'private-note'
    const storedPassword = md5(slug + 'open-sesame')

    await expect(
      verifyArticlePassword({ slug, storedPassword, passInput: 'open-sesame' })
    ).resolves.toBe(true)

    await expect(
      verifyArticlePassword({ slug, storedPassword, passInput: 'wrong' })
    ).resolves.toBe(false)
  })

  it('creates and verifies versioned pbkdf2-sha256 article passwords', async () => {
    const slug = 'private-note'
    const password = 'open-sesame'
    const saltBytes = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8,
      9, 10, 11, 12, 13, 14, 15, 16
    ])

    const storedPassword = await createArticlePasswordHash({
      slug,
      password,
      saltBytes,
      iterations: 1000,
      crypto: webcrypto
    })

    expect(storedPassword.startsWith(`${ARTICLE_PASSWORD_HASH_VERSION}$1000$`)).toBe(true)
    expect(isVersionedArticlePasswordHash(storedPassword)).toBe(true)
    await expect(
      verifyArticlePassword({ slug, storedPassword, passInput: password, crypto: webcrypto })
    ).resolves.toBe(true)
    await expect(
      verifyArticlePassword({ slug, storedPassword, passInput: 'wrong', crypto: webcrypto })
    ).resolves.toBe(false)
  })

  it('rejects malformed versioned password hashes', async () => {
    await expect(
      verifyArticlePassword({
        slug: 'private-note',
        storedPassword: `${ARTICLE_PASSWORD_HASH_VERSION}$bad$salt$hash`,
        passInput: 'open-sesame',
        crypto: webcrypto
      })
    ).resolves.toBe(false)
  })
})
