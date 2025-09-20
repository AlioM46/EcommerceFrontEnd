"use client";
import { useEffect, useState, use } from "react"; // use() is imported
import CategoryTree from "@/app/components/CategoryTree/CategoryTree";
import Filter from "@/app/components/Filter/Filter";
import Pagination from "@/app/components/Pagination/Pagination";
import SubHeader from "@/app/components/subHeader/SubHeader";
import apiFetch from "@/app/services/apiFetchService";
import Categories from "@/app/components/Categories/Categories";

export default function CategoryProducts({ params, searchParams }) {
  // Unwrap the promise
  const categoryParams = use(params); // <-- unwraps the params promise
  const categoryId = categoryParams.categoryId;

  const categoryName = searchParams?.name
    ? decodeURIComponent(searchParams.name)
    : "Unknown";

  const [selectedFilter, setSelectedFilter] = useState(1);
  const [categoryTree, setCategoryTree] = useState([]); // first-level subcategories

  // Fetch category tree from API
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await apiFetch(`/Categories/tree/${categoryId}`);
        setCategoryTree(res.subCategories || []);
      } catch (err) {
        console.error("Failed to fetch category tree:", err);
      }
    };

    fetchTree();
  }, [categoryId]);

  return (
    <div className="category-wrapper">
      <SubHeader text={categoryName} />

      {/* First-level subcategories */}
      {categoryTree.length > 0 && <Categories categories={categoryTree} />}

      {/* Products filters and pagination */}
      <Filter selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
      <Pagination selectedFilter={selectedFilter} categoryId={categoryId} />
    </div>
  );
}
