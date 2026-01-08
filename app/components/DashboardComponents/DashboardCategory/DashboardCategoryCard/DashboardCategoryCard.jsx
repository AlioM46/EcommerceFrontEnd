"use client";

import React, { useEffect, useState } from "react";
import "./CategoryCard.css"; // optional: your CSS file
import { useAuth } from "@/app/context/AuthContext";
import apiFetch from "@/app/services/apiFetchService";
import Button from "@/app/components/Button/Button";
import { useRouter } from "next/navigation";
import { getImageSrc } from "@/app/utils/handleUrls";

export default function CategoryCard({ id, name, imgUrl, productCount, fetchCategories }) {
  const { setToast } = useAuth();



  const  [resolvedImage, setResolvedImage] = useState()
  const router = useRouter();


  useEffect(() => {

    const fetchImg = async () => {
          if (imgUrl) {
      setResolvedImage(await getImageSrc(imgUrl));
    }
    }

    fetchImg();

  },[imgUrl])

  console.log("RES",resolvedImage)


  // DELETE handler
  const handleDelete = async () => {
    const isConfirmed = window.confirm(`هل أنت متأكد أنك تريد حذف التصنيف "${name}"؟`);
    if (!isConfirmed) return;

    try {
      const res = await apiFetch(`/categories/${id}`, { method: "DELETE" });
      if (res.isSuccess) {
        setToast({ show: true, message: "تم حذف التصنيف بنجاح", error: false });
        if (fetchCategories) fetchCategories();
      } else {
        setToast({ show: true, message: res.message || "فشل حذف التصنيف", error: true });
      }
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: "حدث خطأ أثناء الحذف", error: true });
    }
  };

  return (
    <div className="category-card">
      <div className="category-image-wrapper">
        <img src={resolvedImage} alt={name} className="category-image" />
      </div>

      <div className="category-info">
        <h3 className="category-name">{name}</h3>
        {/* <p className="category-count">{productCount} منتج</p> */}

        <div className="category-buttons">
         <div className="category-buttons">
  {/* DELETE Button */}
  <Button className="category-btn delete-btn" onClick={handleDelete}>
    حذف
  </Button>

  {/* EDIT Button */}
  <Button
    className="category-btn edit-btn"
    onClick={() => router.push(`/dashboard/add-update-category/${id}`)}
  >
    تعديل
  </Button>

  {/* VIEW ALL PRODUCTS */}
  {/* <Button
    className="category-btn view-btn"
    onClick={() => router.push(`/dashboard/products?categoryId=${id}`)}
  >
    عرض جميع المنتجات
  </Button> */}
</div>

        </div>
      </div>
    </div>
  );
}
