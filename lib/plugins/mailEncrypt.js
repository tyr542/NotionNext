export const handleEmailClick = (e, emailIcon, CONTACT_EMAIL) => {
  if (CONTACT_EMAIL && emailIcon && !emailIcon.current.href) {
    e.preventDefault()
    const email = decryptEmail(CONTACT_EMAIL)
    emailIcon.current.href = `mailto:${email}`
    emailIcon.current.click()
  }
}

export const encryptEmail = email => {
  return btoa(unescape(encodeURIComponent(email)))
}

export const decryptEmail = encryptedEmail => {
  if (typeof encryptedEmail !== 'string' || !encryptedEmail) {
    return ''
  }

  // Support plain-text values from env vars or Notion config without logging decode errors.
  if (encryptedEmail.includes('@')) {
    return encryptedEmail
  }

  try {
    return decodeURIComponent(escape(atob(encryptedEmail)))
  } catch (error) {
    return encryptedEmail
  }
}
