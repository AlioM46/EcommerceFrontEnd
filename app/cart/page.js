"use client"

import React, { useEffect, useState } from 'react'
import "./cart.css"
import CartForm from '../components/CartForm/CartForm'
import ProductsList from '../components/ProductsCartList/ProductsCartList';


export default function Cart() {


  


  return (
    <main className="cart">

<div className="form">
<CartForm/>
</div>

<div className="products">
<ProductsList  />
</div>

    </main>
  )
}
