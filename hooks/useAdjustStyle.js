import { isBrowser } from '@/lib/utils';
import { useEffect } from 'react';

/**
 * 样式调整的补丁
 */
const useAdjustStyle = () => {
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
   * TL;DR 核心結論：標記文章內第一個「🎯」callout（🎯 為 TL;DR 專屬 emoji，內文不使用）
   * 由 public/css/custom.css 的 .tldr-callout 套用「核心結論」樣式
   */
  const markTldrCallout = () => {
    const wrapper = document.getElementById('article-wrapper');
    if (!wrapper) return;
    const callouts = wrapper.querySelectorAll('.notion-callout');
    for (const callout of callouts) {
      const icon = callout.querySelector('.notion-page-icon');
      if (icon && icon.textContent.trim().includes('🎯')) {
        callout.classList.add('tldr-callout');
        break;
      }
    }
  };

  useEffect(() => {
    if (isBrowser) {
      adjustCalloutImg();
      markTldrCallout();
      // hydrate 時序：Notion 內文可能稍晚才進 DOM，補兩次重試確保標記到
      const t1 = setTimeout(markTldrCallout, 600);
      const t2 = setTimeout(markTldrCallout, 1500);
      window.addEventListener('resize', adjustCalloutImg);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        window.removeEventListener('resize', adjustCalloutImg);
      };
    }
  }, []);
};

export default useAdjustStyle;
