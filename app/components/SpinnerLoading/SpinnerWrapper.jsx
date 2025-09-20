// components/SpinnerWrapper.jsx
"use client";
import React from "react";
import { useLoading } from "../../context/LoadingContext";
import "./SpinnerWrapper.css"
export default function SpinnerWrapper() {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
<div className="spinner-overlay">
  <div className="spinner"></div>
</div>
  );
}
