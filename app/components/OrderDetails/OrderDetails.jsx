"use client";

import { useEffect, useState } from "react";
import apiFetch from "@/app/services/apiFetchService";
import "./OrderDetails.css";
import Link from "next/link";

const OrderDetails = ({ orderId }) => {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const data = await apiFetch(`/order/${orderId}`);
      console.log(data);
      if (data) setOrder(data);
    };
    fetchOrder();
  }, [orderId]);

  if (!order) return <div className="order-details">Loading...</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "paid":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="order-details container">
      <h1>Order Details #{order.id}</h1>

      {/* Shipping Address */}
      <div className="section">
        <h2>Shipping Address</h2>
        <p><strong>{order.address.full_name}</strong></p>
        <p>{order.address.address}</p>
        <p>
          {order.address.city}, {order.address.state}, {order.address.country}
        </p>
        <p>{order.address.postal_code}</p>
        <p>Phone: {order.address.phone}</p>
      </div>

      {/* Products */}
      <div className="section">
        <h2>Products</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Size</th>
              <th>Color</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.products.map((p) => (
              <tr key={p.id}>
                <td ><Link href={`/products/${p.id}`}>{p.name}</Link></td>
                <td>${p.pivot.price}</td>
                <td>{p.pivot.quantity}</td>
                <td>{p.pivot.size || "-"}</td>
                <td style={{ color: p.pivot.color   }}>{p.pivot.color || "-"}</td>
                <td>${(p.pivot.price * p.pivot.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Info */}
      <div className="section">
        <h2>Payment</h2>
        <p>
          Method: <strong>{order.payment.payment_method}</strong>
        </p>
        <p>
          Status:{" "}
          <strong style={{ color: getStatusColor(order.payment.status) }}>
            {order.payment.status.toUpperCase()}
          </strong>
        </p>
        <p>Total: <strong>${order.total_price}</strong></p>
      </div>
    </div>
  );
};

export default OrderDetails;
