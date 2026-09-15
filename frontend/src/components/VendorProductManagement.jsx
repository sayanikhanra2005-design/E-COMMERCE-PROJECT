import { useEffect, useState } from "react";
import axios from "axios";
import "./VendorProductManagement.css";

function VendorProductManagement() {
  const [products, setProducts] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    quantity: "",
    imageUrl: "",
  });

  // =========================================================
  // EMPTY FORM
  // =========================================================

  const emptyForm = {
    name: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    quantity: "",
    imageUrl: "",
  };

  // =========================================================
  // GET TOKEN
  // =========================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================================================
  // FETCH PRODUCTS
  // Used after ADD / UPDATE / DELETE
  // =========================================================

  const fetchProducts = async () => {
    const token = getToken();

    if (!token) {
      setError("Please login first.");
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:8080/vendor/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(
        Array.isArray(response.data)
          ? response.data
          : []
      );

      setError("");
    } catch (err) {
      console.error("FETCH PRODUCTS ERROR:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "Access denied. Please login as an approved vendor."
        );
      } else {
        setError("Unable to load your products.");
      }
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!cancelled) {
          setError("Please login first.");
          setLoading(false);
        }
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8080/vendor/products",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!cancelled) {
          setProducts(
            Array.isArray(response.data)
              ? response.data
              : []
          );

          setError("");
        }
      } catch (err) {
        console.error(
          "INITIAL PRODUCTS FETCH ERROR:",
          err
        );

        if (!cancelled) {
          if (err.response?.status === 401) {
            setError(
              "Your session has expired. Please login again."
            );
          } else if (err.response?.status === 403) {
            setError(
              "Access denied. Please login as an approved vendor."
            );
          } else {
            setError(
              "Unable to load your products."
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
  // HANDLE INPUT
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingProduct(null);
    setShowForm(false);
    setSaving(false);
    setError("");
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const openAddProductForm = () => {
    setFormData(emptyForm);
    setEditingProduct(null);
    setMessage("");
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Please enter the product name.");
      return false;
    }

    if (!formData.category.trim()) {
      setError("Please enter the product category.");
      return false;
    }

    if (!formData.brand.trim()) {
      setError("Please enter the product brand.");
      return false;
    }

    if (!formData.description.trim()) {
      setError("Please enter the product description.");
      return false;
    }

    if (
      formData.price === "" ||
      Number(formData.price) <= 0 ||
      Number.isNaN(Number(formData.price))
    ) {
      setError(
        "Please enter a valid price greater than 0."
      );
      return false;
    }

    if (
      formData.quantity === "" ||
      Number(formData.quantity) < 0 ||
      Number.isNaN(Number(formData.quantity))
    ) {
      setError(
        "Please enter a valid stock quantity."
      );
      return false;
    }

    return true;
  };

  // =========================================================
  // CREATE PRODUCT
  // =========================================================

  const handleAddProduct = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setMessage("");
    setError("");

    if (!validateForm()) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Please login first.");
      return;
    }

    const productData = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      brand: formData.brand.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      imageUrl: formData.imageUrl.trim(),
    };

    console.log(
      "ADDING PRODUCT:",
      productData
    );

    try {
      setSaving(true);

      const response = await axios.post(
        "http://localhost:8080/vendor/products",
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "PRODUCT CREATED:",
        response.data
      );

      setMessage(
        "Product added successfully."
      );

      setFormData(emptyForm);
      setEditingProduct(null);
      setShowForm(false);

      await fetchProducts();
    } catch (err) {
      console.error(
        "PRODUCT CREATION ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "Access denied. Please login as an approved vendor."
        );
      } else if (err.response?.status === 400) {
        const backendMessage =
          err.response?.data?.message ||
          err.response?.data?.error;

        setError(
          backendMessage ||
          "Invalid product details. Please check the form."
        );
      } else if (err.response?.status === 500) {
        setError(
          "Server error while adding the product. Check the Spring Boot terminal."
        );
      } else if (err.request) {
        setError(
          "Backend is not responding. Make sure Spring Boot is running on port 8080."
        );
      } else {
        setError(
          "Unable to add product."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // START EDIT
  // =========================================================

  const startEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      category: product.category || "",
      brand: product.brand || "",
      description: product.description || "",
      price:
        product.price !== null &&
        product.price !== undefined
          ? product.price
          : "",
      quantity:
        product.quantity !== null &&
        product.quantity !== undefined
          ? product.quantity
          : "",
      imageUrl: product.imageUrl || "",
    });

    setMessage("");
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // UPDATE PRODUCT
  // =========================================================

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    if (saving || !editingProduct) {
      return;
    }

    setMessage("");
    setError("");

    if (!validateForm()) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Please login first.");
      return;
    }

    const productData = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      brand: formData.brand.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      imageUrl: formData.imageUrl.trim(),
    };

    try {
      setSaving(true);

      const response = await axios.put(
        `http://localhost:8080/vendor/products/${editingProduct.id}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "PRODUCT UPDATED:",
        response.data
      );

      setMessage(
        "Product updated successfully."
      );

      setFormData(emptyForm);
      setEditingProduct(null);
      setShowForm(false);

      await fetchProducts();
    } catch (err) {
      console.error(
        "PRODUCT UPDATE ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not allowed to update this product."
        );
      } else if (err.response?.status === 400) {
        const backendMessage =
          err.response?.data?.message ||
          err.response?.data?.error;

        setError(
          backendMessage ||
          "Please check all product details."
        );
      } else {
        setError(
          "Unable to update product."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Please login first.");
      return;
    }

    try {
      setMessage("");
      setError("");

      await axios.delete(
        `http://localhost:8080/vendor/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "Product deleted successfully."
      );

      await fetchProducts();
    } catch (err) {
      console.error(
        "DELETE PRODUCT ERROR:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not allowed to delete this product."
        );
      } else {
        setError(
          "Unable to delete product."
        );
      }
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="product-loading">
        Loading your products...
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="vendor-products">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="product-header">

        <div>
          <h2>My Products</h2>

          <p>
            Add and manage products available in your store.
          </p>
        </div>

        <button
          type="button"
          className="add-product-button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              openAddProductForm();
            }
          }}
        >
          {showForm
            ? "✕ Close"
            : "+ Add Product"}
        </button>

      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* =====================================================
          ADD / EDIT FORM
      ===================================================== */}

      {showForm && (
        <div className="product-form-card">

          <div className="product-form-header">

            <div>
              <h3>
                {editingProduct
                  ? "Edit Product"
                  : "Add New Product"}
              </h3>

              <p>
                {editingProduct
                  ? "Update your product details below."
                  : "Enter the details of your new product."}
              </p>
            </div>

          </div>

          <form
            onSubmit={
              editingProduct
                ? handleUpdateProduct
                : handleAddProduct
            }
            noValidate
          >

            <div className="form-grid">

              {/* PRODUCT NAME */}

              <div className="form-group">

                <label htmlFor="product-name">
                  Product Name
                </label>

                <input
                  id="product-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  autoComplete="off"
                  required
                />

              </div>

              {/* CATEGORY */}

              <div className="form-group">

                <label htmlFor="product-category">
                  Category
                </label>

                <input
                  id="product-category"
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Example: Electronics"
                  autoComplete="off"
                  required
                />

              </div>

              {/* BRAND */}

              <div className="form-group">

                <label htmlFor="product-brand">
                  Brand
                </label>

                <input
                  id="product-brand"
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Example: Sony"
                  autoComplete="off"
                  required
                />

              </div>

              {/* PRICE */}

              <div className="form-group">

                <label htmlFor="product-price">
                  Price
                </label>

                <input
                  id="product-price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  min="0.01"
                  step="0.01"
                  required
                />

              </div>

              {/* QUANTITY */}

              <div className="form-group">

                <label htmlFor="product-quantity">
                  Stock Quantity
                </label>

                <input
                  id="product-quantity"
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter stock quantity"
                  min="0"
                  step="1"
                  required
                />

              </div>

              {/* IMAGE URL */}

              <div className="form-group">

                <label htmlFor="product-image">
                  Image URL
                </label>

                <input
                  id="product-image"
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="Paste product image URL"
                />

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="form-group">

              <label htmlFor="product-description">
                Description
              </label>

              <textarea
                id="product-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product"
                rows="4"
                required
              />

            </div>

            {/* IMAGE PREVIEW */}

            {formData.imageUrl.trim() && (
              <div className="image-preview">

                <img
                  src={formData.imageUrl}
                  alt="Product preview"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />

              </div>
            )}

            {/* SUBMIT BUTTONS */}

            <div
              className="product-submit-section"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                width: "100%",
                minHeight: "70px",
                padding: "15px 0",
                marginTop: "20px",
                position: "relative",
                zIndex: 1000,
                overflow: "visible",
              }}
            >

              <button
                type="submit"
                className="save-product-button"
                disabled={saving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "150px",
                  height: "45px",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  position: "relative",
                  zIndex: 1001,
                }}
              >
                {saving
                  ? editingProduct
                    ? "Updating..."
                    : "Adding Product..."
                  : editingProduct
                  ? "Update Product"
                  : "Add Product"}
              </button>

              <button
                type="button"
                className="cancel-product-button"
                onClick={resetForm}
                disabled={saving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "120px",
                  height: "45px",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  position: "relative",
                  zIndex: 1001,
                }}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* =====================================================
          PRODUCT LIST
      ===================================================== */}

      <div className="product-list-card">

        <div className="product-list-header">

          <h3>
            Your Products ({products.length})
          </h3>

        </div>

        {products.length === 0 ? (

          <div className="no-products">

            <div className="no-products-icon">
              📦
            </div>

            <h4>
              No Products Yet
            </h4>

            <p>
              Add your first product to start selling.
            </p>

          </div>

        ) : (

          <div className="product-table-wrapper">

            <table className="product-table">

              <thead>

                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {products.map((product) => (

                  <tr key={product.id}>

                    <td>

                      <div className="product-name">

                        {product.imageUrl ? (

                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="product-image"
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />

                        ) : (

                          <div className="product-placeholder">
                            📦
                          </div>

                        )}

                        <span>
                          {product.name}
                        </span>

                      </div>

                    </td>

                    <td>
                      {product.category}
                    </td>

                    <td>
                      {product.brand}
                    </td>

                    <td>
                      ₹
                      {Number(
                        product.price || 0
                      ).toFixed(2)}
                    </td>

                    <td>

                      <span
                        className={
                          Number(product.quantity) === 0
                            ? "stock-out"
                            : Number(product.quantity) <= 5
                            ? "stock-low"
                            : "stock-in"
                        }
                      >
                        {product.quantity}
                      </span>

                    </td>

                    <td>

                      <div className="product-actions">

                        <button
                          type="button"
                          className="edit-product-button"
                          onClick={() =>
                            startEdit(product)
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          className="delete-product-button"
                          onClick={() =>
                            deleteProduct(product.id)
                          }
                        >
                          🗑 Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default VendorProductManagement;