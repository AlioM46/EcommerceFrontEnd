"use client"
import React, { useState, useEffect } from "react";
import "./dashboardProduct.css";
import Button from "../../Button/Button";
import Link from "next/link";
import apiFetch from "@/app/services/apiFetchService";
import { useAuth } from "@/app/context/AuthContext";
import { getImageSrc } from "@/app/utils/handleUrls";

export default function DashboardProduct({ product, fetchProducts, currentPage }) {
  const { name, price, productImagesUrl, discountPrice, inStock, isActive } = product;
  const [isProductActive, setIsProductActive] = useState(isActive);
  const [imgSrc, setImgSrc] = useState("/ProductImage-Temp.jpg"); // default placeholder
  const { setToast } = useAuth();
  const [hasSheinUrl ,setHasSheinUrl ] =useState(false);



  useEffect(() => {

    if (product?.sheinUrl?.length >0) {
      setHasSheinUrl(true)
    } else {
      setHasSheinUrl(false)
    }


  },[product])

  // Resolve image URL asynchronously
  useEffect(() => {
    const fetchImage = async () => {
      if (productImagesUrl?.length > 0) {
        const url = await getImageSrc(productImagesUrl[0]);
        setImgSrc(url || "/ProductImage-Temp.jpg");
      }
    };
    fetchImage();
  }, [productImagesUrl]);

  const RemoveProduct = async () => {
    const res = await apiFetch(`/product/${product.id}`, { method: "DELETE" });

    if (res.isSuccess) {
      setToast({ show: true, message: "تم حذف المنتج بنجاح" });
      fetchProducts(currentPage);
    } else {
      setToast({ show: true, message: "فشل حذف المنتج", error: true });
    }
  };

  const onRemove = () => {
    const isConfirmed = window.confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟");
    if (isConfirmed) RemoveProduct();
  };

  const updatePrice = async () => {
    try {
      if (!hasSheinUrl) {
              setToast({ show: true, error :true,message: ` لايمكن تحديث هذا المنتج’, يجب ان يكون مضافاً على النظام الجديد` });
      }

      const res = await apiFetch(`/Product/upadte-shein-price?productId=${product.id}&url=${product.sheinUrl}`);
      if (res.isSuccess) {
        setToast({ show: true, message: "تم تحديث سعر المنتج بنجاح!" });
        fetchProducts(currentPage);
      }
    } catch (err) {
      setToast({ show: true, error :true,message: `${err?.message}: فشلت عملية تحديث المنتج` });
    }
  };

  const handleActiveAndHide = async () => {
    try {
      const res = await apiFetch(
        `/product/isActive?productId=${product.id}&isActive=${!isProductActive}`,
        { method: "PUT" }
      );

      if (res.isSuccess) {
        setIsProductActive((prev) => !prev);
        setToast({ error: false, message: "تم تعديل حالة المنتج بنجاح!", show: true });
      } else {
        setToast({ error: true, message: "حدث خطأ ما, الرجاء المحاولة مرة اخرى!", show: true });
      }
    } catch (err) {
      console.error(err);
      setToast({ error: true, message: "حدث خطأ ما, الرجاء المحاولة مرة اخرى!", show: true });
    }
  };

  const isThereDiscount = discountPrice > 0;
  const stockClass = inStock > 0 ? "dashboard-in-stock" : "dashboard-out-stock";
  const stockText = inStock > 0 ? "متوفر" : "غير متوفر";

  return (
    <div className="dashboard-card" role="listitem">
      {/* Product Image */}
      <div className="dashboard-product-image-wrapper">
        <img src={imgSrc} alt={name} className="dashboard-product-img" />
      </div>

      {/* Product Info */}
      <div className="dashboard-product-info">
        <div className="dashboard-info-wrapper">
          <h3 className="dashboard-product-name">{name}</h3>

          <div className="dashboard-price-section">
            <div className="dashboard-price-area">
              {isThereDiscount ? (
                <>
                  <div className="dashboard-price">${discountPrice.toFixed(2)}</div>
                  <div className="dashboard-old-price">${price.toFixed(2)}</div>
                </>
              ) : (
                <div className="dashboard-price">${price.toFixed(2)}</div>
              )}
            </div>

            <div className={`dashboard-stock ${stockClass}`}>{stockText}</div>
          </div>
        </div>

        {product?.sku?.length > 0 && <p>Shein Code - SKU: {product.sku}</p>}

        <div className="dashboard-buttons-container">
          {product?.sku?.length > 0 && (
            <button
              className="dashboard-updatePrice"
              aria-label="تحديث سعر المنتج من شي ان"
              onClick={updatePrice}
              disabled={!hasSheinUrl}
            >
              تحديث سعر المنتج من شي ان
            </button>
          )}

          <button className="dashboard-trashBtn" aria-label="حذف المنتج" onClick={onRemove}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 6h18" stroke="#19A34A" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#19A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 11v6M14 11v6" stroke="#19A34A" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* Edit button */}
          <Link href={`/dashboard/add-update-product/${product.id}`}>
            <Button>تعديل</Button>
          </Link>

          <Button
            className={`dashboard-product-button ${
              isProductActive ? "dashboard-product-button-active" : "dashboard-product-button-hide"
            }`}
            onClick={handleActiveAndHide}
          >
            {isProductActive ? "اخفاء المنتج" : "عرض المنتج للجميع"}
          </Button>
        </div>
      </div>
    </div>
  );
}
