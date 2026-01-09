"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import ProductCard from "../ProductCard/ProductCard";
import { useEffect, useState } from "react";
import apiFetch from "@/app/services/apiFetchService";
import "./ProductCarousel.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useLoading } from "@/app/context/LoadingContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProductCarousel({ category }) {
  const [products, setProducts] = useState([]);
  const [loadingSkeleton, setLoadingSkeleton] = useState(true);
  const { setLoading } = useLoading();

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setLoadingSkeleton(true);

        const response = await apiFetch(`/product`);
        const filteredProducts = [];

        console.log(response.data);
        if (response.data && Array.isArray(response.data)) {
          for (let i = 0; i < response.data.length; i++) {
            if (filteredProducts.length >= 12) break;
            console.log(response.data[i]);
            if (
              Array.isArray(response.data[i].categories) &&
              response.data[i].categories.some(
                (cat) => cat.name.toLowerCase() === category.toLowerCase()
              )
            ) {
              filteredProducts.push(response.data[i]);
            }
          }
        }

        setProducts(filteredProducts);
        setLoadingSkeleton(false);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoadingSkeleton(false);
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category]);

  // Skeleton Loader
  if (loadingSkeleton) {
    return (
      <div className="product-carousel">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          pagination={{ clickable: true }}
          breakpoints={{
            400: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
            1440: { slidesPerView: 5 },
          }}
        >
          {Array.from({ length: 5 }).map((_, idx) => (
            <SwiperSlide key={idx}>
              <div style={{ padding: "1rem" }}>
                <Skeleton height={200} width="100%" borderRadius={8} />
                <Skeleton height={20} width="80%" style={{ marginTop: "0.5rem" }} />
                <Skeleton height={20} width="60%" style={{ marginTop: "0.2rem" }} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  return (
    <div className="product-carousel">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={16}
        slidesPerView={1}
        pagination={{ clickable: true }}
        breakpoints={{
          400: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
          1440: { slidesPerView: 5 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="products-carousel-slide">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
