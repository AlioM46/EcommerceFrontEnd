"use client"
// components/ProductsList.js
import React, { useState } from "react";
import ProductCard from "../CartProduct/CartProduct";
import { useAuth } from "@/app/context/AuthContext";
import "./ProductsCartList.css"

export default function ProductsList() {


  const {cartItems, setCartItems} = useAuth();


 function handleChangeQty(prod, newQty) {
  const updated = cartItems.map(p =>
    p.id === prod.id ? { ...p, qty: newQty } : p
  );
  setCartItems(updated);
  window.localStorage.setItem("cart", JSON.stringify(updated));
}

function handleRemove(prod) {
  const updated = cartItems.filter(p => p.id !== prod.id);
  setCartItems(updated);
  window.localStorage.setItem("cart", JSON.stringify(updated));
}

  return (
    <div className="cart-products-list" style={{maxWidth:760, margin:"20px auto"}}>
      <h1 style={{textAlign:"right", fontSize:28, marginBottom:18}}>سلة التسوق</h1>

      <div className="cart-products-container">

      {cartItems.length === 0 ? (
        <p style={{textAlign:"center", color:"#666"}}>السلة فارغة</p>
      ) : (
        cartItems.map((p, i) => (
          <ProductCard
          key={i}
          product={p}
          onChangeQty={handleChangeQty}
          onRemove={handleRemove}
          />
        ))
      )}
      </div>
    </div>
  );
}
