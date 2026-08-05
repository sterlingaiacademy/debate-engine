import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    try {
      // Synchronously reset scroll before paint
      window.scrollTo(0, 0);
      const mainContent = document.getElementById('main-scroll-container');
      if (mainContent) {
        mainContent.scrollTop = 0;
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
  }, [pathname]);

  return null;
}
