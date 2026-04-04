/**
 * Contact and social profile settings
 */
module.exports = {
  // Encode the default value too, so every theme receives the same CONTACT_EMAIL format.
  CONTACT_EMAIL:
    (process.env.NEXT_PUBLIC_CONTACT_EMAIL &&
      btoa(
        unescape(encodeURIComponent(process.env.NEXT_PUBLIC_CONTACT_EMAIL))
      )) || btoa(unescape(encodeURIComponent('hi@gyozalab.com'))),
  CONTACT_WEIBO:
    process.env.NEXT_PUBLIC_CONTACT_WEIBO || 'https://www.threads.com/@gyozalab',
  CONTACT_TWITTER: process.env.NEXT_PUBLIC_CONTACT_TWITTER || '',
  CONTACT_GITHUB:
    process.env.NEXT_PUBLIC_CONTACT_GITHUB || 'https://github.com/gyozalab',
  CONTACT_TELEGRAM: process.env.NEXT_PUBLIC_CONTACT_TELEGRAM || '',
  CONTACT_LINKEDIN: process.env.NEXT_PUBLIC_CONTACT_LINKEDIN || '',
  CONTACT_INSTAGRAM: process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM || '',
  CONTACT_BILIBILI: process.env.NEXT_PUBLIC_CONTACT_BILIBILI || '',
  CONTACT_YOUTUBE: process.env.NEXT_PUBLIC_CONTACT_YOUTUBE || '',
  CONTACT_XIAOHONGSHU: process.env.NEXT_PUBLIC_CONTACT_XIAOHONGSHU || '',
  CONTACT_ZHISHIXINGQIU: process.env.NEXT_PUBLIC_CONTACT_ZHISHIXINGQIU || '',
  CONTACT_WEHCHAT_PUBLIC: process.env.NEXT_PUBLIC_CONTACT_WEHCHAT_PUBLIC || '',
  CONTACT_PORTALY:
    process.env.NEXT_PUBLIC_CONTACT_PORTALY || 'https://portaly.cc/gyozalab',
  CONTACT_PORTALY_SUPPORT:
    process.env.NEXT_PUBLIC_CONTACT_PORTALY_SUPPORT ||
    'https://portaly.cc/gyozalab/support'
}
