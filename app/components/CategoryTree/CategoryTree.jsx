// CategoryTree.jsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import CategoryCard from "../CategoryCard/CategoryCard";
import Categories from "../Categories/Categories";

export default function CategoryTree({ category }) {
  const [showSub, setShowSub] = useState(false);


  console.log(category.subCategories)
  return (
    <div className="category-item" style={{ marginLeft: category.ParentId ? 20 : 0 }}>
      <div className="category-header">
        <Link
          href={`/category/${category.id}?name=${encodeURIComponent(category.name)}`}
        >
          {category.name}
        </Link>
      </div>

      {showSub && category.subCategories?.length > 0 && (
        <div className="sub-categories">
                <Categories categories={category.subCategories}/>
        </div>
      )}
    </div>
  );
}
