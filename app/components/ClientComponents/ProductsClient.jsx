"use client";

import React, { Suspense, useEffect, useState } from "react";
import Pagination from "../../components/Pagination/Pagination";
import "../../products/products.css";
import Filter from "../../components/Filter/Filter";
import SubHeader from "../../components/subHeader/SubHeader";
import Categories from "../../components/Categories/Categories";
import { useSearchParams } from "next/navigation";
import apiFetch from "../../services/apiFetchService";
import { useLoading } from "../../context/LoadingContext";

export default function ProductsClient() {
  const [selectedFilter, setSelectedFilter] = useState(1);
  const [categories, setCategories] = useState([]);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("البحث-عن");

  const { setLoading } = useLoading();



  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const top10Categories = await apiFetch("/categories/top");
        setCategories(top10Categories);
      } catch (err) {
        console.error("--Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [setLoading]);

  return (
    <div>
      <SubHeader text="الأقسام" showLink={false} />
      <Categories categories={categories} />
      <Filter selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />

   <Suspense>
       <Pagination
        selectedFilter={selectedFilter}
        outerSearchQuery={searchQuery}
      />
   </Suspense>
    </div>
  );
}
