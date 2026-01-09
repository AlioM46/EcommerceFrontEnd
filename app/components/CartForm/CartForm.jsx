"use client";
import React, { useState, useEffect } from "react";
import "./CartForm.css";
import Button from "../Button/Button";
import { useAuth } from "@/app/context/AuthContext";
import apiFetch from "@/app/services/apiFetchService";
import Link from "next/link";
import { stripePromise } from "@/app/utils/stripe";

export default function CheckoutForm() {
  const { cartItems , setCartItems} = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    discountCode: "",
    address_id: null, // <-- store selected address ID
  });

  const [addresses, setAddresses] = useState([]);
  const [errors, setErrors] = useState({});
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);

  // Load user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      const res = await apiFetch("/address"); // GET /address
      if (res?.isSuccess) {
        setAddresses(res.data || []);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, address_id: res.data[0].id }));
        }
      }
    };

    fetchAddresses();
  }, []);

  // Calculate subtotal & total whenever cartItems change
  useEffect(() => {
    const sum = cartItems.reduce((acc, p) => {
      const price = p.discount_price && p.discount_price > 0 ? p.discount_price : p.price;
      return acc + price * (p.qty || 1);
    }, 0);

    setSubtotal(sum);
    setTotal(sum + shipping);
  }, [cartItems, shipping]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    setFormData(prev => ({ ...prev, address_id: parseInt(e.target.value) }));
  };

  const handleCheckout = async () => {

console.log("cartItems", cartItems);
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!formData.address_id) {
      alert("Please select an address or create a new one.");
      return;
    }

    const order_products = cartItems.map(item => ({
      product_id: item.id,
      quantity: item.qty || 1,
      size: item.size || null,
      color: item.color || null
    }));

    const response = await apiFetch("/checkout", {
      method: "POST",
      body: JSON.stringify({
        address_id: formData.address_id,
        items: order_products,
      }),
    });


    if (!response?.isSuccess) {

      alert("Failed to create checkout session. Please try again.");
      return;
    }
    const { sessionUrl } = response; 
    


  if (sessionUrl) {
    
    setCartItems([]);
    window.localStorage.setItem("cart", JSON.stringify([]));
    
    window.location.href = sessionUrl;


  }
  };

  return (
    <div className="checkout-container">
      <h2 className="section-title">اختر عنوان الشحن</h2>

      {addresses.length > 0 ? (
        <div className="form-group mb-4">
          <select value={formData.address_id} onChange={handleAddressChange}>
            {addresses.map(addr => (
              <option key={addr.id} value={addr.id}>
                {addr.full_name} - {addr.address}, {addr.city}, {addr.country}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p>
          لم يتم إضافة عناوين بعد. <Link href="/address">اضغط هنا لإضافة عنوان جديد</Link>
        </p>
      )}

      <h2 className="section-title">تفاصيل الطلبية</h2>
      <div className="order-details mb-4">
        {cartItems.length > 0 ? (
          cartItems.map((p, i) => {
            const price = p.discount_price && p.discount_price > 0 ? p.discount_price : p.price;
            return (
              <div key={i} className="order-item">
                <span>{p.name}</span>
                <span>{p.qty || 1} × {price.toFixed(2)} $</span>
              </div>
            );
          })
        ) : (
          <div className="order-item placeholder">
            <span>لا توجد منتجات</span>
          </div>
        )}
      </div>

      <h2 className="section-title">ملخص الطلبية</h2>
      <div className="order-summary mb-2">
        <div className="summary-row">
          <span>المجموع الفرعي ({cartItems.length} منتجات)</span>
          <span>{subtotal.toFixed(2)} $</span>
        </div>
        <div className="summary-row">
          <span>مصاريف الشحن</span>
          <span>{shipping.toFixed(2)} $</span>
        </div>
      </div>

      <hr className="divider" />
      <div className="summary-final">
        <span>الإجمالي</span>
        <span>{total.toFixed(2)} $</span>
      </div>

      <br />
      <Button onClick={handleCheckout}>
        إتمام الطلب | Stripe
      </Button>
    </div>
  );
}
