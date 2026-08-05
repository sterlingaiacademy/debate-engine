import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const applyScroll = () => {
      try {
        window.scrollTo({ top: 0, behavior: 'instant' });
        const mainContent = document.getElementById('main-scroll-container');
        if (mainContent) {
          mainContent.scrollTop = 0;
          mainContent.scrollTo({ top: 0, behavior: 'instant' });
        }
        const root = document.getElementById('root');
        if (root) {
          root.scrollTop = 0;
        }
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch (err) {
        console.error('ScrollToTop error', err);
      }
    };

    // Apply immediately
    applyScroll();
    
    // Apply using requestAnimationFrame for the next paint
    requestAnimationFrame(applyScroll);

    // Apply after a delay to catch lazy-loaded routes or data fetching
    const timer1 = setTimeout(applyScroll, 50);
    const timer2 = setTimeout(applyScroll, 150);
    const timer3 = setTimeout(applyScroll, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname]);

  return null;
}
