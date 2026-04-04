import { decryptEmail, encryptEmail } from '@/lib/plugins/mailEncrypt'

describe('mailEncrypt', () => {
  it('decrypts emails that were encoded with encryptEmail', () => {
    const email = 'hi@gyozalab.com'

    expect(decryptEmail(encryptEmail(email))).toBe(email)
  })

  it('returns plain email values unchanged when they are not base64-encoded', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(decryptEmail('hi@gyozalab.com')).toBe('hi@gyozalab.com')
    expect(consoleErrorSpy).not.toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })
})
