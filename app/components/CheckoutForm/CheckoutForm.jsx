"use client";

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import "./CheckoutForm.css"; // import CSS

export default function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else if (paymentIntent.status === "succeeded") {
      alert("Payment successful!");
      window.location.href = "/order-success";
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      {errorMsg && <div className="error-msg">{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <label>
          Card Details
          <div className="card-element-wrapper">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#111",
                    "::placeholder": { color: "#888" },
                    fontFamily: "Arial, sans-serif",
                  },
                  invalid: { color: "#ff4d4f" },
                },
              }}
            />
          </div>
        </label>

        <button type="submit" disabled={!stripe || loading}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </form>

      <p className="secure-note">Secure payment powered by Stripe.</p>
    </div>
  );
}
