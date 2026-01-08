"use client";

import React, { useEffect, useState } from "react";
import Order from "../Order/Order.jsx";
import "./Orders.css"
import apiFetch from "@/app/services/apiFetchService.js";
const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {

      const res = await apiFetch("/order");

      setOrders(res);
    };

    fetchOrders();

  }, []);

  return (
    <div className="orders-container">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <Order key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Orders;
