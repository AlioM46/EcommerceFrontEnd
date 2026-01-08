"use client";

import React, { useEffect, useState } from "react";
import CategoryCard from "./DashboardCategoryCard/DashboardCategoryCard"; // adjust path
import "./dashboardCategory.css"; 
import apiFetch from "@/app/services/apiFetchService";
import Button from "../../Button/Button";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

export default function DashboardCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // add loading state

  const router = useRouter();



  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/categories");
      if (res && Array.isArray(res)) {
        setCategories(res);
      } else {
        console.error("Invalid response", res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);


  const skeletons = Array(6).fill(0); 

  return (
    <div className="dashboard-category-container">
      <Button onClick={() => router.push(`/dashboard/add-update-category/0`)}>
        اضافة تصنيف
      </Button>
      <h2>جميع التصنيفات</h2>

      {loading ? (
        <div className="category-grid">
          {skeletons.map((_, i) => (
            <div key={i} className="category-card-skeleton">
              <Skeleton height={150} borderRadius={8} />
              <Skeleton height={20} width={`80%`} style={{ marginTop: '0.5rem' }} />
              <Skeleton height={15} width={`60%`} style={{ marginTop: '0.25rem' }} />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p>لايوجد تصنيفات</p>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              imgUrl={category.imgUrl}
              productCount={category.productCount}
              fetchCategories={fetchCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
}
