"use client"
import React, { useEffect, useState } from "react";
import "./CartProduct.css"
import { useRouter } from "next/navigation";
import { getImageSrc } from "@/app/utils/handleUrls";

export default function ProductCard({ product, onChangeQty = () => {}, onRemove = () => {} }) {
  const { name, price, productImagesUrl, deliveryText, discountPrice, qty = 1 , color , size} = product;

  const [resolvedImage,  setResolvedImage] = useState()
  const router = useRouter();

  let isThereDiscount = false;
  let discountPercentage = 0;

  if (discountPrice > 0) {
    isThereDiscount = true;
    discountPercentage = Math.round(((price -discountPrice) /price) * 100);
  }


  
  const SendToProductPage = () => {

    const productUrl = `/products/${product.id}`

    if (product.id != 0 || product.id != "" || product.id != null) {
    router.push(productUrl)
    }
    
  }

  useEffect(() => {
    const getResolvedImage = async () => {
      try {
        const url = await getImageSrc(productImagesUrl?.[0]);
        setResolvedImage(url || "/ProductImage-Temp.jpg");
      } catch {
        setResolvedImage("/ProductImage-Temp.jpg");
      }
    };
    getResolvedImage(); // call it!
  }, [productImagesUrl]);

  return (
    <div className="pc-card" role="listitem">
      <button className="pc-trashBtn" aria-label="حذف المنتج" onClick={() => onRemove(product)}>
        {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 6h18" stroke="#19A34A" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#19A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 11v6M14 11v6" stroke="#19A34A" strokeWidth="1.8" strokeLinecap="round"/>
        </svg> */}
        X
      </button>

      <div className="pc-imageWrap">
        <img
        onClick={() => SendToProductPage()}
          src={resolvedImage}
          alt={name}
          className="pc-image"
        />
      </div>

      <div className="pc-product-info">
        <h3 onClick={() => SendToProductPage()} className="pc-title">{name}</h3>

        {color ? (
          <p className="pc-product-color">
            اللون: <strong>{color[0].toUpperCase() + color.slice(1)}</strong>
          </p>
        ) : (
          <p className="pc-product-color">اللون: <strong>غير محدد</strong></p>
        )}

        {size ? (
          <p className="pc-product-size">
            المقاس: <strong>{size[0].toUpperCase() + size.slice(1)}</strong>
          </p>
        ) : (
          <p className="pc-product-size">المقاس: <strong>غير محدد</strong></p>
        )}

        <div className="pc-priceRow">
          {isThereDiscount && <span className="pc-badge">{discountPercentage}%</span>}       

          <div className="pc-priceArea">
            {discountPrice > 0 ? (
              <>
                <div className="pc-currentPrice">${discountPrice.toFixed(2)}</div>
                <div className="pc-oldPrice">${price.toFixed(2)}</div>
              </>
            ) : (
              <div className="pc-currentPrice">${price.toFixed(2)}</div>
            )}
          </div>
        </div>



        <div className="pc-controls">
          <div className="pc-qty">
            <button onClick={() => onChangeQty(product, Math.max(1, qty - 1))} aria-label="نقص">−</button>
            <div className="pc-qtyNumber">{qty}</div>
            <button onClick={() => onChangeQty(product, qty + 1)} aria-label="زيادة">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}
