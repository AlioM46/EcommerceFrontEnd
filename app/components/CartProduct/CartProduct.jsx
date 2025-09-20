"use client"
// components/ProductCard.js
import React from "react";
import "./CartProduct.css"
import { getImageSrc } from "@/app/utils/handleUrls";


export default function ProductCard({ product, onChangeQty = () => {}, onRemove = () => {} }) {
  const { name, price, productImagesUrl, deliveryText, discountPrice, qty = 1 , color , size} = product;


  let isThereDiscount = false;
  let discountPercentage = 0;

  if (discountPrice > 0) {
    isThereDiscount = true;
    discountPercentage = Math.round(((price -discountPrice) /price) * 100);

  }


  return (
    <div className="card" role="listitem">
      <button className={"trashBtn"} aria-label="حذف المنتج" onClick={() => onRemove(product)}>
        {/* simple trash svg */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 6h18" stroke="#19A34A" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#19A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 11v6M14 11v6" stroke="#19A34A" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      <div className="imageWrap">
<img
  src={getImageSrc(productImagesUrl?.[0]) || "/ProductImage-Temp.jpg"}
  alt={name}
  className="image"
/>
      </div>

      <div className={"product-info"}>
        <h3 className={"title"}>{name}</h3>
 {color ? (
    <p className="product-color">
      اللون: <strong>{color[0].toUpperCase() + color.slice(1)}</strong>
    </p>
  ) : (
    <p className="product-color">اللون: <strong>غير محدد</strong></p>
  )}

  {size ? (
    <p className="product-size">
      المقاس: <strong>{size[0].toUpperCase() + size.slice(1)}</strong>
    </p>
  ) : (
    <p className="product-size">المقاس: <strong>غير محدد</strong></p>
  )}

        <div className={"priceRow"}>

{isThereDiscount &&             <span className={"badge"}>{discountPercentage}%</span>}       

          <div className={"priceArea"}>


{discountPrice > 0 ? <> <div className={"currentPrice"}>${discountPrice.toFixed(2)}</div> <div className={"oldPrice"}>${price.toFixed(2)}</div> </>  :<div className={"currentPrice"}>${price.toFixed(2)}</div> }



          </div>
        </div>

        <div className={"delivery"}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{marginLeft:6}}>
            <path d="M3 7h13v9H3z" stroke="#444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 10h4l1 2v4" stroke="#444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="7.5" cy="18.5" r="1.5" stroke="#444" strokeWidth="1.2"/>
            <circle cx="18.5" cy="18.5" r="1.5" stroke="#444" strokeWidth="1.2"/>
          </svg>
          <span>طلبك سيصل في غضون بضعة ايام!</span>
        </div>

        <div className={"controls"}>
          <div className={"qty"}>
            <button onClick={() => onChangeQty(product, Math.max(1, qty - 1))} aria-label="نقص">
              −
            </button>
            <div className={"qtyNumber"}>{qty}</div>
            <button onClick={() => onChangeQty(product, qty + 1)} aria-label="زيادة">
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
