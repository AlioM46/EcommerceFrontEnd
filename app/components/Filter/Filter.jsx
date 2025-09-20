"use client";
import React, { useState } from "react";
import "./Filter.css";

export default function Filter({selectedFilter, setSelectedFilter }) {

  const filters = [
      { label: "الاحدث", value: 1 },
      { label: "الاقل سعرا", value: 2 },
      { label: "الاعلى سعرا", value: 3 },
    { label: "الاكثر شهرة", value: 4 },
    { label: "مخفض", value: 5 },
  ];

  //  Latest = 1, 
  //  LowToHigh = 2,
  //  HighToLow = 3,
  //  MostLiked = 4,
  //  Discounted = 5,

const handleFilterChange = (value) => {
  setSelectedFilter(value);
};


  return (
    <div className="filter-container">
      <h2>الفلترة</h2>
      <div className="filters">
        {filters.map((filter) => (
          <label key={filter.value} className="filter-option">
            <input
              type="radio"
              name="productFilter"
              value={filter.value}
              checked={selectedFilter === filter.value}
              onChange={() => handleFilterChange(filter.value)}
            />
            {filter.label}
          </label>
        ))}
      </div>
    </div>
  );
}
