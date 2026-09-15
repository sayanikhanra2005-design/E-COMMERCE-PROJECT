package com.infosys.springboard.authentication.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.springboard.authentication.dto.PaymentRequest;
import com.infosys.springboard.authentication.dto.PaymentResponse;
import com.infosys.springboard.authentication.entity.Order;
import com.infosys.springboard.authentication.entity.Payment;
import com.infosys.springboard.authentication.repository.OrderRepository;
import com.infosys.springboard.authentication.repository.PaymentRepository;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final EmailService emailService;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            EmailService emailService) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.emailService = emailService;
    }

    // =========================================================
    // PROCESS PAYMENT
    // =========================================================

    public PaymentResponse processPayment(
            PaymentRequest request,
            String customerEmail) {

        // =====================================================
        // VALIDATE ORDER ID
        // =====================================================

        if (request.getOrderId() == null) {

            throw new RuntimeException(
                    "Order ID is required");
        }

        // =====================================================
        // VALIDATE CUSTOMER EMAIL
        // =====================================================

        if (customerEmail == null
                || customerEmail.trim().isEmpty()) {

            throw new RuntimeException(
                    "Customer email is required");
        }

        // =====================================================
        // FIND ORDER
        // =====================================================

        Order order =
                orderRepository.findById(
                        request.getOrderId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found: "
                                                + request.getOrderId()));

        // =====================================================
        // VERIFY ORDER BELONGS TO CUSTOMER
        // =====================================================

        if (order.getCustomerEmail() == null
                || !order.getCustomerEmail()
                        .equalsIgnoreCase(
                                customerEmail)) {

            throw new RuntimeException(
                    "You are not authorized to make payment for this order");
        }

        // =====================================================
        // VALIDATE AMOUNT
        // =====================================================

        if (request.getAmount() == null
                || request.getAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Invalid payment amount");
        }

        // =====================================================
        // VALIDATE PAYMENT METHOD
        // =====================================================

        if (request.getPaymentMethod() == null
                || request.getPaymentMethod()
                        .trim().isEmpty()) {

            throw new RuntimeException(
                    "Payment method is required");
        }

        String paymentMethod =
                request.getPaymentMethod()
                        .trim()
                        .toUpperCase();

        if (!paymentMethod.equals("CARD")
                && !paymentMethod.equals("UPI")
                && !paymentMethod.equals("COD")) {

            throw new RuntimeException(
                    "Invalid payment method. Use CARD, UPI or COD");
        }

        // =====================================================
        // PREVENT DUPLICATE PAYMENT
        // =====================================================

        if (paymentRepository
                .findByOrderId(
                        request.getOrderId())
                .isPresent()) {

            throw new RuntimeException(
                    "Payment already exists for this order");
        }

        // =====================================================
        // PAYMENT STATUS
        // =====================================================

        String paymentStatus;

        if (paymentMethod.equals("COD")) {

            // COD payment is pending until delivery
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

        Payment payment =
                Payment.builder()
                        .orderId(
                                request.getOrderId())
                        .customerEmail(
                                customerEmail.trim())
                        .amount(
                                request.getAmount())
                        .paymentMethod(
                                paymentMethod)
                        .paymentStatus(
                                paymentStatus)
                        .transactionId(
                                transactionId)
                        .paymentDate(
                                LocalDateTime.now())
                        .build();

        // =====================================================
        // SAVE PAYMENT
        // =====================================================

        Payment savedPayment =
                paymentRepository.save(payment);

        // =====================================================
        // UPDATE ORDER PAYMENT STATUS
        // =====================================================

        order.setPaymentStatus(
                paymentStatus);

        order.setPaymentMethod(
                paymentMethod);

        orderRepository.save(order);

        // =====================================================
        // SEND PAYMENT EMAIL
        // =====================================================

        if ("SUCCESS".equalsIgnoreCase(
                paymentStatus)) {

            emailService.sendPaymentSuccessEmail(
                    order,
                    transactionId);

        } else if ("FAILED".equalsIgnoreCase(
                paymentStatus)) {

            emailService.sendPaymentFailedEmail(
                    order,
                    transactionId);
        }

        // =====================================================
        // RETURN RESPONSE
        // =====================================================

        return convertToResponse(
                savedPayment);
    }

    // =========================================================
    // GET PAYMENT BY ORDER
    // =========================================================

    public PaymentResponse getPaymentByOrderId(
            Long orderId,
            String customerEmail) {

        if (orderId == null) {

            throw new RuntimeException(
                    "Order ID is required");
        }

        Payment payment =
                paymentRepository
                        .findByOrderId(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found for this order"));

        // =====================================================
        // VERIFY CUSTOMER
        // =====================================================

        if (customerEmail == null
                || payment.getCustomerEmail() == null
                || !payment.getCustomerEmail()
                        .equalsIgnoreCase(
                                customerEmail)) {

            throw new RuntimeException(
                    "You are not authorized to view this payment");
        }

        return convertToResponse(
                payment);
    }

    // =========================================================
    // GET CUSTOMER PAYMENTS
    // =========================================================

    public List<PaymentResponse> getCustomerPayments(
            String customerEmail) {

        if (customerEmail == null
                || customerEmail.trim().isEmpty()) {

            throw new RuntimeException(
                    "Customer email is required");
        }

        return paymentRepository
                .findByCustomerEmail(
                        customerEmail)
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