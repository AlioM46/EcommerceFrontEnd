
import Image from "next/image";
import "./Home.css";
import Section from "./components/Section/Section";
import PromoBanner from "./components/PromotionBanner/PromotionBanner";


export const metadata = {
  title: "الصفحة الرئيسية - Trend Idleb",
  description: "تصفح أحدث المنتجات والعروض في الصفحة الرئيسية لموقعنا.",
  openGraph: {
    title: "الصفحة الرئيسية - Trend Idleb",
    description: "تصفح أحدث المنتجات والعروض في الصفحة الرئيسية لموقعنا.",
    url: "https://example.com",
    images: ["/logo.svg"],
  },
};

export default async function Home() {
  
  return (
    <div  className ="main-page  ">
     
    <div className="thumbnail-container "> 


{/* <div className="thumbnail-text "> */}
  {/* <h1>مرحبا بكم في متجرنا</h1>
  <p>مرحبا بكم في متجرنا مرحبا بكم في متجرنا مرحبا بكم في متجرنا مرحبا بكم في متجرنا مرحبا بكم في متجرنا مرحبا بكم في متجرنا مرحبا بكم في متجرنا مرحبا بكم في متجرنا مرحبا بكم في متجرنا </p> */}
{/* </div> */}

      {/* h-64 = height, change as needed */}

<div className="img-parent">
{/* <img   src="https://pub-7195234143b04f4d9e8c25ddaf35d181.r2.dev/5c7b5316-fefe-49db-bda5-3f4fadd8842c.png" alt="Thumbnail" className="banner-img" /> */}
<Image  fill src="/bnr3.jpg" alt="Thumbnail" className="banner-img" />

</div>


    </div>

<Section category ={"فساتين"} headerText = "القسم المميز" showLink={true} linkText = "عرض المزيد" />
<Section category = {"رجال"} headerText = "كل مايخص الرجال" showLink={true} linkText = "عرض المزيد"/>
    </div>
  );  
}

