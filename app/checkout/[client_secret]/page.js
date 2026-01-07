"use client";

import CheckoutWrapper from "@/app/components/CheckoutWrapper/CheckoutWrapper";
import { useAuth } from "@/app/context/AuthContext";
import { useParams } from "next/navigation";

export default function CheckoutPage() {
  const params = useParams();
  const clientSecret = params.client_secret; // from URL

  if (!clientSecret) return <p>Loading payment...</p>;




  return <CheckoutWrapper clientSecret={clientSecret} />;
}
