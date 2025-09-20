"use client";
import { useState, useEffect } from "react";
import "./Pagination.css";
import ProductCard from "../ProductCard/ProductCard";
import apiFetch from "@/app/services/apiFetchService";
import { useLoading } from "../../context/LoadingContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Pagination({ selectedFilter, categoryId = 0, ProductComponent = null, onlyActiveProducts = true, outerSearchQuery = "" }) {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const [firstTime, setFirstTime] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingSkeleton, setLoadingSkeleton] = useState(true);


  console.log("CURRENT PAGE" ,currentPage)

  const { setLoading } = useLoading();

  const fetchProducts = async (page, query = "") => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setLoading(true);
      setLoadingSkeleton(true);

      if (query == null) query = "";

      const res = await apiFetch(
        `/product/order?orderedBy=${selectedFilter}&pageNumber=${page}&pageSize=${itemsPerPage}&categoryId=${categoryId}&searchQuery=${query}&onlyActive=${onlyActiveProducts}`
      );

      setProducts(res.products);
      setTotalProducts(res.totalProducts);
      setFirstTime(false);
      setLoadingSkeleton(false);
      setLoading(false);

    } catch (error) {
      console.error("Error fetching products:", error);
      setLoadingSkeleton(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (outerSearchQuery === "" || outerSearchQuery == null) setFirstTime(false);

    setSearchQuery(outerSearchQuery);
    setCurrentPage(1);
    fetchProducts(1, outerSearchQuery); // always use outerSearchQuery here
  }, [outerSearchQuery, selectedFilter]);

  const handleLocalSearch = (e) => {
    if (firstTime) return;

    setSearchQuery(e.target.value);
    setCurrentPage(1);
    fetchProducts(1, e.target.value); // use whatever user typed
  };


  // Helper: get page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3; // fewer buttons visible at a time
    const sideButtons = 1; // buttons on each side of current page

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(currentPage - sideButtons, 2);
      let end = Math.min(currentPage + sideButtons, totalPages - 1);

      if (start > 2) pages.push("..."); // left ellipsis
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("..."); // right ellipsis

      pages.push(totalPages);
    }

    return pages;
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page !== currentPage && page !== "...") {
      setCurrentPage(page);
      fetchProducts(page);
    }
  };

  const productsList = loadingSkeleton ? (
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
          <ProductComponent fetchProducts={fetchProducts} currentPage={currentPage} key={product.id} product={product} />
        ) : (
          <ProductCard key={product.id} product={product} />
        )
      )}
    </div>
  );

  return (
    <div className="pagination-wrapper">
      {/* Product grid */}
      <div className="searchbar-container">
        <input
          placeholder="ابحث عن اسم المنتج الذي تريده....."
          className="pagination-searchBar"
          type="text"
          value={searchQuery}
          onChange={(e) => handleLocalSearch(e)}
        />
      </div>

      {productsList}

      {/* Pagination controls */}
      <div className="pagination">
        <button onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>
          Prev
        </button>

        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span key={idx} className="ellipsis">
              ...
            </span>
          ) : (
            <button key={idx} className={currentPage === page ? "active" : ""} onClick={() => handlePageChange(page)}>
              {page}
            </button>
          )
        )}

        <button onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
