import { useEffect, useState } from "react";
import axios from "axios";
import "./CustomerProductManagement.css";

function CustomerProductManagement({
    cart,
    setCart,
    onOpenCart
}) {

    const [products, setProducts] = useState([]);
    const [coupons, setCoupons] = useState([]);

    const [loading, setLoading] = useState(true);
    const [couponLoading, setCouponLoading] = useState(true);

    const [error, setError] = useState("");
    const [couponError, setCouponError] = useState("");

    // =========================================================
    // LOAD PRODUCTS
    // =========================================================

    useEffect(() => {

        let cancelled = false;

        const loadProducts = async () => {

            try {

                if (!cancelled) {
                    setLoading(true);
                    setError("");
                }

                const token = localStorage.getItem("token");

                if (!token) {

                    if (!cancelled) {
                        setError("Please login as Customer.");
                        setLoading(false);
                    }

                    return;
                }

                const response = await axios.get(
                    "http://localhost:8080/customer/products",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!cancelled) {

                    if (Array.isArray(response.data)) {
                        setProducts(response.data);
                    } else {
                        setProducts([]);
                    }
                }

            } catch (err) {

                console.error(
                    "Customer products loading error:",
                    err
                );

                if (!cancelled) {

                    if (err.response?.status === 403) {

                        setError(
                            "Access denied. Please login as Customer."
                        );

                    } else if (err.response?.status === 401) {

                        setError(
                            "Your session has expired. Please login again."
                        );

                    } else {

                        setError(
                            "Unable to load products."
                        );
                    }
                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

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

                setCouponLoading(true);
                setCouponError("");

                const token =
                    localStorage.getItem("token");

                if (!token) {

                    if (!cancelled) {
                        setCoupons([]);
                        setCouponError(
                            "Please login as Customer."
                        );
                    }

                    return;
                }

                const response = await axios.get(
                    "http://localhost:8080/customer/coupons/active",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!cancelled) {

                    if (Array.isArray(response.data)) {
                        setCoupons(response.data);
                    } else {
                        setCoupons([]);
                    }
                }

            } catch (err) {

                console.error(
                    "Active coupons loading error:",
                    err
                );

                if (!cancelled) {

                    if (err.response?.status === 403) {

                        setCouponError(
                            "Unable to load available offers."
                        );

                    } else if (err.response?.status === 401) {

                        setCouponError(
                            "Your session has expired."
                        );

                    } else {

                        setCouponError(
                            "Unable to load available offers."
                        );
                    }

                    setCoupons([]);
                }

            } finally {

                if (!cancelled) {
                    setCouponLoading(false);
                }
            }
        };

        loadCoupons();

        return () => {
            cancelled = true;
        };

    }, []);


    // =========================================================
    // REFRESH PRODUCTS
    // =========================================================

    const refreshProducts = async () => {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("token");

            if (!token) {

                setError("Please login as Customer.");
                return;
            }

            const response = await axios.get(
                "http://localhost:8080/customer/products",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (Array.isArray(response.data)) {
                setProducts(response.data);
            } else {
                setProducts([]);
            }

        } catch (err) {

            console.error(
                "Customer products loading error:",
                err
            );

            if (err.response?.status === 403) {

                setError(
                    "Access denied. Please login as Customer."
                );

            } else if (err.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else {

                setError(
                    "Unable to load products."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // CART QUANTITY
    // =========================================================

    const getCartQuantity = (productId) => {

        const item = cart.find(
            cartItem => cartItem.id === productId
        );

        return item ? item.cartQuantity : 0;
    };


    // =========================================================
    // ADD TO CART
    // =========================================================

    const addToCart = (product) => {

        const existingItem = cart.find(
            item => item.id === product.id
        );

        if (existingItem) {

            if (
                existingItem.cartQuantity >=
                product.quantity
            ) {

                alert(
                    "Maximum available stock reached."
                );

                return;
            }

            setCart(
                cart.map(item =>
                    item.id === product.id
                        ? {
                            ...item,
                            cartQuantity:
                                item.cartQuantity + 1
                        }
                        : item
                )
            );

        } else {

            setCart([
                ...cart,
                {
                    ...product,
                    cartQuantity: 1
                }
            ]);
        }
    };


    // =========================================================
    // DECREASE CART QUANTITY
    // =========================================================

    const decreaseQuantity = (product) => {

        const existingItem = cart.find(
            item => item.id === product.id
        );

        if (!existingItem) {
            return;
        }

        if (existingItem.cartQuantity === 1) {

            setCart(
                cart.filter(
                    item => item.id !== product.id
                )
            );

        } else {

            setCart(
                cart.map(item =>
                    item.id === product.id
                        ? {
                            ...item,
                            cartQuantity:
                                item.cartQuantity - 1
                        }
                        : item
                )
            );
        }
    };


    // =========================================================
    // IMAGE ERROR
    // =========================================================

    const handleImageError = (event) => {

        event.currentTarget.style.display = "none";

        const container =
            event.currentTarget.parentElement;

        if (container) {

            const fallback =
                container.querySelector(
                    ".customer-product-placeholder"
                );

            if (fallback) {
                fallback.style.display = "flex";
            }
        }
    };


    // =========================================================
    // FORMAT COUPON DISCOUNT
    // =========================================================

    const getCouponDiscountText = (coupon) => {

        if (
            coupon.discountType?.toUpperCase() ===
            "PERCENTAGE"
        ) {

            return `${coupon.discountValue}% OFF`;
        }

        if (
            coupon.discountType?.toUpperCase() ===
            "FIXED"
        ) {

            return `₹${Number(
                coupon.discountValue || 0
            ).toFixed(2)} OFF`;
        }

        return "Special Discount";
    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatCouponDate = (date) => {

        if (!date) {
            return "";
        }

        const parsedDate =
            new Date(date);

        if (Number.isNaN(
            parsedDate.getTime()
        )) {
            return "";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div className="customer-products">

                <h2>📦 Products</h2>

                <p>
                    Loading products...
                </p>

            </div>
        );
    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (
            <div className="customer-products">

                <h2>📦 Products</h2>

                <p>{error}</p>

                <button
                    onClick={refreshProducts}
                >
                    Try Again
                </button>

            </div>
        );
    }


    // =========================================================
    // MAIN UI
    // =========================================================

    return (

        <div className="customer-products">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="customer-products-header">

                <div>

                    <h2>
                        📦 Products
                    </h2>

                    <p>
                        Browse products available
                        on ShopStack.
                    </p>

                </div>


                <div className="customer-products-actions">

                    <button
                        className="refresh-products-button"
                        onClick={refreshProducts}
                    >
                        ↻ Refresh
                    </button>

                    <button
                        className="open-cart-button"
                        onClick={onOpenCart}
                    >
                        🛒 Cart ({cart.length})
                    </button>

                </div>

            </div>


            {/* =================================================
                AVAILABLE COUPONS / OFFERS
            ================================================= */}

            {!couponLoading &&
                coupons.length > 0 && (

                <section className="customer-coupons-section">

                    <div className="customer-coupons-header">

                        <div>

                            <h3>
                                🎟️ Available Offers
                            </h3>

                            <p>
                                Save more on your
                                ShopStack purchase.
                            </p>

                        </div>

                    </div>


                    <div className="customer-coupons-list">

                        {coupons.map((coupon) => (

                            <div
                                className="customer-coupon-card"
                                key={coupon.id}
                            >

                                <div className="coupon-icon">
                                    🎟️
                                </div>


                                <div className="coupon-content">

                                    <div className="coupon-top-row">

                                        <span className="coupon-code">
                                            {coupon.code}
                                        </span>

                                        <span className="coupon-discount">
                                            {getCouponDiscountText(
                                                coupon
                                            )}
                                        </span>

                                    </div>


                                    <p className="coupon-condition">

                                        {coupon.minimumOrderAmount
                                            ? `Minimum order ₹${Number(
                                                coupon.minimumOrderAmount
                                            ).toFixed(2)}`
                                            : "No minimum order"
                                        }

                                        {coupon.maximumDiscount &&
                                            coupon.discountType?.toUpperCase() ===
                                            "PERCENTAGE"
                                            ? ` • Maximum discount ₹${Number(
                                                coupon.maximumDiscount
                                            ).toFixed(2)}`
                                            : ""
                                        }

                                    </p>


                                    <p className="coupon-validity">

                                        🗓️ Valid until{" "}

                                        {formatCouponDate(
                                            coupon.expiryDate
                                        )}

                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                </section>
            )}


            {/* =================================================
                COUPON ERROR
            ================================================= */}

            {!couponLoading &&
                couponError &&
                coupons.length === 0 && (

                <div className="customer-coupon-error">

                    <span>
                        🎟️
                    </span>

                    <span>
                        {couponError}
                    </span>

                </div>
            )}


            {/* =================================================
                NO PRODUCTS
            ================================================= */}

            {products.length === 0 ? (

                <div className="empty-products">

                    <div>
                        📦
                    </div>

                    <h3>
                        No Products Available
                    </h3>

                    <p>
                        There are currently no
                        products available.
                    </p>

                </div>

            ) : (

                /* =================================================
                   PRODUCT GRID
                ================================================= */

                <div className="customer-product-grid">

                    {products.map((product) => {

                        const cartQuantity =
                            getCartQuantity(
                                product.id
                            );

                        const outOfStock =
                            !product.quantity ||
                            product.quantity <= 0;


                        return (

                            <div
                                className="customer-product-card"
                                key={product.id}
                            >

                                {/* PRODUCT IMAGE */}

                                <div className="customer-product-image-container">

                                    <div
                                        className="customer-product-placeholder"
                                        style={{
                                            display:
                                                product.imageUrl
                                                    ? "none"
                                                    : "flex"
                                        }}
                                    >
                                        📦
                                    </div>


                                    {product.imageUrl && (

                                        <img
                                            src={product.imageUrl}
                                            alt={
                                                product.name ||
                                                "Product image"
                                            }
                                            className="customer-product-image"
                                            onError={
                                                handleImageError
                                            }
                                        />

                                    )}

                                </div>


                                {/* PRODUCT INFORMATION */}

                                <div className="customer-product-info">

                                    <span className="customer-product-category">

                                        {product.category ||
                                            "General"}

                                    </span>


                                    <h3>
                                        {product.name}
                                    </h3>


                                    <p className="customer-product-brand">

                                        {product.brand ||
                                            "ShopStack"}

                                    </p>


                                    <p className="customer-product-description">

                                        {product.description ||
                                            "No description available."}

                                    </p>


                                    <div className="customer-product-price">

                                        ₹
                                        {Number(
                                            product.price || 0
                                        ).toFixed(2)}

                                    </div>


                                    <div className="customer-product-stock">

                                        {outOfStock ? (

                                            <span className="out-of-stock">

                                                OUT OF STOCK

                                            </span>

                                        ) : (

                                            <span className="in-stock">

                                                {product.quantity}
                                                {" "}
                                                available

                                            </span>

                                        )}

                                    </div>


                                    {/* CART BUTTONS */}

                                    {cartQuantity === 0 ? (

                                        <button
                                            className="add-to-cart-button"
                                            onClick={() =>
                                                addToCart(
                                                    product
                                                )
                                            }
                                            disabled={
                                                outOfStock
                                            }
                                        >

                                            {outOfStock
                                                ? "Out of Stock"
                                                : "🛒 Add to Cart"}

                                        </button>

                                    ) : (

                                        <div className="product-cart-controls">

                                            <button
                                                onClick={() =>
                                                    decreaseQuantity(
                                                        product
                                                    )
                                                }
                                            >
                                                −
                                            </button>


                                            <span>
                                                {cartQuantity}
                                            </span>


                                            <button
                                                onClick={() =>
                                                    addToCart(
                                                        product
                                                    )
                                                }
                                                disabled={
                                                    cartQuantity >=
                                                    product.quantity
                                                }
                                            >
                                                +
                                            </button>

                                        </div>

                                    )}

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>
    );
}

export default CustomerProductManagement;