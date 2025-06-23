'use client';

import { useEffect } from 'react';

export default function HideNextIndicator() {
  useEffect(() => {
    const hideNextJsToast = () => {
      const portals = document.querySelectorAll('nextjs-portal');
      portals.forEach((portal) => {
        if (portal.shadowRoot) {
          const toast = portal.shadowRoot.querySelector('.nextjs-toast') as HTMLElement | null;
          const indicator = portal.shadowRoot.querySelector('.nextjs-static-indicator-toast-wrapper') as HTMLElement | null;
          
          if (toast) toast.style.display = 'none';
          if (indicator) indicator.style.display = 'none';
        }
      });
    };

    hideNextJsToast();

    const observer = new MutationObserver(hideNextJsToast);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
