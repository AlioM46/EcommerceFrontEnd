// components/Toast.js
"use client";
import React from "react";
import "./Toast.css"; // optional for styling

export default function Toast({ show, message,error }) {
  if (!show) return null;

  return (
    <div className={`toast ${error ? "error-toast" : ""}`}>
      {message}
    </div>
  );
}
