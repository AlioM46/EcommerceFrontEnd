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
    discountPrice = null,
    productImagesUrl = [],
    inStock = 0,
  } = product;

  const { addToCart } = useAuth();
  const [imgSrc, setImgSrc] = useState("/ProductImage-Temp.jpg"); // default placeholder

  // Resolve pre-signed URL asynchronously
  useEffect(() => {
    const fetchImage = async () => {
      if (productImagesUrl?.length > 0) {
        const url = await getImageSrc(productImagesUrl[0]);
        setImgSrc(url || "/ProductImage-Temp.jpg");
      }
    };
    fetchImage();
  }, [productImagesUrl]);

  const isThereDiscount = discountPrice > 0;
  const discountPercentage = isThereDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  return (
    <div className="product-card">
      <Link href={`/products/${id}`}>
        <div className="product-image-wrapper">
          <img src={imgSrc} alt={name} className="product-img" />
        </div>
      </Link>

      <div className="product-info">
        <div className="info">
          <h3 className="product-name">{name}</h3>
        </div>

        <div className="price-section">
          <p className={`stock ${inStock > 0 ? "in-stock" : "out-stock"}`}>
            {inStock > 0 ? "متوفر الان" : "غير متوفر"}
          </p>
          {isThereDiscount ? (
            <>
              <span className="old-price">
                <span className="dollarSign">$</span>
                {price}
              </span>
              <span className="price">
                <span className="dollarSign">$</span>
                {discountPrice}
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
