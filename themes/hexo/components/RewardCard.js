import { siteConfig } from '@/lib/config'

/**
 * 贊助卡片元件
 * 放置於文章底部，引導讀者前往 Portaly 贊助
 * 設計風格完全依循部落格的 custom.css 設計系統
 * @returns {JSX.Element}
 */
export default function RewardCard() {
    const CONTACT_PORTALY_SUPPORT = siteConfig('CONTACT_PORTALY_SUPPORT') || 'https://portaly.cc/gyozalab/support'

    if (!CONTACT_PORTALY_SUPPORT) {
        return <></>
    }

    return (
        <section className='reward-card' style={{
            width: '100%',
            marginTop: '3rem',
            marginBottom: '2rem',
            padding: '1.75rem 2rem',
            borderRadius: '12px',
            backgroundColor: 'var(--card-bg, #ffffff)',
            border: '1px solid rgba(0,0,0,0.03)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
        }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                    fontSize: '1.15rem',
                    color: '#111',
                    letterSpacing: '0.02em',
                    marginBottom: '0.4rem',
                    lineHeight: 1.4,
                    whiteSpace: 'nowrap',
                }}>
                    這篇有幫到你嗎？歡迎餵食煎餃 🥟
                </h3>
                <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem',
                    fontWeight: 400,
                    color: '#666',
                    lineHeight: 1.7,
                    margin: 0,
                }}>
                    每篇文章都是踩坑後整理出來的，你的支持是最好的調味料。
                </p>
            </div>
            <a
                href={CONTACT_PORTALY_SUPPORT}
                target='_blank'
                rel='noreferrer'
                className='reward-card-btn'
                style={{
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem 2rem',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--color-accent, #8c7b75)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.opacity = '0.85'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(140, 123, 117, 0.3)'
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.opacity = '1'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                }}
            >
                請我喝杯咖啡
            </a>
        </section>
    )
}
