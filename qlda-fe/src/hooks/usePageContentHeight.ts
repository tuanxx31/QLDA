import { useEffect, useState } from 'react';


export function usePageContentHeight() {
  const [minHeight, setMinHeight] = useState<string>('calc(100vh - 220px)');

  useEffect(() => {
    const calculateHeight = () => {
      const pageContainer = document.querySelector('.ant-pro-page-container');
      if (!pageContainer) {
        setMinHeight('calc(100vh - 220px)');
        return;
      }

      const contentWrapper = pageContainer.querySelector(
        '.ant-pro-page-container-children-content',
      ) as HTMLElement;

      if (!contentWrapper) {
        setMinHeight('calc(100vh - 220px)');
        return;
      }

      const rect = contentWrapper.getBoundingClientRect();
      const topOffset = rect.top;

      const totalOffset = topOffset + 24;
      
      const clampedOffset = Math.max(150, Math.min(400, totalOffset));
      setMinHeight(`calc(100vh - ${clampedOffset}px)`);
    };

    const timeoutId = setTimeout(calculateHeight, 100);

    window.addEventListener('resize', calculateHeight);
    
    const observer = new ResizeObserver(() => {
      setTimeout(calculateHeight, 50);
    });
    
    const pageContainer = document.querySelector('.ant-pro-page-container');
    if (pageContainer) {
      observer.observe(pageContainer);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateHeight);
      observer.disconnect();
    };
  }, []);

  return { minHeight };
}

