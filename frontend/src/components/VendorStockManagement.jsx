import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8080";

function VendorStockManagement() {

    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    const getConfig = () => ({
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const loadStock = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/vendor/stock`,
                getConfig()
            );

            setStock(response.data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load stock"
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        let cancelled = false;

        const load = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await axios.get(
                    `${API_URL}/vendor/stock`,
                    getConfig()
                );

                if (!cancelled) {
                    setStock(response.data);
                }

            } catch (err) {

                console.error(err);

                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load stock"
                    );
                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };

    }, []);

    const updateStock = async (productId, quantity) => {

        try {

            setMessage("");
            setError("");

            await axios.put(
                `${API_URL}/vendor/stock/${productId}`,
                {
                    quantity: Number(quantity)
                },
                getConfig()
            );

            setMessage("Stock updated successfully.");

            await loadStock();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to update stock"
            );
        }
    };

    const increaseStock = async (productId) => {

        const amount = prompt(
            "Enter quantity to add:"
        );

        if (!amount) return;

        if (Number(amount) <= 0) {
            setError("Enter a valid quantity.");
            return;
        }

        try {

            setMessage("");
            setError("");

            await axios.put(
                `${API_URL}/vendor/stock/${productId}/increase`,
                {
                    quantity: Number(amount)
                },
                getConfig()
            );

            setMessage("Stock increased successfully.");

            await loadStock();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to increase stock"
            );
        }
    };

    const decreaseStock = async (productId) => {

        const amount = prompt(
            "Enter quantity to remove:"
        );

        if (!amount) return;

        if (Number(amount) <= 0) {
            setError("Enter a valid quantity.");
            return;
        }

        try {

            setMessage("");
            setError("");

            await axios.put(
                `${API_URL}/vendor/stock/${productId}/decrease`,
                {
                    quantity: Number(amount)
                },
                getConfig()
            );

            setMessage("Stock decreased successfully.");

            await loadStock();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to decrease stock"
            );
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "20px" }}>
                Loading inventory...
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px"
                }}
            >

                <div>
                    <h2>Stock Management</h2>
                    <p>
                        Manage your product inventory
                    </p>
                </div>

                <button onClick={loadStock}>
                    Refresh
                </button>

            </div>

            {message && (
                <div
                    style={{
                        padding: "10px",
                        marginBottom: "15px",
                        borderRadius: "6px"
                    }}
                >
                    {message}
                </div>
            )}

            {error && (
                <div
                    style={{
                        padding: "10px",
                        marginBottom: "15px",
                        borderRadius: "6px"
                    }}
                >
                    {error}
                </div>
            )}

            {stock.length === 0 ? (

                <div>
                    <h3>No inventory found</h3>
                    <p>
                        Add a product first from Product Management.
                    </p>
                </div>

            ) : (

                <div style={{ overflowX: "auto" }}>

                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse"
                        }}
                    >

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Product</th>
                                <th>Total Stock</th>
                                <th>Reserved</th>
                                <th>Available</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {stock.map((item) => (

                                <tr key={item.id}>

                                    <td>
                                        {item.product?.id}
                                    </td>

                                    <td>
                                        {item.product?.name ||
                                            "Unknown Product"}
                                    </td>

                                    <td>
                                        {item.quantity}
                                    </td>

                                    <td>
                                        {item.reservedQuantity}
                                    </td>

                                    <td>
                                        {item.availableQuantity}
                                    </td>

                                    <td>
                                        {item.lastUpdated
                                            ? new Date(
                                                item.lastUpdated
                                            ).toLocaleString()
                                            : "-"}
                                    </td>

                                    <td>

                                        <button
                                            onClick={() =>
                                                increaseStock(
                                                    item.product.id
                                                )
                                            }
                                            style={{
                                                marginRight: "5px"
                                            }}
                                        >
                                            + Add
                                        </button>

                                        <button
                                            onClick={() =>
                                                decreaseStock(
                                                    item.product.id
                                                )
                                            }
                                            style={{
                                                marginRight: "5px"
                                            }}
                                        >
                                            - Remove
                                        </button>

                                        <button
                                            onClick={() => {

                                                const quantity =
                                                    prompt(
                                                        "Enter new total stock:",
                                                        item.quantity
                                                    );

                                                if (
                                                    quantity !== null &&
                                                    Number(quantity) >= 0
                                                ) {
                                                    updateStock(
                                                        item.product.id,
                                                        quantity
                                                    );
                                                }

                                            }}
                                        >
                                            Edit
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}

export default VendorStockManagement;