import API from "./api";

/**
 * Service kiểm tra và áp dụng mã giảm giá (Coupon)
 * @param {string} code Mã giảm giá do người dùng nhập
 * @param {number} totalAmount Tổng tiền đơn hàng trước giảm giá
 * @returns {Promise<{success: boolean, message: string, coupon?: object}>}
 */
export const validateCoupon = async (code, totalAmount = 0) => {
    if (!code || !code.trim()) {
        return {
            success: false,
            message: "Vui lòng nhập mã giảm giá."
        };
    }

    const upperCode = code.trim().toUpperCase();

    try {
        const res = await API.post("/promotions/validate", {
            code: upperCode,
            totalAmount
        });

        if (res.data && res.data.success) {
            return res.data;
        }

        return {
            success: false,
            message: res.data?.message || "Mã giảm giá không hợp lệ."
        };
    } catch (err) {
        const serverMsg = err.response?.data?.message;
        if (serverMsg) {
            return {
                success: false,
                message: serverMsg
            };
        }

        // Mã giảm giá thử nghiệm / fallback client khi offline hoặc backend chưa có sẵn dữ liệu
        const demoCoupons = {
            HERITAGE10: { type: "percent", value: 10, minOrder: 0, title: "Giảm 10%" },
            WELCOME20: { type: "percent", value: 20, minOrder: 500000, title: "Giảm 20%" },
            LUXURY500K: { type: "fixed", value: 500000, minOrder: 2000000, title: "Giảm 500.000₫" },
            VIP100K: { type: "fixed", value: 100000, minOrder: 0, title: "Giảm 100.000₫" }
        };

        const promo = demoCoupons[upperCode];
        if (promo) {
            if (totalAmount < promo.minOrder) {
                return {
                    success: false,
                    message: `Đơn hàng tối thiểu ${promo.minOrder.toLocaleString("vi-VN")}₫ mới áp dụng được mã này.`
                };
            }

            let calculatedDiscount = 0;
            if (promo.type === "percent") {
                calculatedDiscount = (totalAmount * promo.value) / 100;
            } else {
                calculatedDiscount = promo.value;
            }

            return {
                success: true,
                message: "Áp dụng mã giảm giá thành công!",
                coupon: {
                    code: upperCode,
                    discount: calculatedDiscount,
                    calculatedDiscount,
                    type: promo.type,
                    value: promo.value
                }
            };
        }

        return {
            success: false,
            message: "Mã giảm giá không hợp lệ hoặc đã hết hạn."
        };
    }
};

export default {
    validateCoupon
};
