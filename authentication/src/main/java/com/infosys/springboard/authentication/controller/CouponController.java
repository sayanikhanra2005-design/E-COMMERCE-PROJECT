package com.infosys.springboard.authentication.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.infosys.springboard.authentication.dto.CouponRequest;
import com.infosys.springboard.authentication.dto.CouponResponse;
import com.infosys.springboard.authentication.dto.CouponValidationResponse;
import com.infosys.springboard.authentication.service.CouponService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/coupons")
@CrossOrigin(origins = "http://localhost:5173")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    // =========================================================
    // CREATE COUPON
    // =========================================================

    @PostMapping
    public ResponseEntity<CouponResponse> createCoupon(
            @Valid @RequestBody CouponRequest request) {

        return ResponseEntity.ok(
                couponService.createCoupon(request));
    }

    // =========================================================
    // GET ALL COUPONS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {

        return ResponseEntity.ok(
                couponService.getAllCoupons());
    }

    // =========================================================
    // GET COUPON BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<CouponResponse> getCouponById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                couponService.getCouponById(id));
    }

    // =========================================================
    // UPDATE COUPON
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<CouponResponse> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request) {

        return ResponseEntity.ok(
                couponService.updateCoupon(id, request));
    }

    // =========================================================
    // ACTIVATE / DEACTIVATE
    // =========================================================

    @PutMapping("/{id}/toggle")
    public ResponseEntity<CouponResponse> toggleCoupon(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                couponService.toggleCoupon(id));
    }

    // =========================================================
    // DELETE COUPON
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCoupon(
            @PathVariable Long id) {

        couponService.deleteCoupon(id);

        return ResponseEntity.ok(
                "Coupon deleted successfully");
    }

    // =========================================================
    // VALIDATE COUPON
    // =========================================================

    @PostMapping("/validate")
    public ResponseEntity<CouponValidationResponse> validateCoupon(
            @RequestParam String code,
            @RequestParam BigDecimal orderAmount) {

        return ResponseEntity.ok(
                couponService.validateCoupon(
                        code,
                        orderAmount));
    }
}