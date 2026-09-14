package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.dto.PaymentRequest;
import com.infosys.springboard.authentication.dto.PaymentResponse;
import com.infosys.springboard.authentication.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/customer/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService) {

        this.paymentService = paymentService;
    }

    // =========================================================
    // PROCESS PAYMENT
    // =========================================================

    @PostMapping
    public ResponseEntity<PaymentResponse> processPayment(
            @Valid @RequestBody PaymentRequest request,
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        PaymentResponse response =
                paymentService.processPayment(
                        request,
                        customerEmail
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // GET PAYMENT FOR AN ORDER
    // =========================================================

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(
            @PathVariable Long orderId,
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        PaymentResponse response =
                paymentService.getPaymentByOrderId(
                        orderId,
                        customerEmail
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // GET ALL CUSTOMER PAYMENTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getCustomerPayments(
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        return ResponseEntity.ok(
                paymentService.getCustomerPayments(
                        customerEmail
                )
        );
    }
}