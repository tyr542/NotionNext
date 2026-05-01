import md5 from 'js-md5'

export const ARTICLE_PASSWORD_HASH_VERSION = 'pbkdf2-sha256'

const DEFAULT_ITERATIONS = 210000
const SALT_BYTES = 16
const HASH_BYTES = 32
const MAX_ITERATIONS = 2000000

function getSubtleCrypto(crypto = globalThis.crypto) {
  return crypto?.subtle
}

function getRandomValues(crypto = globalThis.crypto, bytes) {
  if (!crypto?.getRandomValues) {
    throw new Error('Secure random values are unavailable')
  }
  crypto.getRandomValues(bytes)
  return bytes
}

function textToBytes(value) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value)
  }
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(value, 'utf8'))
  }
  throw new Error('Text encoding is unavailable')
}

function toBase64Url(bytes) {
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  const base64 = typeof btoa === 'function'
    ? btoa(binary)
    : Buffer.from(binary, 'binary').toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), '=')
  const binary = typeof atob === 'function'
    ? atob(padded)
    : Buffer.from(padded, 'base64').toString('binary')
  return Uint8Array.from(binary, character => character.charCodeAt(0))
}

function isEqualBytes(left, right) {
  if (!left || !right || left.length !== right.length) {
    return false
  }
  let difference = 0
  for (let index = 0; index < left.length; index++) {
    difference |= left[index] ^ right[index]
  }
  return difference === 0
}

function parseVersionedHash(storedPassword) {
  const parts = storedPassword.split('$')
  if (parts.length !== 4 || parts[0] !== ARTICLE_PASSWORD_HASH_VERSION) {
    return null
  }

  const iterations = Number(parts[1])
  if (!Number.isInteger(iterations) || iterations <= 0 || iterations > MAX_ITERATIONS) {
    return null
  }

  try {
    const salt = fromBase64Url(parts[2])
    const hash = fromBase64Url(parts[3])
    if (!salt.length || !hash.length) {
      return null
    }
    return { iterations, salt, hash }
  } catch (error) {
    return null
  }
}

export function isVersionedArticlePasswordHash(storedPassword) {
  return typeof storedPassword === 'string' && parseVersionedHash(storedPassword) !== null
}

async function derivePasswordHash({
  slug,
  password,
  salt,
  iterations,
  crypto = globalThis.crypto
}) {
  const subtle = getSubtleCrypto(crypto)
  if (!subtle) {
    throw new Error('SubtleCrypto is unavailable')
  }

  const keyMaterial = await subtle.importKey(
    'raw',
    textToBytes(`${slug}:${password}`),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations
    },
    keyMaterial,
    HASH_BYTES * 8
  )
  return new Uint8Array(bits)
}

export async function createArticlePasswordHash({
  slug,
  password,
  iterations = DEFAULT_ITERATIONS,
  saltBytes,
  crypto = globalThis.crypto
}) {
  if (!slug || !password) {
    throw new Error('Article password hash requires a slug and password')
  }
  if (!Number.isInteger(iterations) || iterations <= 0 || iterations > MAX_ITERATIONS) {
    throw new Error('Article password hash iterations are invalid')
  }

  const salt = saltBytes || getRandomValues(crypto, new Uint8Array(SALT_BYTES))
  const hash = await derivePasswordHash({
    slug,
    password,
    salt,
    iterations,
    crypto
  })

  return [
    ARTICLE_PASSWORD_HASH_VERSION,
    iterations,
    toBase64Url(salt),
    toBase64Url(hash)
  ].join('$')
}

export async function verifyArticlePassword({
  slug,
  storedPassword,
  passInput,
  crypto = globalThis.crypto
}) {
  if (!slug || !storedPassword || !passInput) {
    return false
  }

  if (!storedPassword.startsWith(`${ARTICLE_PASSWORD_HASH_VERSION}$`)) {
    return md5(slug + passInput).toLowerCase() === storedPassword.toLowerCase()
  }

  const parsed = parseVersionedHash(storedPassword)
  if (!parsed) {
    return false
  }

  try {
    const candidate = await derivePasswordHash({
      slug,
      password: passInput,
      salt: parsed.salt,
      iterations: parsed.iterations,
      crypto
    })
    return isEqualBytes(candidate, parsed.hash)
  } catch (error) {
    return false
  }
}
