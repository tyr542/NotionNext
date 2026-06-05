import { isBrowser } from '@/lib/utils';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

/**
 * 样式调整的补丁
 */
const useAdjustStyle = () => {
  const router = useRouter();

  /**
   * 避免 callout 含有图片时溢出撑开父容器
   */
  const adjustCalloutImg = () => {
    const callOuts = document.querySelectorAll('.notion-callout-text');
    callOuts.forEach((callout) => {
      const images = callout.querySelectorAll('figure.notion-asset-wrapper.notion-asset-wrapper-image > div');
      const calloutWidth = callout.offsetWidth;
      images.forEach((container) => {
        const imageWidth = container.offsetWidth;
        if (imageWidth + 50 > calloutWidth) {
          container.style.setProperty('width', '100%');
        }
      });
    });
  };

  /**
   * 依 icon emoji 標記「特殊 callout」，由 public/css/custom.css 套各自專屬樣式。
   * 🎯 → .tldr-callout（核心結論）；📝 → .changelog-callout（更新日誌）。
   * 這些 emoji 為各區塊專屬、內文不使用，避免誤抓；每類只標第一個命中的 callout。
   */
  const markSpecialCallouts = () => {
    const wrapper = document.getElementById('article-wrapper');
    if (!wrapper) return;
    const rules = [
      { emoji: '🎯', className: 'tldr-callout' },
      { emoji: '📝', className: 'changelog-callout' }
    ];
    const callouts = wrapper.querySelectorAll('.notion-callout');
    for (const { emoji, className } of rules) {
      for (const callout of callouts) {
        // 只認 callout 自己的 icon 欄（第一個非 .notion-callout-text 的直屬子），
        // 避免誤抓 callout 內文裡 page mention / 連結的頁面圖示
        const iconEl = Array.from(callout.children).find(
          child => !child.classList.contains('notion-callout-text')
        );
        if (iconEl && iconEl.textContent.trim().includes(emoji)) {
          callout.classList.add(className);
          break;
        }
      }
    }
  };

  useEffect(() => {
    if (isBrowser) {
      adjustCalloutImg();
      markSpecialCallouts();
      // hydrate 時序：Notion 內文可能稍晚才進 DOM，補兩次重試確保標記到
      const t1 = setTimeout(markSpecialCallouts, 600);
      const t2 = setTimeout(markSpecialCallouts, 1500);
      window.addEventListener('resize', adjustCalloutImg);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        window.removeEventListener('resize', adjustCalloutImg);
      };
    }
    // 依路由變化重跑：站內 Link 換頁時 _app 不重新掛載，
    // 需在 asPath 變動時重新標記新文章的特殊 callout
  }, [router.asPath]);
};

export default useAdjustStyle;
