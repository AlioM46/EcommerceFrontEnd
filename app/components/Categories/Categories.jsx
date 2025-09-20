"use client";
import React, { useEffect, useState } from "react";
import "./Categories.css";

import { Swiper, SwiperSlide } from "swiper/react";
import {  Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import CategoryCard from "../CategoryCard/CategoryCard";

export default function Categories({categories}) {
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {


    setCategoriesList(categories)

  }, [categories]);


  

  



  return (
    <div className="categories-wrapper">
      <Swiper
        modules={[ Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        // navigation 
        // pagination={{ clickable: true }}
        autoplay={{ delay: 1000, disableOnInteraction: false }} // auto-slide
        loop={true} // continuous loop
        breakpoints={{
            0: {slidesPerView:1},
          400: { slidesPerView: 3 },
          640: { slidesPerView: 4 },
          1024: { slidesPerView: 6 },
          1440: { slidesPerView: 8},
        }}
      >
        {categoriesList.map((category) => (
          <SwiperSlide className="categories-swiper" key={category.id}>
            <CategoryCard Category={category} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
