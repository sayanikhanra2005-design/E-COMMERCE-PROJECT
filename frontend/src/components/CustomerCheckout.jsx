// CustomerCheckout.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import "./CustomerCheckout.css";

function CustomerCheckout({
    cart,
    onOrderPlaced,
    onBackToCart
}) {

    const [step, setStep] = useState(1);

    // =========================================================
    // ADDRESS
    // =========================================================

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [addressError, setAddressError] = useState("");

    const [showAddAddress, setShowAddAddress] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const [addressSuccess, setAddressSuccess] = useState("");

    const [addressForm, setAddressForm] = useState({
        addressLine: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phoneNumber: ""
    });

    // =========================================================
    // PAYMENT
    // =========================================================

    const [paymentMethod, setPaymentMethod] = useState("");

    // =========================================================
    // ORDER
    // =========================================================

    const [placingOrder, setPlacingOrder] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [orderError, setOrderError] = useState("");

    // =========================================================
    // COUPON
    // =========================================================

    const [couponCode, setCouponCode] = useState("");
    const [coupons, setCoupons] = useState([]);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponMessage, setCouponMessage] = useState("");
    const [couponError, setCouponError] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    // =========================================================
    // SAFE CART QUANTITY
    // =========================================================

    const getCartQuantity = (item) => {

        const quantity = Number(
            item?.cartQuantity
        );

        if (
            Number.isFinite(quantity) &&
            quantity > 0
        ) {
            return quantity;
        }

        return 0;
    };

    // =========================================================
    // AVAILABLE PRODUCT STOCK
    // =========================================================

    const getAvailableQuantity = (item) => {

        const availableQuantity = Number(
            item?.availableQuantity ??
            item?.stockQuantity ??
            item?.quantity ??
            0
        );

        if (
            Number.isFinite(
                availableQuantity
            )
        ) {
            return availableQuantity;
        }

        return 0;
    };

    // =========================================================
    // CART CALCULATIONS
    // =========================================================

    const subtotal = (cart || []).reduce(
        (total, item) => {

            const price = Number(
                item?.price ?? 0
            );

            const quantity =
                getCartQuantity(item);

            return total + (
                price * quantity
            );
        },
        0
    );

    const discount =
        appliedCoupon?.discountAmount
            ? Number(
                appliedCoupon.discountAmount
            )
            : 0;

    const finalTotal = Math.max(
        subtotal - discount,
        0
    );

    // =========================================================
    // FRIENDLY ORDER ERROR
    // =========================================================

    const getFriendlyOrderError = (error) => {

        if (!error.response) {

            return "Unable to connect to the server. Please check your connection and try again.";
        }

        const status =
            error.response?.status;

        const backendMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "";

        const message =
            String(
                backendMessage
            ).toLowerCase();

        if (status === 401) {

            return "Your session has expired. Please login again.";
        }

        if (status === 403) {

            return "You are not authorized to place this order.";
        }

        if (
            message.includes("stock") ||
            message.includes("insufficient") ||
            message.includes("inventory") ||
            message.includes("quantity") ||
            message.includes("available")
        ) {

            return "Some products do not have enough stock. Please update your cart and try again.";
        }

        if (
            message.includes("product") &&
            (
                message.includes("not found") ||
                message.includes("unavailable") ||
                message.includes("deleted")
            )
        ) {

            return "One of the products in your cart is no longer available.";
        }

        if (
            message.includes("address") &&
            (
                message.includes("not found") ||
                message.includes("invalid") ||
                message.includes("required")
            )
        ) {

            return "The selected delivery address is no longer available. Please select another address.";
        }

        if (
            message.includes("coupon") ||
            message.includes("discount")
        ) {

            return "The selected coupon is invalid, expired, or cannot be used for this order.";
        }

        if (
            message.includes("payment") ||
            message.includes("transaction")
        ) {

            return "Payment could not be completed. Please try another payment method.";
        }

        if (status === 400) {

            return "Please check your order details and try again.";
        }

        if (status === 404) {

            return "The requested information could not be found. Please refresh the page and try again.";
        }

        if (status >= 500) {

            return "Server error. Please try again later.";
        }

        return "Unable to place your order. Please try again.";
    };

    // =========================================================
    // LOAD ADDRESSES
    // =========================================================

    useEffect(() => {

        let cancelled = false;

        const loadAddresses = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                if (!token) {

                    if (!cancelled) {

                        setAddressError(
                            "Please login to continue."
                        );

                        setLoadingAddresses(
                            false
                        );
                    }

                    return;
                }

                const response =
                    await axios.get(
                        "http://localhost:8080/customer/addresses",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                if (!cancelled) {

                    const loadedAddresses =
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : [];

                    setAddresses(
                        loadedAddresses
                    );

                    if (
                        loadedAddresses.length > 0
                    ) {

                        setSelectedAddress(
                            loadedAddresses[0]
                        );
                    }

                    setAddressError("");

                    setLoadingAddresses(
                        false
                    );
                }

            } catch (error) {

                console.error(
                    "Checkout address error:",
                    error
                );

                if (!cancelled) {

                    if (
                        error.response?.status === 401
                    ) {

                        setAddressError(
                            "Your session has expired. Please login again."
                        );

                    } else if (
                        error.response?.status === 403
                    ) {

                        setAddressError(
                            "You are not authorized to access your addresses."
                        );

                    } else if (
                        error.response?.status >= 500
                    ) {

                        setAddressError(
                            "Server error. Please try again later."
                        );

                    } else if (
                        !error.response
                    ) {

                        setAddressError(
                            "Unable to connect to the server. Please try again."
                        );

                    } else {

                        setAddressError(
                            "Unable to load your saved addresses."
                        );
                    }

                    setLoadingAddresses(
                        false
                    );
                }
            }
        };

        loadAddresses();

        return () => {

            cancelled = true;
        };

    }, []);

    // =========================================================
    // LOAD ACTIVE COUPONS
    // =========================================================

    useEffect(() => {

        let cancelled = false;

        const loadCoupons = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    return;
                }

                const response =
                    await axios.get(
                        "http://localhost:8080/customer/coupons/active",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                console.log(
                    "ACTIVE COUPONS:",
                    response.data
                );

                if (!cancelled) {

                    setCoupons(
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : []
                    );
                }

            } catch (error) {

                console.error(
                    "Coupon loading error:",
                    error
                );

                if (!cancelled) {

                    setCoupons([]);
                }
            }
        };

        loadCoupons();

        return () => {

            cancelled = true;
        };

    }, []);

    // =========================================================
    // ADDRESS INPUT
    // =========================================================

    const handleAddressChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setAddressForm(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );
    };

    // =========================================================
    // ADDRESS VALIDATION
    // =========================================================

    const validateAddress = () => {

        if (
            !addressForm.addressLine.trim()
        ) {

            return "Address is required.";
        }

        if (
            !addressForm.city.trim()
        ) {

            return "City is required.";
        }

        if (
            !addressForm.state.trim()
        ) {

            return "State is required.";
        }

        if (
            !/^\d{5,6}$/.test(
                addressForm.postalCode.trim()
            )
        ) {

            return "Please enter a valid postal code.";
        }

        if (
            !addressForm.country.trim()
        ) {

            return "Country is required.";
        }

        if (
            !/^\d{10}$/.test(
                addressForm.phoneNumber.trim()
            )
        ) {

            return "Please enter a valid 10-digit phone number.";
        }

        return "";
    };

    // =========================================================
    // SAVE NEW ADDRESS
    // =========================================================

    const handleSaveAddress = async (e) => {

        e.preventDefault();

        setAddressError("");
        setAddressSuccess("");

        const validationError =
            validateAddress();

        if (validationError) {

            setAddressError(
                validationError
            );

            return;
        }

        try {

            setSavingAddress(true);

            const token =
                localStorage.getItem("token");

            if (!token) {

                setAddressError(
                    "Your session has expired. Please login again."
                );

                return;
            }

            const response =
                await axios.post(
                    "http://localhost:8080/customer/addresses",
                    addressForm,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const newAddress =
                response.data;

            const addressResponse =
                await axios.get(
                    "http://localhost:8080/customer/addresses",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const updatedAddresses =
                Array.isArray(
                    addressResponse.data
                )
                    ? addressResponse.data
                    : [];

            setAddresses(
                updatedAddresses
            );

            const createdAddress =
                updatedAddresses.find(
                    (address) =>
                        address.id ===
                        newAddress?.id
                ) || newAddress;

            setSelectedAddress(
                createdAddress
            );

            setAddressForm({
                addressLine: "",
                city: "",
                state: "",
                postalCode: "",
                country: "",
                phoneNumber: ""
            });

            setShowAddAddress(false);

            setAddressSuccess(
                "New delivery address added successfully."
            );

        } catch (error) {

            console.error(
                "Save checkout address error:",
                error
            );

            if (
                error.response?.status === 401
            ) {

                setAddressError(
                    "Your session has expired. Please login again."
                );

            } else if (
                error.response?.status === 403
            ) {

                setAddressError(
                    "You are not authorized to save an address."
                );

            } else if (
                error.response?.status >= 500
            ) {

                setAddressError(
                    "Server error. Please try again later."
                );

            } else if (!error.response) {

                setAddressError(
                    "Unable to connect to the server. Please try again."
                );

            } else {

                setAddressError(
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    "Unable to save the new address."
                );
            }

        } finally {

            setSavingAddress(false);
        }
    };

    // =========================================================
    // OPEN ADD ADDRESS
    // =========================================================

    const handleOpenAddAddress = () => {

        setAddressError("");
        setAddressSuccess("");

        setAddressForm({
            addressLine: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            phoneNumber: ""
        });

        setShowAddAddress(true);
    };

    // =========================================================
    // CANCEL ADD ADDRESS
    // =========================================================

    const handleCancelAddAddress = () => {

        setShowAddAddress(false);
        setAddressError("");

        setAddressForm({
            addressLine: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            phoneNumber: ""
        });
    };

    // =========================================================
    // NEXT STEP
    // =========================================================

    const nextStep = () => {

        setOrderError("");
        setAddressError("");

        if (step === 1) {

            if (!selectedAddress) {

                setAddressError(
                    "Please select a delivery address."
                );

                return;
            }

            if (!selectedAddress.id) {

                setAddressError(
                    "Please select a valid delivery address."
                );

                return;
            }

            if (showAddAddress) {

                setAddressError(
                    "Please save or cancel the new address form."
                );

                return;
            }
        }

        if (step === 2) {

            if (!paymentMethod) {

                setOrderError(
                    "Please select a payment method."
                );

                return;
            }
        }

        setStep(
            (previous) =>
                Math.min(
                    previous + 1,
                    3
                )
        );
    };

    // =========================================================
    // PREVIOUS STEP
    // =========================================================

    const previousStep = () => {

        setOrderError("");

        setStep(
            (previous) =>
                Math.max(
                    previous - 1,
                    1
                )
        );
    };

    // =========================================================
    // APPLY COUPON
    // =========================================================

    const handleApplyCoupon = async () => {

        const code =
            couponCode.trim();

        if (!code) {

            setCouponError(
                "Please select or enter a coupon code."
            );

            setCouponMessage("");

            return;
        }

        try {

            setCouponLoading(true);

            setCouponError("");
            setCouponMessage("");

            const token =
                localStorage.getItem("token");

            if (!token) {

                setCouponError(
                    "Please login to apply a coupon."
                );

                return;
            }

            // =================================================
            // IMPORTANT:
            // CUSTOMER COUPON VALIDATION ENDPOINT
            // =================================================

            const response =
                await axios.post(
                    "http://localhost:8080/customer/coupons/validate",
                    null,
                    {
                        params: {
                            code: code,
                            orderAmount: subtotal
                        },
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const data =
                response.data;

            console.log(
                "Coupon validation response:",
                data
            );

            if (data?.valid === true) {

                const discountAmount =
                    Number(
                        data.discountAmount ??
                        data.discount ??
                        data.discountValue ??
                        0
                    );

                if (
                    discountAmount <= 0
                ) {

                    setAppliedCoupon(null);

                    setCouponError(
                        "Coupon is valid but no discount amount was returned."
                    );

                    return;
                }

                setAppliedCoupon({

                    code:
                        data.code ||
                        code.toUpperCase(),

                    discountAmount:
                        discountAmount,

                    valid: true
                });

                setCouponMessage(
                    data.message ||
                    `Coupon applied successfully. You saved ₹${discountAmount.toFixed(2)}.`
                );

                setCouponError("");

            } else {

                setAppliedCoupon(null);

                setCouponError(
                    data?.message ||
                    "Invalid, expired, or unavailable coupon."
                );
            }

        } catch (error) {

            console.error(
                "Coupon validation error:",
                error
            );

            console.error(
                "Coupon status:",
                error.response?.status
            );

            console.error(
                "Coupon response:",
                error.response?.data
            );

            setAppliedCoupon(null);

            if (!error.response) {

                setCouponError(
                    "Unable to connect to the server. Please try again."
                );

            } else if (
                error.response?.status === 401
            ) {

                setCouponError(
                    "Your session has expired. Please login again."
                );

            } else if (
                error.response?.status === 403
            ) {

                setCouponError(
                    "You are not authorized to apply coupons."
                );

            } else if (
                error.response?.status >= 500
            ) {

                setCouponError(
                    "Server error while validating coupon. Please try again later."
                );

            } else {

                setCouponError(
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    "Invalid, expired, or unavailable coupon."
                );
            }

        } finally {

            setCouponLoading(false);
        }
    };

    // =========================================================
    // REMOVE COUPON
    // =========================================================

    const handleRemoveCoupon = () => {

        setAppliedCoupon(null);
        setCouponCode("");
        setCouponMessage("");
        setCouponError("");
    };

    // =========================================================
    // PLACE ORDER
    // =========================================================

    const handlePlaceOrder = async () => {

        if (
            placingOrder ||
            paymentProcessing
        ) {
            return;
        }

        if (!selectedAddress) {

            setOrderError(
                "Please select a delivery address."
            );

            setStep(1);

            return;
        }

        if (!selectedAddress.id) {

            setOrderError(
                "Please select a valid delivery address."
            );

            setStep(1);

            return;
        }

        if (!paymentMethod) {

            setOrderError(
                "Please select a payment method."
            );

            setStep(2);

            return;
        }

        if (
            !cart ||
            cart.length === 0
        ) {

            setOrderError(
                "Your cart is empty."
            );

            return;
        }

        const token =
            localStorage.getItem("token");

        if (!token) {

            setOrderError(
                "Your session has expired. Please login again."
            );

            setPlacingOrder(false);
            setPaymentProcessing(false);

            return;
        }

        // =====================================================
        // VALIDATE CART QUANTITIES AND STOCK
        // =====================================================

        for (const item of cart) {

            const cartQuantity =
                getCartQuantity(item);

            const availableQuantity =
                getAvailableQuantity(item);

            if (cartQuantity <= 0) {

                setOrderError(
                    `Invalid quantity for ${item.name}. Please update your cart.`
                );

                setStep(1);

                return;
            }

            if (
                availableQuantity <= 0
            ) {

                setOrderError(
                    `${item.name} is currently out of stock.`
                );

                setStep(1);

                return;
            }

            if (
                cartQuantity >
                availableQuantity
            ) {

                setOrderError(
                    `Only ${availableQuantity} units of ${item.name} are available. Please update your cart.`
                );

                setStep(1);

                return;
            }
        }

        try {

            setPlacingOrder(true);
            setPaymentProcessing(true);
            setOrderError("");

            if (!selectedAddress?.id) {

                setOrderError(
                    "Please select a valid delivery address."
                );

                setStep(1);

                setPlacingOrder(false);
                setPaymentProcessing(false);

                return;
            }

            const orderItems =
                cart.map(
                    (item) => ({

                        productId:
                            Number(item.id),

                        quantity:
                            getCartQuantity(item)

                    })
                );

            const orderRequest = {

                items:
                    orderItems,

                couponCode:
                    appliedCoupon?.valid
                        ? appliedCoupon.code
                        : null,

                addressId:
                    Number(
                        selectedAddress.id
                    ),

                paymentMethod:
                    paymentMethod
            };

            console.log(
                "ORDER REQUEST:",
                orderRequest
            );

            const response =
                await axios.post(
                    "http://localhost:8080/customer/orders",
                    orderRequest,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            console.log(
                "Order placed successfully:",
                response.data
            );

            setPaymentProcessing(false);
            setPlacingOrder(false);
            setOrderError("");

            if (onOrderPlaced) {

                onOrderPlaced(
                    response.data
                );
            }

        } catch (error) {

            console.error(
                "Place order error:",
                error
            );

            console.error(
                "Order status:",
                error.response?.status
            );

            console.error(
                "Order response:",
                error.response?.data
            );

            setPaymentProcessing(false);
            setPlacingOrder(false);

            setOrderError(
                getFriendlyOrderError(
                    error
                )
            );
        }
    };

    // =========================================================
    // EMPTY CART
    // =========================================================

    if (
        !cart ||
        cart.length === 0
    ) {

        return (

            <div className="checkout-empty">

                <div className="checkout-empty-icon">
                    🛒
                </div>

                <h2>
                    Your cart is empty
                </h2>

                <p>
                    Add some products before
                    proceeding to checkout.
                </p>

                <button
                    className="checkout-back-btn"
                    onClick={
                        onBackToCart
                    }
                >
                    ← Back to Cart
                </button>

            </div>
        );
    }

    // =========================================================
    // MAIN UI
    // =========================================================

    return (

        <div className="checkout-page">

            {/* HEADER */}

            <div className="checkout-header">

                <button
                    className="checkout-back-btn"
                    onClick={
                        onBackToCart
                    }
                >
                    ← Back to Cart
                </button>

                <div className="checkout-header-content">

                    <h1>
                        Checkout
                    </h1>

                    <p>
                        Complete your order securely
                    </p>

                </div>

            </div>

            {/* STEPS */}

            <div className="checkout-steps">

                <div
                    className={
                        step >= 1
                            ? "checkout-step active"
                            : "checkout-step"
                    }
                >

                    <span>
                        1
                    </span>

                    <label>
                        Address
                    </label>

                </div>

                <div className="checkout-step-line"></div>

                <div
                    className={
                        step >= 2
                            ? "checkout-step active"
                            : "checkout-step"
                    }
                >

                    <span>
                        2
                    </span>

                    <label>
                        Payment
                    </label>

                </div>

                <div className="checkout-step-line"></div>

                <div
                    className={
                        step >= 3
                            ? "checkout-step active"
                            : "checkout-step"
                    }
                >

                    <span>
                        3
                    </span>

                    <label>
                        Review
                    </label>

                </div>

            </div>

            <div className="checkout-layout">

                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <div className="checkout-main">

                    {/* =================================================
                        STEP 1 - ADDRESS
                    ================================================= */}

                    {step === 1 && (

                        <div className="checkout-card">

                            <div className="checkout-card-header">

                                <h2>
                                    📍 Delivery Address
                                </h2>

                                <span>
                                    Step 1 of 3
                                </span>

                            </div>

                            {addressError && (

                                <div className="checkout-inline-error">
                                    ⚠️ {addressError}
                                </div>

                            )}

                            {addressSuccess && (

                                <div className="checkout-success-message">
                                    ✓ {addressSuccess}
                                </div>

                            )}

                            {loadingAddresses ? (

                                <div className="checkout-loading">
                                    Loading saved addresses...
                                </div>

                            ) : (

                                <>

                                    {addresses.length > 0 && (

                                        <div className="checkout-address-list">

                                            {addresses.map(
                                                (address) => (

                                                    <div
                                                        key={
                                                            address.id
                                                        }
                                                        className={
                                                            selectedAddress?.id ===
                                                            address.id
                                                                ? "checkout-address-card selected"
                                                                : "checkout-address-card"
                                                        }
                                                        onClick={() =>
                                                            setSelectedAddress(
                                                                address
                                                            )
                                                        }
                                                    >

                                                        <div className="address-radio">

                                                            <input
                                                                type="radio"
                                                                checked={
                                                                    selectedAddress?.id ===
                                                                    address.id
                                                                }
                                                                onChange={() =>
                                                                    setSelectedAddress(
                                                                        address
                                                                    )
                                                                }
                                                            />

                                                        </div>

                                                        <div className="checkout-address-content">

                                                            <strong>
                                                                {
                                                                    address.addressLine
                                                                }
                                                            </strong>

                                                            <p>
                                                                {
                                                                    address.city
                                                                }
                                                                ,{" "}
                                                                {
                                                                    address.state
                                                                }{" "}
                                                                {
                                                                    address.postalCode
                                                                }
                                                            </p>

                                                            <p>
                                                                {
                                                                    address.country
                                                                }
                                                            </p>

                                                            <p>
                                                                📞{" "}
                                                                {
                                                                    address.phoneNumber
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    )}

                                    {!showAddAddress && (

                                        <button
                                            type="button"
                                            className="checkout-add-address-btn"
                                            onClick={
                                                handleOpenAddAddress
                                            }
                                        >
                                            + Add New Address
                                        </button>

                                    )}

                                    {showAddAddress && (

                                        <div className="checkout-new-address">

                                            <div className="checkout-new-address-header">

                                                <h3>
                                                    Add New Delivery Address
                                                </h3>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleCancelAddAddress
                                                    }
                                                    className="checkout-close-address"
                                                >
                                                    ✕
                                                </button>

                                            </div>

                                            <form
                                                onSubmit={
                                                    handleSaveAddress
                                                }
                                            >

                                                <div className="checkout-form-group">

                                                    <label>
                                                        Address
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="addressLine"
                                                        value={
                                                            addressForm.addressLine
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                        placeholder="Enter your address"
                                                    />

                                                </div>

                                                <div className="checkout-form-row">

                                                    <div className="checkout-form-group">

                                                        <label>
                                                            City
                                                        </label>

                                                        <input
                                                            type="text"
                                                            name="city"
                                                            value={
                                                                addressForm.city
                                                            }
                                                            onChange={
                                                                handleAddressChange
                                                            }
                                                            placeholder="Enter city"
                                                        />

                                                    </div>

                                                    <div className="checkout-form-group">

                                                        <label>
                                                            State
                                                        </label>

                                                        <input
                                                            type="text"
                                                            name="state"
                                                            value={
                                                                addressForm.state
                                                            }
                                                            onChange={
                                                                handleAddressChange
                                                            }
                                                            placeholder="Enter state"
                                                        />

                                                    </div>

                                                </div>

                                                <div className="checkout-form-row">

                                                    <div className="checkout-form-group">

                                                        <label>
                                                            Postal Code
                                                        </label>

                                                        <input
                                                            type="text"
                                                            name="postalCode"
                                                            value={
                                                                addressForm.postalCode
                                                            }
                                                            onChange={
                                                                handleAddressChange
                                                            }
                                                            placeholder="Enter postal code"
                                                            maxLength="6"
                                                        />

                                                    </div>

                                                    <div className="checkout-form-group">

                                                        <label>
                                                            Country
                                                        </label>

                                                        <input
                                                            type="text"
                                                            name="country"
                                                            value={
                                                                addressForm.country
                                                            }
                                                            onChange={
                                                                handleAddressChange
                                                            }
                                                            placeholder="Enter country"
                                                        />

                                                    </div>

                                                </div>

                                                <div className="checkout-form-group">

                                                    <label>
                                                        Phone Number
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="phoneNumber"
                                                        value={
                                                            addressForm.phoneNumber
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                        placeholder="Enter 10-digit phone number"
                                                        maxLength="10"
                                                    />

                                                </div>

                                                <div className="checkout-address-form-actions">

                                                    <button
                                                        type="button"
                                                        className="checkout-cancel-address-btn"
                                                        onClick={
                                                            handleCancelAddAddress
                                                        }
                                                        disabled={
                                                            savingAddress
                                                        }
                                                    >
                                                        Cancel
                                                    </button>

                                                    <button
                                                        type="submit"
                                                        className="checkout-save-address-btn"
                                                        disabled={
                                                            savingAddress
                                                        }
                                                    >
                                                        {
                                                            savingAddress
                                                                ? "Saving..."
                                                                : "Save Address"
                                                        }
                                                    </button>

                                                </div>

                                            </form>

                                        </div>

                                    )}

                                    <div className="checkout-navigation">

                                        <button
                                            className="checkout-next-btn"
                                            onClick={
                                                nextStep
                                            }
                                            disabled={
                                                !selectedAddress ||
                                                showAddAddress
                                            }
                                        >
                                            Continue to Payment →
                                        </button>

                                    </div>

                                </>

                            )}

                        </div>

                    )}

                    {/* =================================================
                        STEP 2 - PAYMENT
                    ================================================= */}

                    {step === 2 && (

                        <div className="checkout-card">

                            <div className="checkout-card-header">

                                <h2>
                                    💳 Payment Method
                                </h2>

                                <span>
                                    Step 2 of 3
                                </span>

                            </div>

                            {orderError && (

                                <div className="checkout-inline-error">
                                    ⚠️ {orderError}
                                </div>

                            )}

                            <div className="payment-methods">

                                <label
                                    className={
                                        paymentMethod === "COD"
                                            ? "payment-method selected"
                                            : "payment-method"
                                    }
                                >

                                    <input
                                        type="radio"
                                        name="payment"
                                        value="COD"
                                        checked={
                                            paymentMethod === "COD"
                                        }
                                        onChange={(e) =>
                                            setPaymentMethod(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <div>

                                        <strong>
                                            💵 Cash on Delivery
                                        </strong>

                                        <p>
                                            Pay when your order arrives.
                                        </p>

                                    </div>

                                </label>

                                <label
                                    className={
                                        paymentMethod === "CARD"
                                            ? "payment-method selected"
                                            : "payment-method"
                                    }
                                >

                                    <input
                                        type="radio"
                                        name="payment"
                                        value="CARD"
                                        checked={
                                            paymentMethod === "CARD"
                                        }
                                        onChange={(e) =>
                                            setPaymentMethod(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <div>

                                        <strong>
                                            💳 Credit / Debit Card
                                        </strong>

                                        <p>
                                            Secure online card payment.
                                        </p>

                                    </div>

                                </label>

                                <label
                                    className={
                                        paymentMethod === "UPI"
                                            ? "payment-method selected"
                                            : "payment-method"
                                    }
                                >

                                    <input
                                        type="radio"
                                        name="payment"
                                        value="UPI"
                                        checked={
                                            paymentMethod === "UPI"
                                        }
                                        onChange={(e) =>
                                            setPaymentMethod(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <div>

                                        <strong>
                                            📱 UPI
                                        </strong>

                                        <p>
                                            Pay using any UPI application.
                                        </p>

                                    </div>

                                </label>

                            </div>

                            <div className="checkout-navigation">

                                <button
                                    className="checkout-prev-btn"
                                    onClick={
                                        previousStep
                                    }
                                >
                                    ← Back
                                </button>

                                <button
                                    className="checkout-next-btn"
                                    onClick={
                                        nextStep
                                    }
                                    disabled={
                                        !paymentMethod
                                    }
                                >
                                    Review Order →
                                </button>

                            </div>

                        </div>

                    )}

                    {/* =================================================
                        STEP 3 - REVIEW
                    ================================================= */}

                    {step === 3 && (

                        <div className="checkout-card">

                            <div className="checkout-card-header">

                                <h2>
                                    🧾 Review Your Order
                                </h2>

                                <span>
                                    Step 3 of 3
                                </span>

                            </div>

                            {orderError && (

                                <div className="checkout-inline-error">
                                    ⚠️ {orderError}
                                </div>

                            )}

                            {/* ADDRESS */}

                            <div className="review-section">

                                <div className="review-section-header">

                                    <h3>
                                        📍 Delivery Address
                                    </h3>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setStep(1)
                                        }
                                    >
                                        Change
                                    </button>

                                </div>

                                {selectedAddress && (

                                    <div className="review-address">

                                        <strong>
                                            {
                                                selectedAddress.addressLine
                                            }
                                        </strong>

                                        <p>
                                            {
                                                selectedAddress.city
                                            }
                                            ,{" "}
                                            {
                                                selectedAddress.state
                                            }{" "}
                                            {
                                                selectedAddress.postalCode
                                            }
                                        </p>

                                        <p>
                                            {
                                                selectedAddress.country
                                            }
                                        </p>

                                        <p>
                                            📞{" "}
                                            {
                                                selectedAddress.phoneNumber
                                            }
                                        </p>

                                    </div>

                                )}

                            </div>

                            {/* PAYMENT */}

                            <div className="review-section">

                                <div className="review-section-header">

                                    <h3>
                                        💳 Payment
                                    </h3>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setStep(2)
                                        }
                                    >
                                        Change
                                    </button>

                                </div>

                                <p>
                                    {
                                        paymentMethod === "COD"
                                            ? "💵 Cash on Delivery"
                                            : paymentMethod === "CARD"
                                                ? "💳 Credit / Debit Card"
                                                : "📱 UPI"
                                    }
                                </p>

                            </div>

                            {/* =================================================
                                COUPON
                            ================================================= */}

                            <div className="review-section">

                                <div className="review-section-header">

                                    <h3>
                                        🎟️ Coupon
                                    </h3>

                                </div>

                                {!appliedCoupon ? (

                                    <div className="coupon-box">

                                        <div className="coupon-select-wrapper">

                                            <select
                                                className="coupon-dropdown"
                                                value={
                                                    couponCode
                                                }
                                                onChange={(e) => {

                                                    const selectedCode =
                                                        e.target.value;

                                                    setCouponCode(
                                                        selectedCode
                                                    );

                                                    setCouponError("");
                                                    setCouponMessage("");

                                                }}
                                            >

                                                <option value="">
                                                    Select an available coupon
                                                </option>

                                                {coupons.length > 0 ? (

                                                    coupons.map(
                                                        (coupon) => {

                                                            const discountValue =
                                                                coupon.discountValue ??
                                                                coupon.discount ??
                                                                coupon.discountPercentage;

                                                            return (

                                                                <option
                                                                    key={
                                                                        coupon.id ||
                                                                        coupon.code
                                                                    }
                                                                    value={
                                                                        coupon.code
                                                                    }
                                                                >

                                                                    {
                                                                        coupon.code
                                                                    }

                                                                    {
                                                                        discountValue !== undefined &&
                                                                        discountValue !== null
                                                                            ? ` - ${discountValue}% OFF`
                                                                            : ""
                                                                    }

                                                                </option>
                                                            );
                                                        }
                                                    )

                                                ) : (

                                                    <option
                                                        value=""
                                                        disabled
                                                    >
                                                        No coupons available
                                                    </option>

                                                )}

                                            </select>

                                            <span
                                                className="coupon-dropdown-arrow"
                                                aria-hidden="true"
                                            >
                                                ▾
                                            </span>

                                        </div>

                                        <button
                                            type="button"
                                            onClick={
                                                handleApplyCoupon
                                            }
                                            disabled={
                                                couponLoading ||
                                                !couponCode
                                            }
                                        >
                                            {
                                                couponLoading
                                                    ? "Applying..."
                                                    : "Apply Coupon"
                                            }
                                        </button>

                                    </div>

                                ) : (

                                    <div className="applied-coupon">

                                        <span>

                                            ✓{" "}
                                            {
                                                appliedCoupon.code
                                            }

                                            {" • "}

                                            Saved ₹
                                            {
                                                Number(
                                                    appliedCoupon.discountAmount
                                                ).toFixed(2)
                                            }

                                        </span>

                                        <button
                                            type="button"
                                            className="remove-coupon-btn"
                                            onClick={
                                                handleRemoveCoupon
                                            }
                                        >
                                            Remove
                                        </button>

                                    </div>

                                )}

                                {couponMessage && (

                                    <p className="coupon-success">

                                        ✓{" "}
                                        {
                                            couponMessage
                                        }

                                    </p>

                                )}

                                {couponError && (

                                    <p className="coupon-error">

                                        ⚠️{" "}
                                        {
                                            couponError
                                        }

                                    </p>

                                )}

                            </div>

                            {/* PRODUCTS */}

                            <div className="review-section">

                                <h3>
                                    🛒 Products
                                </h3>

                                <div className="review-products">

                                    {cart.map(
                                        (item) => {

                                            const quantity =
                                                getCartQuantity(
                                                    item
                                                );

                                            const itemTotal =
                                                Number(
                                                    item.price ?? 0
                                                ) *
                                                quantity;

                                            return (

                                                <div
                                                    className="review-product"
                                                    key={
                                                        item.id
                                                    }
                                                >

                                                    <span>
                                                        {
                                                            item.name
                                                        }
                                                        {" × "}
                                                        {
                                                            quantity
                                                        }
                                                    </span>

                                                    <strong>
                                                        ₹
                                                        {
                                                            itemTotal.toFixed(
                                                                2
                                                            )
                                                        }
                                                    </strong>

                                                </div>
                                            );

                                        }
                                    )}

                                </div>

                            </div>

                            {/* NAVIGATION */}

                            <div className="checkout-navigation">

                                <button
                                    className="checkout-prev-btn"
                                    onClick={
                                        previousStep
                                    }
                                >
                                    ← Back
                                </button>

                                <button
                                    className="place-order-btn"
                                    onClick={
                                        handlePlaceOrder
                                    }
                                    disabled={
                                        placingOrder ||
                                        paymentProcessing
                                    }
                                >

                                    {
                                        placingOrder
                                            ? "Placing Order..."
                                            : `Place Order • ₹${finalTotal.toFixed(2)}`
                                    }

                                </button>

                            </div>

                        </div>

                    )}

                </div>

                {/* =================================================
                    ORDER SUMMARY
                ================================================= */}

                <aside className="checkout-summary">

                    <div className="summary-content">

                        <h2>
                            Order Summary
                        </h2>

                        <div className="summary-items">

                            {cart.map(
                                (item) => {

                                    const quantity =
                                        getCartQuantity(
                                            item
                                        );

                                    const itemTotal =
                                        Number(
                                            item.price ?? 0
                                        ) *
                                        quantity;

                                    return (

                                        <div
                                            className="summary-item"
                                            key={
                                                item.id
                                            }
                                        >

                                            <span>
                                                {
                                                    item.name
                                                }
                                                {" × "}
                                                {
                                                    quantity
                                                }
                                            </span>

                                            <strong>
                                                ₹
                                                {
                                                    itemTotal.toFixed(
                                                        2
                                                    )
                                                }
                                            </strong>

                                        </div>
                                    );

                                }
                            )}

                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row">

                            <span>
                                Subtotal
                            </span>

                            <strong>
                                ₹
                                {
                                    subtotal.toFixed(
                                        2
                                    )
                                }
                            </strong>

                        </div>

                        {discount > 0 && (

                            <div className="summary-row discount-row">

                                <span>
                                    Discount
                                </span>

                                <strong>
                                    -₹
                                    {
                                        discount.toFixed(
                                            2
                                        )
                                    }
                                </strong>

                            </div>

                        )}

                        <div className="summary-final-total">

                            <span>
                                Total
                            </span>

                            <strong>
                                ₹
                                {
                                    finalTotal.toFixed(
                                        2
                                    )
                                }
                            </strong>

                        </div>

                    </div>

                </aside>

            </div>

            {/* =================================================
                PAYMENT PROCESSING
            ================================================= */}

            {paymentProcessing && (

                <div className="payment-processing-overlay">

                    <div className="payment-processing-card">

                        <div className="payment-animation">
                            💳
                        </div>

                        <h2>
                            Processing Payment
                        </h2>

                        <p>
                            Please wait while we place your order...
                        </p>

                    </div>

                </div>

            )}

        </div>
    );
}

export default CustomerCheckout;