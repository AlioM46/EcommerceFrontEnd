import Products from "../../components/ClientComponents/SingleProduct"


export async function generateMetadata({ params }) {
  const productId = params.productId;

  const product = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${productId}`);
  const productData = await product.json();

  return {
    title: `${productData.name} - Trend Idleb`,
    description: productData.description || "تفاصيل المنتج الكامل.",
    openGraph: {
      title: `${productData.name} - Trend Idleb`,
      description: productData.description || "تفاصيل المنتج الكامل.",
      url: `https://TrendIdleb.com/products/${productId}`,
      images: ["/logo.svg"], 
    },
  };
}



export default function page () {

  return <Products/>

}