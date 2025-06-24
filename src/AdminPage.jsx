import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminPage.css";

const AdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch orders from the API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3005/api/orders");
        console.log("Raw API response:", response);
        console.log("Orders data:", response.data);
        if (response.data && response.data.length > 0) {
          console.log("First order details:", {
            orderId: response.data[0].orderId,
            orderDate: response.data[0].orderDate,
            totalPrice: response.data[0].totalPrice,
            orderStatus: response.data[0].orderStatus,
          });
        }
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch orders. Please try again later.");
        setLoading(false);
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on status and search term
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" ||
      order.orderStatus?.toLowerCase() === filterStatus.toLowerCase();

    const searchLower = searchTerm.toLowerCase();
    // Search in order ID
    const idMatch = order._id?.toLowerCase().includes(searchLower);

    // Search in shipping address
    const addressMatch =
      order.shippingAddress &&
      (order.shippingAddress.street?.toLowerCase().includes(searchLower) ||
        order.shippingAddress.city?.toLowerCase().includes(searchLower) ||
        order.shippingAddress.state?.toLowerCase().includes(searchLower) ||
        order.shippingAddress.zipCode?.toLowerCase().includes(searchLower));

    // Search in items
    const itemsMatch =
      order.items &&
      order.items.some((item) =>
        item.productName?.toLowerCase().includes(searchLower)
      );

    // Search in total price
    const totalMatch = order.total?.toString().includes(searchTerm);

    return (
      matchesStatus && (idMatch || addressMatch || itemsMatch || totalMatch)
    );
  });

  console.log("Filtered orders:", filteredOrders);
  console.log("Filter status:", filterStatus);
  console.log("Search term:", searchTerm);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log("Updating order status:", { orderId, newStatus });
      const response = await axios.patch(
        `http://localhost:3005/api/orders/${orderId}`,
        {
          orderStatus: newStatus,
        }
      );
      console.log("Update response:", response.data);

      // Update the local state with the complete order data from the response
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? response.data : order
        )
      );

      // Update the selected order if it's open
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(response.data);
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "N/A";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return "N/A";
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-badge pending";
      case "Processing":
        return "status-badge processing";
      case "Shipped":
        return "status-badge shipped";
      case "Delivered":
        return "status-badge delivered";
      case "Cancelled":
        return "status-badge cancelled";
      default:
        return "status-badge";
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>PC Builder Admin Dashboard</h1>
        <div className="admin-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by order ID, address, products, or total"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </header>

      <div className="admin-content">
        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p>{orders.length}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p>
              {
                orders.filter(
                  (order) => order.orderStatus?.toLowerCase() === "pending"
                ).length
              }
            </p>
          </div>
          <div className="stat-card">
            <h3>Processing</h3>
            <p>
              {
                orders.filter(
                  (order) => order.orderStatus?.toLowerCase() === "processing"
                ).length
              }
            </p>
          </div>
          <div className="stat-card">
            <h3>Shipped</h3>
            <p>
              {
                orders.filter(
                  (order) => order.orderStatus?.toLowerCase() === "shipped"
                ).length
              }
            </p>
          </div>
          <div className="stat-card">
            <h3>Delivered</h3>
            <p>
              {
                orders.filter(
                  (order) => order.orderStatus?.toLowerCase() === "delivered"
                ).length
              }
            </p>
          </div>
        </div>

        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders && filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>${order.total}</td>
                    <td>
                      <span className={getStatusBadgeClass(order.orderStatus)}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-orders">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Order Details: {selectedOrder.orderId}</h2>
                <button
                  className="close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  &times;
                </button>
              </div>

              <div className="modal-body">
                <div className="order-section">
                  <h3>Order Items</h3>
                  <div className="components-grid">
                    {selectedOrder.items &&
                      selectedOrder.items.map((item, index) => (
                        <div key={item._id} className="component-card">
                          <h4>{item.productName}</h4>
                          <p>Price: ${item.price}</p>
                          <p>Quantity: {item.quantity}</p>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="order-section">
                  <h3>Order Details</h3>
                  <div className="info-grid">
                    <div>
                      <strong>Order ID:</strong> {selectedOrder._id}
                    </div>
                    <div>
                      <strong>Total Amount:</strong> ${selectedOrder.total}
                    </div>
                    <div>
                      <strong>Payment Method:</strong>{" "}
                      {selectedOrder.paymentMethod}
                    </div>
                    <div>
                      <strong>Order Date:</strong>{" "}
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="order-section">
                  <h3>Shipping Address</h3>
                  <div className="info-grid">
                    <div>
                      <strong>Street:</strong>{" "}
                      {selectedOrder.shippingAddress.street}
                    </div>
                    <div>
                      <strong>City:</strong>{" "}
                      {selectedOrder.shippingAddress.city}
                    </div>
                    <div>
                      <strong>State:</strong>{" "}
                      {selectedOrder.shippingAddress.state}
                    </div>
                    <div>
                      <strong>ZIP Code:</strong>{" "}
                      {selectedOrder.shippingAddress.zipCode}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <div className="status-update">
                  <label htmlFor="status-select">Update Status:</label>
                  <select
                    id="status-select"
                    value={selectedOrder.orderStatus || "pending"}
                    onChange={(e) =>
                      updateOrderStatus(selectedOrder._id, e.target.value)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <button
                  className="close-modal-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
