"use client";
import { useEffect, useState } from "react";
import Filter from "@/app/components/Filter/Filter";
import Pagination from "@/app/components/Pagination/Pagination";
import SubHeader from "@/app/components/subHeader/SubHeader";
import apiFetch from "@/app/services/apiFetchService";
import Categories from "@/app/components/Categories/Categories";
import Link from "next/link";
import "./categoryProduct.css"

export default function CategoryProducts({ params, searchParams }) {
  const categoryId = params.categoryId;

  const categoryName = searchParams?.name
    ? decodeURIComponent(searchParams.name)
    : "Unknown";

  const [selectedFilter, setSelectedFilter] = useState(1);
  const [categoryTree, setCategoryTree] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [isMobile, setIsMobile] = useState(false);



  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await apiFetch(`/Categories/tree/${categoryId}`);
        setCategoryTree(res.subCategories || []);
        setBreadcrumb(res.breadcrumb || []);
      } catch (err) {
        console.error("Failed to fetch category tree:", err);
      }
    };

    fetchCategory();
  }, [categoryId]);




  return (
    <div className="category-wrapper">

    <div className="breadcrumb">
      <Link href="/">الصفحة الرئيسية</Link>
      {breadcrumb.map((b) => (
        <span key={b.id}>
          <span className="separator">{">"}</span>
          <Link href={`/category/${b.id}?name=${encodeURIComponent(b.name)}`}>
            {b.name}
          </Link>
        </span>
      ))}
      <span className="separator">{">"}</span>
      <span className="current">{categoryName}</span>
    </div>

      {/* First-level subcategories */}
      {categoryTree.length > 0 && <Categories categories={categoryTree} />}

      {/* Products filters and pagination */}
      <Filter selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
      <Pagination selectedFilter={selectedFilter} categoryId={categoryId} />
    </div>
  );
}
