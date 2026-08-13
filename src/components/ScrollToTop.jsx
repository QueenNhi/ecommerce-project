import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 * Tự động cuộn màn hình lên vị trí đầu trang (Header) mỗi khi người dùng chuyển trang
 * hoặc thay đổi ID sản phẩm / query params.
 */
const ScrollToTop = () => {
    const { pathname, search, hash } = useLocation();

    useEffect(() => {
        // Cuộn ngay lập tức
        window.scrollTo(0, 0);

        // Đảm bảo cuộn lên đầu ngay cả khi React re-render DOM không đồng bộ
        const timer1 = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 0);

        const timer2 = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [pathname, search, hash]);

    return null;
};

export default ScrollToTop;
