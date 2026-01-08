
import OrderDetails from "@/app/components/OrderDetails/OrderDetails";

export async function generateMetadata({ params }) {
  const { orderId } = params; // destructure

  // Fetch order data


  return {
    title: `${orderId} - Trend Idleb`, // use orderData fields
    description: "تفاصيل الطلب الكامل.",
    openGraph: {
      title: `${orderId} - Trend Idleb`,
      description: "تفاصيل الطلب الكامل.",
      url: `https://TrendIdleb.com/orders/${orderId}`,
      images: ["/logo.svg"],
    },
  };
}

const page = async ({ params }) => {
  const { orderId } = params;

  return (
    <OrderDetails orderId={orderId} />
  );
};

export default page;
