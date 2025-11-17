import { useEffect, useState } from 'react';

/**
 * Hook để tính toán chiều cao động cho nội dung trong PageContainer
 * Đo chiều cao của header và breadcrumb để tính minHeight cho Card
 */
export function usePageContentHeight() {
  const [minHeight, setMinHeight] = useState<string>('calc(100vh - 200px)');

  useEffect(() => {
    const calculateHeight = () => {
      // Tìm PageContainer
      const pageContainer = document.querySelector('.ant-pro-page-container');
      if (!pageContainer) {
        // Fallback nếu không tìm thấy PageContainer
        setMinHeight('calc(100vh - 200px)');
        return;
      }

      // Tìm content wrapper của PageContainer
      const contentWrapper = pageContainer.querySelector(
        '.ant-pro-page-container-children-content',
      ) as HTMLElement;

      if (!contentWrapper) {
        setMinHeight('calc(100vh - 200px)');
        return;
      }

      // Lấy vị trí top của content wrapper (tính từ viewport)
      const rect = contentWrapper.getBoundingClientRect();
      const topOffset = rect.top;

      // Tính toán: 100vh - topOffset - padding bottom (khoảng 24px)
      const totalOffset = topOffset + 24;
      
      // Đảm bảo giá trị hợp lý (tối thiểu 150px, tối đa 300px)
      const clampedOffset = Math.max(150, Math.min(300, totalOffset));
      setMinHeight(`calc(100vh - ${clampedOffset}px)`);
    };

    // Delay một chút để đảm bảo DOM đã render xong
    const timeoutId = setTimeout(calculateHeight, 100);

    // Tính toán lại khi resize
    window.addEventListener('resize', calculateHeight);
    
    // Sử dụng ResizeObserver để theo dõi thay đổi của PageContainer
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

