"use client";

import Link from "next/link";
import "./order-success.css";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [timer, setTimer] = useState(5);

  useEffect(() => {
    if (!orderId) return;

    if (timer === 0) {
      window.location.href = `/orders/${orderId}`;
      return;
    }

    const timeout = setTimeout(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [timer, orderId]);

  if (!orderId) return <p>Loading...</p>;

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
          <Link href={`/orders/${orderId}`}>
            <button className="btn-success">View Order #{orderId}</button>
          </Link>

          <Link href="/orders">
            <button className="btn-success">View My Orders</button>
          </Link>

          <Link href="/">
            <button className="btn-secondary">Continue Shopping</button>
          </Link>

          <p className="timer">Redirecting in {timer} seconds…</p>
        </div>
      </div>
    </div>
  );
}
