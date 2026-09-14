package com.infosys.springboard.authentication.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.springboard.authentication.dto.OrderItemRequest;
import com.infosys.springboard.authentication.dto.OrderItemResponse;
import com.infosys.springboard.authentication.dto.OrderRequest;
import com.infosys.springboard.authentication.dto.OrderResponse;
import com.infosys.springboard.authentication.entity.Address;
import com.infosys.springboard.authentication.entity.Coupon;
import com.infosys.springboard.authentication.entity.Inventory;
import com.infosys.springboard.authentication.entity.Order;
import com.infosys.springboard.authentication.entity.OrderItem;
import com.infosys.springboard.authentication.entity.Product;
import com.infosys.springboard.authentication.repository.CouponRepository;
import com.infosys.springboard.authentication.repository.InventoryRepository;
import com.infosys.springboard.authentication.repository.OrderItemRepository;
import com.infosys.springboard.authentication.repository.OrderRepository;
import com.infosys.springboard.authentication.repository.ProductRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CouponRepository couponRepository;
    private final CommissionService commissionService;

    @PersistenceContext
    private EntityManager entityManager;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            InventoryRepository inventoryRepository,
            CouponRepository couponRepository,
            CommissionService commissionService) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.couponRepository = couponRepository;
        this.commissionService = commissionService;
    }

    // =========================================================
    // CREATE ORDER
    // =========================================================

    public OrderResponse createOrder(
            OrderRequest request,
            String customerEmail) {

        if (request == null
                || request.getItems() == null
                || request.getItems().isEmpty()) {

            throw new RuntimeException(
                    "Order must contain at least one product");
        }

        // =====================================================
        // VALIDATE ADDRESS
        // =====================================================

        if (request.getAddressId() == null) {

            throw new RuntimeException(
                    "Delivery address is required");
        }

        Address address = entityManager.createQuery(
                "SELECT a FROM Address a "
                        + "WHERE a.id = :addressId "
                        + "AND LOWER(a.user.email) = LOWER(:email)",
                Address.class)
                .setParameter(
                        "addressId",
                        request.getAddressId())
                .setParameter(
                        "email",
                        customerEmail)
                .getResultStream()
                .findFirst()
                .orElse(null);

        if (address == null) {

            throw new RuntimeException(
                    "Invalid delivery address");
        }

        // =====================================================
        // VALIDATE PAYMENT METHOD
        // =====================================================

        if (request.getPaymentMethod() == null
                || request.getPaymentMethod()
                .trim()
                .isEmpty()) {

            throw new RuntimeException(
                    "Payment method is required");
        }

        String paymentMethod =
                request.getPaymentMethod()
                        .trim()
                        .toUpperCase();

        if (!paymentMethod.equals("COD")
                && !paymentMethod.equals("CARD")
                && !paymentMethod.equals("UPI")) {

            throw new RuntimeException(
                    "Invalid payment method. "
                            + "Allowed methods: COD, CARD, UPI");
        }

        BigDecimal subtotal = BigDecimal.ZERO;

        List<Product> products = new ArrayList<>();

        Coupon appliedCoupon = null;

        // =====================================================
        // CHECK PRODUCTS AND STOCK
        // =====================================================

        for (OrderItemRequest itemRequest :
                request.getItems()) {

            Product product =
                    productRepository
                            .findById(
                                    itemRequest.getProductId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Product not found: "
                                                    + itemRequest
                                                    .getProductId()));

            if (itemRequest.getQuantity() == null
                    || itemRequest.getQuantity() <= 0) {

                throw new RuntimeException(
                        "Quantity must be greater than zero");
            }

            if (product.getQuantity() == null
                    || product.getQuantity()
                    < itemRequest.getQuantity()) {

                throw new RuntimeException(
                        "Insufficient stock for product: "
                                + product.getName());
            }

            Inventory inventory =
                    inventoryRepository
                            .findByProductId(
                                    product.getId())
                            .orElse(null);

            if (inventory != null
                    && inventory.getAvailableQuantity()
                    < itemRequest.getQuantity()) {

                throw new RuntimeException(
                        "Insufficient inventory for product: "
                                + product.getName());
            }

            BigDecimal itemSubtotal =
                    product.getPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            itemRequest
                                                    .getQuantity()));

            subtotal =
                    subtotal.add(itemSubtotal);

            products.add(product);
        }

        // =====================================================
        // COUPON
        // =====================================================

        BigDecimal discount = BigDecimal.ZERO;

        String couponCode =
                request.getCouponCode();

        if (couponCode != null
                && !couponCode.trim().isEmpty()) {

            couponCode =
                    couponCode.trim().toUpperCase();

            appliedCoupon =
                    couponRepository
                            .findByCode(couponCode)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Invalid coupon code"));

            LocalDateTime now =
                    LocalDateTime.now();

            if (!Boolean.TRUE.equals(
                    appliedCoupon.getActive())) {

                throw new RuntimeException(
                        "Coupon is inactive");
            }

            if (appliedCoupon.getStartDate() != null
                    && now.isBefore(
                            appliedCoupon.getStartDate())) {

                throw new RuntimeException(
                        "Coupon is not active yet");
            }

            if (appliedCoupon.getExpiryDate() != null
                    && now.isAfter(
                            appliedCoupon.getExpiryDate())) {

                throw new RuntimeException(
                        "Coupon has expired");
            }

            int usedCount =
                    appliedCoupon.getUsedCount() == null
                            ? 0
                            : appliedCoupon.getUsedCount();

            if (appliedCoupon.getUsageLimit() != null
                    && usedCount
                    >= appliedCoupon.getUsageLimit()) {

                throw new RuntimeException(
                        "Coupon usage limit reached");
            }

            if (appliedCoupon
                    .getMinimumOrderAmount() != null
                    && subtotal.compareTo(
                            appliedCoupon
                                    .getMinimumOrderAmount()) < 0) {

                throw new RuntimeException(
                        "Minimum order amount for this coupon is "
                                + appliedCoupon
                                .getMinimumOrderAmount());
            }

            if (appliedCoupon.getDiscountValue() == null
                    || appliedCoupon
                    .getDiscountValue()
                    .compareTo(BigDecimal.ZERO) <= 0) {

                throw new RuntimeException(
                        "Invalid coupon discount");
            }

            String discountType =
                    appliedCoupon.getDiscountType() == null
                            ? ""
                            : appliedCoupon
                            .getDiscountType()
                            .trim()
                            .toUpperCase();

            if ("PERCENTAGE".equals(discountType)
                    || "PERCENT".equals(discountType)) {

                discount =
                        subtotal
                                .multiply(
                                        appliedCoupon
                                                .getDiscountValue())
                                .divide(
                                        BigDecimal.valueOf(100));
            }

            else if ("FIXED".equals(discountType)
                    || "FLAT".equals(discountType)
                    || "AMOUNT".equals(discountType)) {

                discount =
                        appliedCoupon.getDiscountValue();
            }

            else {

                throw new RuntimeException(
                        "Invalid coupon discount type");
            }

            if (appliedCoupon
                    .getMaximumDiscount() != null
                    && discount.compareTo(
                            appliedCoupon
                                    .getMaximumDiscount()) > 0) {

                discount =
                        appliedCoupon
                                .getMaximumDiscount();
            }

            if (discount.compareTo(subtotal) > 0) {

                discount = subtotal;
            }
        }

        // =====================================================
        // FINAL TOTAL
        // =====================================================

        BigDecimal totalAmount =
                subtotal.subtract(discount);

        if (totalAmount.compareTo(
                BigDecimal.ZERO) < 0) {

            totalAmount = BigDecimal.ZERO;
        }

        // =====================================================
        // CREATE ORDER
        // =====================================================

        Order order =
                Order.builder()
                        .customerEmail(customerEmail)
                        .addressId(
                                request.getAddressId())
                        .paymentMethod(
                                paymentMethod)
                        .paymentStatus(
                                "PENDING")
                        .totalAmount(
                                totalAmount)
                        .status(
                                "PENDING")
                        .orderDate(
                                LocalDateTime.now())
                        .returnStatus(null)
                        .build();

        Order savedOrder =
                orderRepository.save(order);

        // =====================================================
        // CREATE ORDER ITEMS
        // + COMMISSION
        // + STOCK UPDATE
        // =====================================================

        for (int i = 0;
             i < request.getItems().size();
             i++) {

            OrderItemRequest itemRequest =
                    request.getItems().get(i);

            Product product =
                    products.get(i);

            BigDecimal itemSubtotal =
                    product.getPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            itemRequest
                                                    .getQuantity()));

            OrderItem orderItem =
                    OrderItem.builder()
                            .orderId(
                                    savedOrder.getId())
                            .productId(
                                    product.getId())
                            .productName(
                                    product.getName())
                            .vendorEmail(
                                    product.getVendorEmail())
                            .quantity(
                                    itemRequest
                                            .getQuantity())
                            .price(
                                    product.getPrice())
                            .subtotal(
                                    itemSubtotal)
                            .build();

            orderItemRepository.save(
                    orderItem);

            // =================================================
            // VENDOR COMMISSION
            // =================================================

            commissionService.calculateCommission(
                    savedOrder.getId(),
                    product.getId(),
                    product.getVendorEmail(),
                    itemSubtotal
            );

            // =================================================
            // REDUCE PRODUCT STOCK
            // =================================================

            int newProductQuantity =
                    product.getQuantity()
                            - itemRequest.getQuantity();

            product.setQuantity(
                    newProductQuantity);

            productRepository.save(
                    product);

            // =================================================
            // REDUCE INVENTORY
            // =================================================

            Inventory inventory =
                    inventoryRepository
                            .findByProductId(
                                    product.getId())
                            .orElse(null);

            if (inventory != null) {

                int currentQuantity =
                        inventory.getQuantity() == null
                                ? 0
                                : inventory.getQuantity();

                int currentReserved =
                        inventory.getReservedQuantity() == null
                                ? 0
                                : inventory
                                .getReservedQuantity();

                int newQuantity =
                        currentQuantity
                                - itemRequest
                                .getQuantity();

                int newReserved =
                        currentReserved
                                + itemRequest
                                .getQuantity();

                if (newQuantity < 0) {
                    newQuantity = 0;
                }

                inventory.setQuantity(
                        newQuantity);

                inventory.setReservedQuantity(
                        newReserved);

                inventory.setLastUpdated(
                        LocalDateTime.now());

                inventoryRepository.save(
                        inventory);
            }
        }

        // =====================================================
        // UPDATE COUPON USAGE
        // =====================================================

        if (appliedCoupon != null) {

            int usedCount =
                    appliedCoupon.getUsedCount() == null
                            ? 0
                            : appliedCoupon.getUsedCount();

            appliedCoupon.setUsedCount(
                    usedCount + 1);

            couponRepository.save(
                    appliedCoupon);
        }

        // =====================================================
        // RETURN ORDER RESPONSE
        // =====================================================

        return convertToResponse(
                savedOrder,
                orderItemRepository.findByOrderId(
                        savedOrder.getId()));
    }

    // =========================================================
    // GET ALL ORDERS
    // =========================================================

    public List<OrderResponse> getAllOrders() {

        List<Order> orders =
                orderRepository.findAll();

        List<OrderResponse> responses =
                new ArrayList<>();

        for (Order order : orders) {

            List<OrderItem> items =
                    orderItemRepository.findByOrderId(
                            order.getId());

            responses.add(
                    convertToResponse(
                            order,
                            items));
        }

        return responses;
    }

    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    public OrderResponse getOrderById(Long id) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found: "
                                                + id));

        List<OrderItem> items =
                orderItemRepository.findByOrderId(id);

        return convertToResponse(
                order,
                items);
    }

    // =========================================================
    // GET CUSTOMER ORDERS
    // =========================================================

    public List<OrderResponse> getCustomerOrders(
            String customerEmail) {

        List<Order> orders =
                orderRepository
                        .findByCustomerEmail(
                                customerEmail);

        List<OrderResponse> responses =
                new ArrayList<>();

        for (Order order : orders) {

            List<OrderItem> items =
                    orderItemRepository.findByOrderId(
                            order.getId());

            responses.add(
                    convertToResponse(
                            order,
                            items));
        }

        return responses;
    }

    // =========================================================
    // GET CUSTOMER ORDER BY ID
    // =========================================================

    public OrderResponse getCustomerOrderById(
            Long id,
            String customerEmail) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        if (!order.getCustomerEmail()
                .equalsIgnoreCase(
                        customerEmail)) {

            throw new RuntimeException(
                    "You are not authorized to view this order");
        }

        List<OrderItem> items =
                orderItemRepository.findByOrderId(id);

        return convertToResponse(
                order,
                items);
    }

    // =========================================================
    // GET VENDOR ORDERS
    // =========================================================

    public List<OrderResponse> getVendorOrders(
            String vendorEmail) {

        List<OrderItem> vendorItems =
                orderItemRepository
                        .findByVendorEmail(
                                vendorEmail);

        List<OrderResponse> responses =
                new ArrayList<>();

        for (OrderItem vendorItem : vendorItems) {

            if (vendorItem.getOrderId() == null) {
                continue;
            }

            Order order =
                    orderRepository.findById(
                            vendorItem.getOrderId())
                            .orElse(null);

            if (order == null) {
                continue;
            }

            boolean alreadyAdded = false;

            for (OrderResponse response :
                    responses) {

                if (response.getId()
                        .equals(order.getId())) {

                    alreadyAdded = true;
                    break;
                }
            }

            if (alreadyAdded) {
                continue;
            }

            List<OrderItem> allItems =
                    orderItemRepository
                            .findByOrderId(
                                    order.getId());

            List<OrderItem> filteredItems =
                    new ArrayList<>();

            for (OrderItem item : allItems) {

                if (item.getVendorEmail() != null
                        && item.getVendorEmail()
                        .equalsIgnoreCase(
                                vendorEmail)) {

                    filteredItems.add(item);
                }
            }

            responses.add(
                    convertToResponse(
                            order,
                            filteredItems));
        }

        return responses;
    }

    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    public OrderResponse updateOrderStatus(
            Long id,
            String status) {

        if (status == null
                || status.trim().isEmpty()) {

            throw new RuntimeException(
                    "Order status is required");
        }

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        String newStatus =
                status.trim().toUpperCase();

        validateStatus(newStatus);

        validateStatusTransition(
                order.getStatus(),
                newStatus);

        order.setStatus(newStatus);

        Order savedOrder =
                orderRepository.save(order);

        return convertToResponse(
                savedOrder,
                orderItemRepository.findByOrderId(id));
    }

    // =========================================================
    // UPDATE VENDOR ORDER STATUS
    // =========================================================

    public OrderResponse updateVendorOrderStatus(
            Long id,
            String status,
            String vendorEmail) {

        if (status == null
                || status.trim().isEmpty()) {

            throw new RuntimeException(
                    "Order status is required");
        }

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        List<OrderItem> items =
                orderItemRepository
                        .findByOrderId(id);

        boolean belongsToVendor = false;

        for (OrderItem item : items) {

            if (item.getVendorEmail() != null
                    && item.getVendorEmail()
                    .equalsIgnoreCase(
                            vendorEmail)) {

                belongsToVendor = true;
                break;
            }
        }

        if (!belongsToVendor) {

            throw new RuntimeException(
                    "You are not authorized to update this order");
        }

        String newStatus =
                status.trim().toUpperCase();

        validateStatus(newStatus);

        validateStatusTransition(
                order.getStatus(),
                newStatus);

        order.setStatus(newStatus);

        Order savedOrder =
                orderRepository.save(order);

        List<OrderItem> vendorItems =
                new ArrayList<>();

        for (OrderItem item : items) {

            if (item.getVendorEmail() != null
                    && item.getVendorEmail()
                    .equalsIgnoreCase(
                            vendorEmail)) {

                vendorItems.add(item);
            }
        }

        return convertToResponse(
                savedOrder,
                vendorItems);
    }

    // =========================================================
    // CANCEL ORDER
    // =========================================================

    public OrderResponse cancelOrder(
            Long id,
            String customerEmail) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        if (!order.getCustomerEmail()
                .equalsIgnoreCase(
                        customerEmail)) {

            throw new RuntimeException(
                    "You are not authorized to cancel this order");
        }

        String currentStatus =
                order.getStatus() == null
                        ? ""
                        : order.getStatus()
                        .toUpperCase();

        if (!currentStatus.equals("PENDING")
                && !currentStatus.equals(
                "CONFIRMED")) {

            throw new RuntimeException(
                    "Order cannot be cancelled after shipping");
        }

        order.setStatus("CANCELLED");

        restoreStock(id);

        Order savedOrder =
                orderRepository.save(order);

        return convertToResponse(
                savedOrder,
                orderItemRepository.findByOrderId(id));
    }

    // =========================================================
    // REQUEST RETURN
    // =========================================================

    public OrderResponse requestReturn(
            Long id,
            String customerEmail,
            String reason) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        if (!order.getCustomerEmail()
                .equalsIgnoreCase(
                        customerEmail)) {

            throw new RuntimeException(
                    "You are not authorized to request a return");
        }

        if (!"DELIVERED".equalsIgnoreCase(
                order.getStatus())) {

            throw new RuntimeException(
                    "Only delivered orders can be returned");
        }

        if (reason == null
                || reason.trim().isEmpty()) {

            throw new RuntimeException(
                    "Return reason is required");
        }

        if (order.getReturnStatus() != null
                && !"NONE".equalsIgnoreCase(
                order.getReturnStatus())) {

            throw new RuntimeException(
                    "Return has already been requested for this order");
        }

        order.setReturnStatus(
                "RETURN_REQUESTED");

        order.setReturnReason(
                reason.trim());

        order.setReturnRequestedDate(
                LocalDateTime.now());

        order.setRefundAmount(
                order.getTotalAmount());

        Order savedOrder =
                orderRepository.save(order);

        return convertToResponse(
                savedOrder,
                orderItemRepository.findByOrderId(id));
    }

    // =========================================================
    // APPROVE RETURN
    // =========================================================

    public OrderResponse approveReturn(Long id) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        if (!"RETURN_REQUESTED"
                .equalsIgnoreCase(
                        order.getReturnStatus())) {

            throw new RuntimeException(
                    "Return is not awaiting approval");
        }

        order.setReturnStatus(
                "RETURN_APPROVED");

        restoreStock(id);

        Order savedOrder =
                orderRepository.save(order);

        return convertToResponse(
                savedOrder,
                orderItemRepository.findByOrderId(id));
    }

    // =========================================================
    // REJECT RETURN
    // =========================================================

    public OrderResponse rejectReturn(Long id) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        if (!"RETURN_REQUESTED"
                .equalsIgnoreCase(
                        order.getReturnStatus())) {

            throw new RuntimeException(
                    "Return is not awaiting approval");
        }

        order.setReturnStatus(
                "RETURN_REJECTED");

        Order savedOrder =
                orderRepository.save(order);

        return convertToResponse(
                savedOrder,
                orderItemRepository.findByOrderId(id));
    }

    // =========================================================
    // PROCESS REFUND
    // =========================================================

    public OrderResponse processRefund(Long id) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        if (!"RETURN_APPROVED"
                .equalsIgnoreCase(
                        order.getReturnStatus())) {

            throw new RuntimeException(
                    "Return must be approved before refund");
        }

        order.setRefundAmount(
                order.getTotalAmount());

        order.setRefundTransactionId(
                "REFUND-"
                        + System.currentTimeMillis());

        order.setReturnStatus(
                "REFUNDED");

        order.setRefundDate(
                LocalDateTime.now());

        Order savedOrder =
                orderRepository.save(order);

        return convertToResponse(
                savedOrder,
                orderItemRepository.findByOrderId(id));
    }

    // =========================================================
    // RESTORE STOCK
    // =========================================================

    private void restoreStock(Long orderId) {

        List<OrderItem> items =
                orderItemRepository
                        .findByOrderId(orderId);

        for (OrderItem item : items) {

            if (item.getProductId() == null
                    || item.getQuantity() == null) {

                continue;
            }

            Product product =
                    productRepository
                            .findById(
                                    item.getProductId())
                            .orElse(null);

            if (product != null) {

                int currentQuantity =
                        product.getQuantity() == null
                                ? 0
                                : product.getQuantity();

                product.setQuantity(
                        currentQuantity
                                + item.getQuantity());

                productRepository.save(product);
            }

            Inventory inventory =
                    inventoryRepository
                            .findByProductId(
                                    item.getProductId())
                            .orElse(null);

            if (inventory != null) {

                int currentQuantity =
                        inventory.getQuantity() == null
                                ? 0
                                : inventory.getQuantity();

                int currentReserved =
                        inventory.getReservedQuantity() == null
                                ? 0
                                : inventory.getReservedQuantity();

                int newQuantity =
                        currentQuantity
                                + item.getQuantity();

                int newReserved =
                        Math.max(
                                0,
                                currentReserved
                                        - item.getQuantity());

                inventory.setQuantity(
                        newQuantity);

                inventory.setReservedQuantity(
                        newReserved);

                inventory.setLastUpdated(
                        LocalDateTime.now());

                inventoryRepository.save(
                        inventory);
            }
        }
    }

    // =========================================================
    // VALIDATE STATUS
    // =========================================================

    private void validateStatus(String status) {

        if (!status.equals("PENDING")
                && !status.equals("CONFIRMED")
                && !status.equals("SHIPPED")
                && !status.equals("DELIVERED")
                && !status.equals("CANCELLED")) {

            throw new RuntimeException(
                    "Invalid order status: "
                            + status);
        }
    }

    // =========================================================
    // VALIDATE STATUS TRANSITION
    // =========================================================

    private void validateStatusTransition(
            String currentStatus,
            String newStatus) {

        if (currentStatus == null
                || currentStatus.trim().isEmpty()) {

            return;
        }

        String current =
                currentStatus.trim().toUpperCase();

        if (current.equals(newStatus)) {
            return;
        }

        if (current.equals("PENDING")
                && (newStatus.equals("CONFIRMED")
                || newStatus.equals("CANCELLED"))) {

            return;
        }

        if (current.equals("CONFIRMED")
                && newStatus.equals("SHIPPED")) {

            return;
        }

        if (current.equals("SHIPPED")
                && newStatus.equals("DELIVERED")) {

            return;
        }

        throw new RuntimeException(
                "Invalid order status transition: "
                        + current
                        + " -> "
                        + newStatus);
    }

    // =========================================================
    // CONVERT ORDER TO RESPONSE
    // =========================================================

    private OrderResponse convertToResponse(
            Order order,
            List<OrderItem> items) {

        List<OrderItemResponse> itemResponses =
                new ArrayList<>();

        for (OrderItem item : items) {

            String imageUrl = null;

            if (item.getProductId() != null) {

                Product product =
                        productRepository
                                .findById(
                                        item.getProductId())
                                .orElse(null);

                if (product != null) {

                    imageUrl =
                            product.getImageUrl();
                }
            }

            OrderItemResponse itemResponse =
                    new OrderItemResponse(
                            item.getId(),
                            item.getProductId(),
                            item.getProductName(),
                            imageUrl,
                            item.getVendorEmail(),
                            item.getQuantity(),
                            item.getPrice(),
                            item.getSubtotal());

            itemResponses.add(
                    itemResponse);
        }

        return new OrderResponse(
                order.getId(),
                order.getCustomerEmail(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getOrderDate(),
                itemResponses,
                order.getReturnStatus(),
                order.getReturnReason(),
                order.getRefundAmount(),
                order.getRefundTransactionId(),
                order.getReturnRequestedDate(),
                order.getRefundDate());
    }
}