"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProductSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column-reverse", gap: "2rem", padding: "2rem", minHeight: "80vh" }}>

      {/* LEFT SIDE */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", direction: "rtl" }}>
        <Skeleton height={36} width="60%" /> {/* Product Name */}
        <Skeleton height={28} width="30%" /> {/* Brand */}
        <Skeleton height={24} width="40%" /> {/* Category */}
        <Skeleton height={28} width="20%" /> {/* Stock */}
        <Skeleton height={36} width="30%" /> {/* Price */}
        
        {/* Colors */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Skeleton circle height={32} width={32} />
          <Skeleton circle height={32} width={32} />
        </div>

        {/* Sizes */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Skeleton height={32} width={64} />
          <Skeleton height={32} width={64} />
        </div>

        {/* Rating */}
        <Skeleton height={20} width="25%" />

        {/* Buttons */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <Skeleton height={48} width={160} />
          <Skeleton height={48} width={160} />
        </div>

        {/* Description */}
        <div style={{ marginTop: "1rem" }}>
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="90%" />
          <Skeleton height={16} width="75%" />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-end" }}>
        <Skeleton height={400} width={600} /> {/* Main Image */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Skeleton height={80} width={80} />
          <Skeleton height={80} width={80} />
          <Skeleton height={80} width={80} />
          <Skeleton height={80} width={80} />
        </div>
      </div>

    </div>
  );
}
