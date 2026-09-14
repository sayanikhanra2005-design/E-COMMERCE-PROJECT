package com.infosys.springboard.authentication.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.dto.CouponRequest;
import com.infosys.springboard.authentication.dto.CouponResponse;
import com.infosys.springboard.authentication.dto.CouponValidationResponse;
import com.infosys.springboard.authentication.entity.Coupon;
import com.infosys.springboard.authentication.repository.CouponRepository;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    // =========================================================
    // CREATE COUPON
    // =========================================================

    public CouponResponse createCoupon(CouponRequest request) {

        String code = request.getCode()
                .trim()
                .toUpperCase();

        if (couponRepository.existsByCode(code)) {
            throw new RuntimeException(
                    "Coupon code already exists");
        }

        Coupon coupon = Coupon.builder()
                .code(code)
                .discountType(
                        request.getDiscountType()
                                .toUpperCase())
                .discountValue(
                        request.getDiscountValue())
                .minimumOrderAmount(
                        request.getMinimumOrderAmount())
                .maximumDiscount(
                        request.getMaximumDiscount())
                .startDate(
                        request.getStartDate())
                .expiryDate(
                        request.getExpiryDate())
                .usageLimit(
                        request.getUsageLimit())
                .usedCount(0)
                .active(
                        request.getActive() != null
                                ? request.getActive()
                                : true)
                .build();

        Coupon savedCoupon =
                couponRepository.save(coupon);

        return convertToResponse(savedCoupon);
    }

    // =========================================================
    // GET ALL COUPONS
    // =========================================================

    public List<CouponResponse> getAllCoupons() {

        return couponRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // GET COUPON BY ID
    // =========================================================

    public CouponResponse getCouponById(Long id) {

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Coupon not found"));

        return convertToResponse(coupon);
    }

    // =========================================================
    // UPDATE COUPON
    // =========================================================

    public CouponResponse updateCoupon(
            Long id,
            CouponRequest request) {

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Coupon not found"));

        String newCode = request.getCode()
                .trim()
                .toUpperCase();

        if (!coupon.getCode().equals(newCode)
                && couponRepository.existsByCode(newCode)) {

            throw new RuntimeException(
                    "Coupon code already exists");
        }

        coupon.setCode(newCode);

        coupon.setDiscountType(
                request.getDiscountType()
                        .toUpperCase());

        coupon.setDiscountValue(
                request.getDiscountValue());

        coupon.setMinimumOrderAmount(
                request.getMinimumOrderAmount());

        coupon.setMaximumDiscount(
                request.getMaximumDiscount());

        coupon.setStartDate(
                request.getStartDate());

        coupon.setExpiryDate(
                request.getExpiryDate());

        coupon.setUsageLimit(
                request.getUsageLimit());

        if (request.getActive() != null) {
            coupon.setActive(
                    request.getActive());
        }

        Coupon updatedCoupon =
                couponRepository.save(coupon);

        return convertToResponse(updatedCoupon);
    }

    // =========================================================
    // ACTIVATE / DEACTIVATE COUPON
    // =========================================================

    public CouponResponse toggleCoupon(Long id) {

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Coupon not found"));

        coupon.setActive(
                !Boolean.TRUE.equals(
                        coupon.getActive()));

        Coupon updatedCoupon =
                couponRepository.save(coupon);

        return convertToResponse(updatedCoupon);
    }

    // =========================================================
    // DELETE COUPON
    // =========================================================

    public void deleteCoupon(Long id) {

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Coupon not found"));

        couponRepository.delete(coupon);
    }

    // =========================================================
    // CUSTOMER COUPON VALIDATION
    // =========================================================

    public CouponValidationResponse validateCoupon(
            String code,
            BigDecimal orderAmount) {

        // Check coupon code
        if (code == null || code.trim().isEmpty()) {

            return new CouponValidationResponse(
                    false,
                    "Coupon code is required",
                    null,
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // Check order amount
        if (orderAmount == null
                || orderAmount.compareTo(
                        BigDecimal.ZERO) <= 0) {

            return new CouponValidationResponse(
                    false,
                    "Invalid order amount",
                    code,
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // Find coupon
        Coupon coupon = couponRepository
                .findByCode(
                        code.trim().toUpperCase())
                .orElse(null);

        if (coupon == null) {

            return new CouponValidationResponse(
                    false,
                    "Invalid coupon code",
                    code,
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // Check active status
        if (!Boolean.TRUE.equals(
                coupon.getActive())) {

            return new CouponValidationResponse(
                    false,
                    "Coupon is inactive",
                    coupon.getCode(),
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // Check start date
        LocalDateTime now =
                LocalDateTime.now();

        if (coupon.getStartDate() != null
                && now.isBefore(
                        coupon.getStartDate())) {

            return new CouponValidationResponse(
                    false,
                    "Coupon is not active yet",
                    coupon.getCode(),
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // Check expiry date
        if (coupon.getExpiryDate() != null
                && now.isAfter(
                        coupon.getExpiryDate())) {

            return new CouponValidationResponse(
                    false,
                    "Coupon has expired",
                    coupon.getCode(),
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // =====================================================
        // CHECK USAGE LIMIT
        // =====================================================

        Integer usedCount =
                coupon.getUsedCount() == null
                        ? 0
                        : coupon.getUsedCount();

        if (coupon.getUsageLimit() != null
                && usedCount >=
                        coupon.getUsageLimit()) {

            return new CouponValidationResponse(
                    false,
                    "Coupon usage limit reached",
                    coupon.getCode(),
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // =====================================================
        // CHECK MINIMUM ORDER AMOUNT
        // =====================================================

        if (coupon.getMinimumOrderAmount() != null
                && orderAmount.compareTo(
                        coupon.getMinimumOrderAmount()) < 0) {

            return new CouponValidationResponse(
                    false,
                    "Minimum order amount is ₹"
                            + coupon.getMinimumOrderAmount(),
                    coupon.getCode(),
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        BigDecimal discountAmount;

        // =====================================================
        // PERCENTAGE DISCOUNT
        // =====================================================

        if ("PERCENTAGE".equalsIgnoreCase(
                coupon.getDiscountType())) {

            discountAmount = orderAmount
                    .multiply(
                            coupon.getDiscountValue())
                    .divide(
                            BigDecimal.valueOf(100));

            // Maximum discount limit
            if (coupon.getMaximumDiscount() != null
                    && discountAmount.compareTo(
                            coupon.getMaximumDiscount()) > 0) {

                discountAmount =
                        coupon.getMaximumDiscount();
            }

        }

        // =====================================================
        // FIXED DISCOUNT
        // =====================================================

        else if ("FIXED".equalsIgnoreCase(
                coupon.getDiscountType())) {

            discountAmount =
                    coupon.getDiscountValue();

            // Discount cannot exceed order amount
            if (discountAmount.compareTo(
                    orderAmount) > 0) {

                discountAmount = orderAmount;
            }

        }

        // =====================================================
        // INVALID DISCOUNT TYPE
        // =====================================================

        else {

            return new CouponValidationResponse(
                    false,
                    "Invalid discount type",
                    coupon.getCode(),
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // =====================================================
        // CALCULATE FINAL AMOUNT
        // =====================================================

        BigDecimal finalAmount =
                orderAmount.subtract(
                        discountAmount);

        return new CouponValidationResponse(
                true,
                "Coupon applied successfully",
                coupon.getCode(),
                discountAmount,
                finalAmount
        );
    }

    // =========================================================
    // GET ACTIVE COUPONS FOR CUSTOMER
    // =========================================================

    public List<CouponResponse> getActiveCouponsForCustomer() {

        LocalDateTime now =
                LocalDateTime.now();

        return couponRepository.findByActive(true)
                .stream()

                // Coupon must have valid dates
                .filter(coupon ->
                        coupon.getStartDate() != null &&
                        coupon.getExpiryDate() != null &&
                        !now.isBefore(
                                coupon.getStartDate()) &&
                        !now.isAfter(
                                coupon.getExpiryDate())
                )

                // Coupon must not have reached usage limit
                .filter(coupon -> {

                    Integer usedCount =
                            coupon.getUsedCount() == null
                                    ? 0
                                    : coupon.getUsedCount();

                    return coupon.getUsageLimit() == null
                            || usedCount <
                                    coupon.getUsageLimit();
                })

                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // ENTITY → RESPONSE
    // =========================================================

    private CouponResponse convertToResponse(
            Coupon coupon) {

        return new CouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.getMinimumOrderAmount(),
                coupon.getMaximumDiscount(),
                coupon.getStartDate(),
                coupon.getExpiryDate(),
                coupon.getUsageLimit(),
                coupon.getUsedCount(),
                coupon.getActive()
        );
    }
}