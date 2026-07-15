import { isBrowser } from '@/lib/utils';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const getMentionInitials = (label = '') => {
  const trimmed = label.trim();
  if (!trimmed) return 'LK';

  const parts = trimmed
    .split(/\s+/)
    .map(part => part.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  const normalized = parts[0] || trimmed;
  const ascii = normalized.replace(/[^A-Za-z0-9]/g, '');
  if (ascii.length >= 2) return ascii.slice(0, 2).toUpperCase();
  return normalized.slice(0, 2).toUpperCase();
};

const useAdjustStyle = () => {
  const router = useRouter();

  const getCalloutRoots = (root = document) => {
    if (!root) return [];
    if (root === document) {
      return Array.from(document.querySelectorAll('.notion-callout-text'));
    }
    if (!(root instanceof Element)) return [];

    const callouts = [];
    if (root.matches('.notion-callout-text')) callouts.push(root);
    callouts.push(...root.querySelectorAll('.notion-callout-text'));
    return callouts;
  };

  const adjustCalloutImg = (root = document) => {
    const callOuts = getCalloutRoots(root);
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

  const adjustMentionIcons = (root = document) => {
    const callOuts = getCalloutRoots(root);
    const mentionIcons = callOuts.flatMap(callout =>
      Array.from(callout.querySelectorAll('.notion-link-mention-icon'))
    );

    mentionIcons.forEach(img => {
      if (img.dataset.fallbackBound === 'true') return;
      img.dataset.fallbackBound = 'true';

      const ensureFallback = () => {
        if (img.dataset.fallbackApplied === 'true') return;
        const link = img.closest('.notion-link-mention-link');
        const provider = link?.querySelector('.notion-link-mention-provider')?.textContent || '';
        const label = img.getAttribute('alt') || provider || 'Link';
        const fallback = document.createElement('span');
        fallback.className = 'notion-link-mention-fallback';
        fallback.textContent = getMentionInitials(label);
        fallback.setAttribute('aria-hidden', 'true');
        img.style.display = 'none';
        img.insertAdjacentElement('afterend', fallback);
        img.dataset.fallbackApplied = 'true';
      };

      const clearFallback = () => {
        if (img.dataset.fallbackApplied !== 'true') return;
        const next = img.nextElementSibling;
        if (next?.classList.contains('notion-link-mention-fallback')) {
          next.remove();
        }
        img.style.display = '';
        delete img.dataset.fallbackApplied;
      };

      img.addEventListener('error', ensureFallback);
      img.addEventListener('load', clearFallback);
      if (img.complete && img.naturalWidth > 0) clearFallback();
      else if (img.complete) ensureFallback();
    });

    const previewThumbs = callOuts.flatMap(callout =>
      Array.from(callout.querySelectorAll('.notion-link-mention-preview-thumbnail'))
    );
    previewThumbs.forEach(img => {
      if (img.dataset.previewBound === 'true') return;
      img.dataset.previewBound = 'true';

      const hidePreviewThumb = () => {
        img.style.display = 'none';
      };

      img.addEventListener('error', hidePreviewThumb);
      if (img.complete && img.naturalWidth === 0) hidePreviewThumb();
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

    const nodes = Array.from(textContainer.childNodes);
    if (nodes.length < 2) return;

    const details = document.createElement('details');
    const summary = document.createElement('summary');

    summary.appendChild(nodes[0]);
    details.appendChild(summary);
    for (let i = 1; i < nodes.length; i++) details.appendChild(nodes[i]);
    textContainer.appendChild(details);
  };

  useEffect(() => {
    if (!isBrowser) return;

    adjustCalloutImg();
    adjustMentionIcons();

    // Notion 內容非同步載入，article-wrapper 可能延遲數秒才進 DOM。
    // MutationObserver 偵測 DOM 變化，wrapper + callout 出現時才標記。
    let observer = null;
    let observerTimeout = null;

    markSpecialCallouts();
    observer = new MutationObserver(mutations => {
      markSpecialCallouts();
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          adjustCalloutImg(node);
          adjustMentionIcons(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    observerTimeout = setTimeout(() => observer.disconnect(), 10000);

    window.addEventListener('resize', adjustCalloutImg);
    return () => {
      if (observer) observer.disconnect();
      if (observerTimeout) clearTimeout(observerTimeout);
      window.removeEventListener('resize', adjustCalloutImg);
    };
  }, [router.asPath]);
};

export default useAdjustStyle;
