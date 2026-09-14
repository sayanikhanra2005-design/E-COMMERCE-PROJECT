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
  // FETCH VENDOR PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "http://localhost:8080/vendor/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(response.data);
    } catch (err) {
      console.error("Product loading error:", err);

      if (err.response?.status === 403) {
        setError(
          "Access denied. Please login as an approved vendor."
        );
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Unable to load your products.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

useEffect(() => {
  let ignore = false;

  const loadProducts = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        if (!ignore) {
          setError("Please login first.");
          setLoading(false);
        }
        return;
      }

      const response = await axios.get(
        "http://localhost:8080/vendor/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!ignore) {
        setProducts(response.data);
        setLoading(false);
      }
    } catch (err) {
      console.error("Product loading error:", err);

      if (!ignore) {
        if (err.response?.status === 403) {
          setError(
            "Access denied. Please login as an approved vendor."
          );
        } else if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError("Unable to load your products.");
        }

        setLoading(false);
      }
    }
  };

  loadProducts();

  return () => {
    ignore = true;
  };
}, []);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      brand: "",
      description: "",
      price: "",
      quantity: "",
      imageUrl: "",
    });

    setEditingProduct(null);
    setShowForm(false);
  };

  // =========================================================
  // ADD PRODUCT
  // =========================================================

  const handleAddProduct = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      await axios.post(
        "http://localhost:8080/vendor/products",
        {
          name: formData.name,
          category: formData.category,
          brand: formData.brand,
          description: formData.description,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          imageUrl: formData.imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("Product added successfully.");

      resetForm();

      await fetchProducts();

    } catch (err) {
      console.error("Product creation error:", err);

      if (err.response?.status === 403) {
        setError(
          "Access denied. Please login as an approved vendor."
        );
      } else if (err.response?.status === 400) {
        setError("Please check all product details.");
      } else {
        setError("Unable to add product.");
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
      price: product.price ?? "",
      quantity: product.quantity ?? "",
      imageUrl: product.imageUrl || "",
    });

    setShowForm(true);
    setMessage("");
    setError("");

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

    if (!editingProduct) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      await axios.put(
        `http://localhost:8080/vendor/products/${editingProduct.id}`,
        {
          name: formData.name,
          category: formData.category,
          brand: formData.brand,
          description: formData.description,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          imageUrl: formData.imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("Product updated successfully.");

      resetForm();

      await fetchProducts();

    } catch (err) {
      console.error("Product update error:", err);

      if (err.response?.status === 403) {
        setError(
          "You are not allowed to update this product."
        );
      } else if (err.response?.status === 400) {
        setError("Please check all product details.");
      } else {
        setError("Unable to update product.");
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

    try {
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      await axios.delete(
        `http://localhost:8080/vendor/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Product deleted successfully.");

      await fetchProducts();

    } catch (err) {
      console.error("Delete product error:", err);

      if (err.response?.status === 403) {
        setError(
          "You are not allowed to delete this product."
        );
      } else {
        setError("Unable to delete product.");
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
          className="add-product-button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
              setEditingProduct(null);
              setMessage("");
              setError("");
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

          <h3>
            {editingProduct
              ? "Edit Product"
              : "Add New Product"}
          </h3>

          <form
            onSubmit={
              editingProduct
                ? handleUpdateProduct
                : handleAddProduct
            }
          >

            <div className="form-grid">

              {/* PRODUCT NAME */}

              <div className="form-group">

                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />

              </div>

              {/* CATEGORY */}

              <div className="form-group">

                <label>
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Example: Electronics"
                  required
                />

              </div>

              {/* BRAND */}

              <div className="form-group">

                <label>
                  Brand
                </label>

                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Example: Sony"
                  required
                />

              </div>

              {/* PRICE */}

              <div className="form-group">

                <label>
                  Price
                </label>

                <input
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

                <label>
                  Stock Quantity
                </label>

                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter stock quantity"
                  min="0"
                  required
                />

              </div>

              {/* IMAGE URL */}

              <div className="form-group">

                <label>
                  Image URL
                </label>

                <input
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

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product"
                rows="4"
                required
              />

            </div>

            {/* IMAGE PREVIEW */}

            {formData.imageUrl && (
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

            {/* FORM BUTTONS */}

            <div className="form-actions">

              <button
                type="submit"
                className="save-product-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Add Product"}
              </button>

              {editingProduct && (
                <button
                  type="button"
                  className="cancel-edit-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </div>
      )}

      {/* =====================================================
          PRODUCT LIST
      ===================================================== */}

      <div className="product-list-card">

        <h3>
          Your Products ({products.length})
        </h3>

        {products.length === 0 ? (

          <div className="no-products">

            <div>📦</div>

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

                    {/* PRODUCT */}

                    <td>

                      <div className="product-name">

                        {product.imageUrl ? (

                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="product-image"
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

                    {/* CATEGORY */}

                    <td>
                      {product.category}
                    </td>

                    {/* BRAND */}

                    <td>
                      {product.brand}
                    </td>

                    {/* PRICE */}

                    <td>
                      ₹{Number(product.price).toFixed(2)}
                    </td>

                    {/* STOCK */}

                    <td>

                      <span
                        className={
                          product.quantity === 0
                            ? "stock-out"
                            : product.quantity <= 5
                            ? "stock-low"
                            : "stock-in"
                        }
                      >
                        {product.quantity}
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="product-actions">

                        <button
                          className="edit-product-button"
                          onClick={() =>
                            startEdit(product)
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
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