import { isBrowser } from '@/lib/utils';
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
  const getCalloutRoots = (root = document) => {
    if (!root) return []

    if (root === document) {
      return Array.from(document.querySelectorAll('.notion-callout-text'))
    }

    if (!(root instanceof Element)) return []

    const callouts = []
    if (root.matches('.notion-callout-text')) {
      callouts.push(root)
    }

    callouts.push(...root.querySelectorAll('.notion-callout-text'))
    return callouts
  }

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
    const callOuts = getCalloutRoots(root)
    const mentionIcons = callOuts.flatMap(callout =>
      Array.from(callout.querySelectorAll('.notion-link-mention-icon'))
    )

    mentionIcons.forEach((img) => {
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

      const syncState = () => {
        if (img.complete && img.naturalWidth > 0) {
          clearFallback();
        } else if (img.complete) {
          ensureFallback();
        }
      };

      img.addEventListener('error', ensureFallback);
      img.addEventListener('load', clearFallback);
      syncState();
    });

    const previewThumbs = callOuts.flatMap(callout =>
      Array.from(callout.querySelectorAll('.notion-link-mention-preview-thumbnail'))
    )
    previewThumbs.forEach((img) => {
      if (img.dataset.previewBound === 'true') return;
      img.dataset.previewBound = 'true';

      const hidePreviewThumb = () => {
        img.style.display = 'none';
      };

      img.addEventListener('error', hidePreviewThumb);
      if (img.complete && img.naturalWidth === 0) {
        hidePreviewThumb();
      }
    });
  };

  useEffect(() => {
    if (!isBrowser) return undefined;

    adjustCalloutImg();
    adjustMentionIcons();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          adjustCalloutImg(node);
          adjustMentionIcons(node);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', adjustCalloutImg);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', adjustCalloutImg);
    };
  }, []);
};

export default useAdjustStyle;
