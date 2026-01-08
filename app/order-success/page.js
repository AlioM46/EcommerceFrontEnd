"use client";

import Link from "next/link";
import "./order-success.css";

export default function OrderSuccessPage() {
  return (
    <div className="success-wrapper">
      <div className="success-card">
        <div className="success-icon">
          <svg
            width="72"
            height="72"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-success)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className="success-title">Payment Successful</h1>

        <p className="success-text">
          Thank you! Your order has been placed successfully and is now being
          processed.
        </p>

        <div className="success-actions">
          <Link href="/orders">
            <button className="btn-success">View My Orders</button>
          </Link>

          <Link href="/">
            <button className="btn-secondary">Continue Shopping</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
