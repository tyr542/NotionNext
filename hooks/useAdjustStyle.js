import { isBrowser } from '@/lib/utils';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const useAdjustStyle = () => {
  const router = useRouter();

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

  const markSpecialCallouts = () => {
    const wrapper = document.getElementById('article-wrapper');
    if (!wrapper) return false;
    const rules = [
      { emoji: '🎯', className: 'tldr-callout' },
      { emoji: '📝', className: 'changelog-callout' }
    ];
    const callouts = wrapper.querySelectorAll('.notion-callout');
    if (callouts.length === 0) return false;
    for (const { emoji, className } of rules) {
      for (const callout of callouts) {
        const iconEl = Array.from(callout.children).find(
          child => !child.classList.contains('notion-callout-text')
        );
        if (iconEl && iconEl.textContent.trim().includes(emoji)) {
          callout.classList.add(className);
          if (className === 'changelog-callout') {
            wrapChangelogInDetails(callout);
          }
          break;
        }
      }
    }
    return true;
  };

  const wrapChangelogInDetails = (callout) => {
    if (callout.querySelector('details')) return;
    const textContainer = callout.querySelector('.notion-callout-text');
    if (!textContainer) return;

    const children = Array.from(textContainer.children);
    const titleEl = children[0];
    const restEls = children.slice(1);
    if (!titleEl || restEls.length === 0) return;

    const details = document.createElement('details');
    const summary = document.createElement('summary');

    summary.appendChild(titleEl);
    details.appendChild(summary);
    for (const el of restEls) {
      details.appendChild(el);
    }
    textContainer.appendChild(details);
  };

  useEffect(() => {
    if (!isBrowser) return;

    adjustCalloutImg();

    // Notion 內容非同步載入，article-wrapper 可能延遲數秒才進 DOM。
    // MutationObserver 偵測 DOM 變化，wrapper + callout 出現時才標記。
    let observer = null;
    let observerTimeout = null;

    if (!markSpecialCallouts()) {
      observer = new MutationObserver(() => {
        if (markSpecialCallouts()) {
          observer.disconnect();
          clearTimeout(observerTimeout);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      observerTimeout = setTimeout(() => observer.disconnect(), 10000);
    }

    window.addEventListener('resize', adjustCalloutImg);
    return () => {
      if (observer) observer.disconnect();
      if (observerTimeout) clearTimeout(observerTimeout);
      window.removeEventListener('resize', adjustCalloutImg);
    };
  }, [router.asPath]);
};

export default useAdjustStyle;
