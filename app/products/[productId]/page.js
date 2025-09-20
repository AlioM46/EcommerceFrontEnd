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
      url: `https://example.com/product/${productId}`,
      images: ["/logo.svg"], // Can be replaced with product image
    },
  };
}



export default function page () {

  return <Product/>

}