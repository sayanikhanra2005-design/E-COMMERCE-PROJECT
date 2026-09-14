package com.infosys.springboard.authentication.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.dto.PaymentRequest;
import com.infosys.springboard.authentication.dto.PaymentResponse;
import com.infosys.springboard.authentication.entity.Payment;
import com.infosys.springboard.authentication.repository.PaymentRepository;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    // =========================================================
    // PROCESS PAYMENT
    // =========================================================

    public PaymentResponse processPayment(
            PaymentRequest request,
            String customerEmail) {

        // Validate order ID
        if (request.getOrderId() == null) {
            throw new RuntimeException(
                    "Order ID is required"
            );
        }

        // Validate customer email
        if (customerEmail == null
                || customerEmail.trim().isEmpty()) {

            throw new RuntimeException(
                    "Customer email is required"
            );
        }

        // Validate amount
        if (request.getAmount() == null
                || request.getAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Invalid payment amount"
            );
        }

        // Validate payment method
        if (request.getPaymentMethod() == null
                || request.getPaymentMethod()
                        .trim().isEmpty()) {

            throw new RuntimeException(
                    "Payment method is required"
            );
        }

        String paymentMethod =
                request.getPaymentMethod()
                        .trim()
                        .toUpperCase();

        // Allow only supported payment methods
        if (!paymentMethod.equals("CARD")
                && !paymentMethod.equals("UPI")
                && !paymentMethod.equals("COD")) {

            throw new RuntimeException(
                    "Invalid payment method. Use CARD, UPI or COD"
            );
        }

        // =====================================================
        // PREVENT DUPLICATE PAYMENT
        // =====================================================

        if (paymentRepository
                .findByOrderId(request.getOrderId())
                .isPresent()) {

            throw new RuntimeException(
                    "Payment already exists for this order"
            );
        }

        // =====================================================
        // PAYMENT STATUS
        // =====================================================

        String paymentStatus;

        if (paymentMethod.equals("COD")) {

            // Cash on Delivery remains pending
            paymentStatus = "PENDING";

        } else {

            // Demo payment:
            // CARD and UPI are automatically successful
            paymentStatus = "SUCCESS";
        }

        // =====================================================
        // GENERATE TRANSACTION ID
        // =====================================================

        String transactionId =
                "TXN-"
                        + UUID.randomUUID()
                                .toString()
                                .substring(0, 8)
                                .toUpperCase();

        // =====================================================
        // CREATE PAYMENT
        // =====================================================

        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .customerEmail(customerEmail.trim())
                .amount(request.getAmount())
                .paymentMethod(paymentMethod)
                .paymentStatus(paymentStatus)
                .transactionId(transactionId)
                .paymentDate(LocalDateTime.now())
                .build();

        // =====================================================
        // SAVE PAYMENT
        // =====================================================

        Payment savedPayment =
                paymentRepository.save(payment);

        return convertToResponse(savedPayment);
    }

    // =========================================================
    // GET PAYMENT BY ORDER
    // =========================================================

    public PaymentResponse getPaymentByOrderId(
            Long orderId,
            String customerEmail) {

        if (orderId == null) {
            throw new RuntimeException(
                    "Order ID is required"
            );
        }

        Payment payment =
                paymentRepository
                        .findByOrderId(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found for this order"
                                )
                        );

        // Make sure the customer owns the payment
        if (customerEmail == null
                || payment.getCustomerEmail() == null
                || !payment.getCustomerEmail()
                        .equalsIgnoreCase(customerEmail)) {

            throw new RuntimeException(
                    "You are not authorized to view this payment"
            );
        }

        return convertToResponse(payment);
    }

    // =========================================================
    // GET CUSTOMER PAYMENTS
    // =========================================================

    public List<PaymentResponse> getCustomerPayments(
            String customerEmail) {

        if (customerEmail == null
                || customerEmail.trim().isEmpty()) {

            throw new RuntimeException(
                    "Customer email is required"
            );
        }

        return paymentRepository
                .findByCustomerEmail(customerEmail)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // CONVERT ENTITY TO RESPONSE
    // =========================================================

    private PaymentResponse convertToResponse(
            Payment payment) {

        return new PaymentResponse(
                payment.getId(),
                payment.getOrderId(),
                payment.getCustomerEmail(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getPaymentStatus(),
                payment.getTransactionId(),
                payment.getPaymentDate()
        );
    }
}