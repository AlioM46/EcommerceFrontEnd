"use client"

import { useAuth } from "@/app/context/AuthContext";
import Button from "../Button/Button";
import Link from "next/link";
import "./ProductCard.css";
import { getImageSrc } from "@/app/utils/handleUrls";
import { useEffect, useState } from "react";

export default function ProductCard({ product }) {
  const {
    id,
    name = "No Name",
    price = 0,
    discount_price = null,
    images = [],
    in_stock = 0,
  } = product;

  const { addToCart } = useAuth();
  const [previewImage, setPreviewImage] = useState("/ProductImage-Temp.jpg"); // default placeholder


  useEffect(() => {
    if (images.length > 0 && images[0].full_url) {
      setPreviewImage(images[0].full_url);
    }
  },[images])

  const isThereDiscount = discount_price > 0;
  const discountPercentage = isThereDiscount
    ? Math.round(((price - discount_price) / price) * 100)
    : 0;

  return (
    <div className="product-card">
      <Link href={`/products/${id}`}>
        <div className="product-image-wrapper">
          <img src={previewImage} alt={name} className="product-img" />
        </div>
      </Link>

      <div className="product-info">
        <div className="info">
          <h3 className="product-name">{name}</h3>
        </div>

        <div className="price-section">
          <p className={`stock ${in_stock > 0 ? "in-stock" : "out-stock"}`}>
            {in_stock > 0 ? "متوفر الان" : "غير متوفر"}
          </p>
          {isThereDiscount ? (
            <>
              <span className="old-price">
                <span className="dollarSign">$</span>
                {price}
              </span>
              <span className="price">
                <span className="dollarSign">$</span>
                {discount_price}
              </span>
            </>
          ) : (
            <span className="price">
              <span className="dollarSign">$</span>
              {price}
            </span>
          )}
        </div>
      </div>

      <Button onClick={() => addToCart(product)}>أضف إلى السلة 🛒</Button>
    </div>
  );
}
