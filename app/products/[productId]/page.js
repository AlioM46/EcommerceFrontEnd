import Product from "../../components/ClientComponents/SingleProduct"


export async function generateMetadata({ params }) {
  const productId = params.productId;
  const product = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Product/${productId}`).then(res => res.json());

  return {
    title: `${product.name} - Trend Idleb`,
    description: product.description || "تفاصيل المنتج الكامل.",
    openGraph: {
      title: `${product.name} - Trend Idleb`,
      description: product.description || "تفاصيل المنتج الكامل.",
      url: `https://TrendIdleb.com/products/${productId}`,
      images: ["/logo.svg"], 
    },
  };
}



export default function page () {

  return <Product/>

}