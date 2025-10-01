"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // ✅ import
import "./Pagination.css";
import ProductCard from "../ProductCard/ProductCard";
import apiFetch from "@/app/services/apiFetchService";
import { useLoading } from "../../context/LoadingContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Pagination({
  selectedFilter,
  categoryId = 0,
  ProductComponent = null,
  onlyActiveProducts = true,
  outerSearchQuery = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Read current page & search from URL query params
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const searchFromUrl = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [loadingSkeleton, setLoadingSkeleton] = useState(true);

  const { setLoading } = useLoading();
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const fetchProducts = async (page, query = "") => {
    try {
      window.scrollTo({ top: 40, behavior: "smooth" });
      setLoading(true);
      setLoadingSkeleton(true);

      const res = await apiFetch(
        `/product/order?orderedBy=${selectedFilter}&pageNumber=${page}&pageSize=${itemsPerPage}&categoryId=${categoryId}&searchQuery=${query || ""}&onlyActive=${onlyActiveProducts}`
      );

      setProducts(res.products);
      setTotalProducts(res.totalProducts);
      setLoadingSkeleton(false);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoadingSkeleton(false);
      setLoading(false);
    }
  };

  // ✅ Run whenever query params change
  useEffect(() => {
    fetchProducts(pageFromUrl, searchFromUrl || outerSearchQuery);
  }, [pageFromUrl, searchFromUrl, outerSearchQuery, selectedFilter]);

  // ✅ Local search → update URL
  const handleLocalSearch = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    router.push(`?page=1&search=${encodeURIComponent(newQuery)}`);
  };

  const handlePageChange = (page) => {
    if (page !== pageFromUrl && page !== "...") {
      router.push(`?page=${page}&search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // ✅ getPageNumbers stays same
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;
    const sideButtons = 1;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(pageFromUrl - sideButtons, 2);
      let end = Math.min(pageFromUrl + sideButtons, totalPages - 1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="pagination-wrapper">
      <div className="searchbar-container">
        <input
          placeholder="ابحث عن اسم المنتج الذي تريده....."
          className="pagination-searchBar"
          type="text"
          value={searchQuery}
          onChange={handleLocalSearch}
        />
      </div>

      {/* product grid */}
      {loadingSkeleton ? (
        <div className="product-grid">
          {Array.from({ length: itemsPerPage }).map((_, idx) => (
            <div key={idx}>
              <Skeleton height={200} width="100%" borderRadius={8} />
              <Skeleton height={20} width="80%" style={{ marginTop: "0.5rem" }} />
              <Skeleton height={20} width="60%" style={{ marginTop: "0.2rem" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) =>
            ProductComponent ? (
              <ProductComponent
                fetchProducts={fetchProducts}
                currentPage={pageFromUrl}
                key={product.id}
                product={product}
              />
            ) : (
              <ProductCard key={product.id} product={product} />
            )
          )}
        </div>
      )}

      {/* pagination controls */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(Math.max(pageFromUrl - 1, 1))}
          disabled={pageFromUrl === 1}
        >
          الرجوع
        </button>

        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span key={idx} className="ellipsis">
              ...
            </span>
          ) : (
            <button
              key={idx}
              className={pageFromUrl === page ? "active" : ""}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => handlePageChange(Math.min(pageFromUrl + 1, totalPages))}
          disabled={pageFromUrl === totalPages}
        >
          التالي
        </button>
      </div>
    </div>
  );
}
