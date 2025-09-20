import { Suspense } from "react";
import ProductsClient from "../components/ClientComponents/ProductsClient";

export default function ProductsPage() {
  return (
    <div className="products-container">
      <Suspense fallback={<div>Loading products...</div>}>
        <ProductsClient />
      </Suspense>
    </div>
  );
}
