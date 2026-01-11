import { Suspense } from "react";
import OrderSuccessPage from "../components/order-success/OrderSuccess";

export default function OrderSuccessPageWrapper() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <OrderSuccessPage />
    </Suspense>
  );
}
