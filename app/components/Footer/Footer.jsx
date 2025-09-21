import Image from 'next/image'
import React from 'react'
import { faPhone, faLocation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import "./Footer.css"

export default function Footer() {
  return (
    <footer>
      <div className='container'>

      
      <div className='contact-us wrapper'>
        <h2>تواصل معنا</h2>
        
        <span>انقر للتواصل</span>

<div className='contact-us-images'>
<Link href="https://wa.me/963947739774?text=مرحبا%20،%20أريد%20الاستفسار%20عن%20المنتجات" target="_blank" rel="noopener noreferrer">
          <Image src="/whatsapp-image.svg" alt="Whatsapp" width={40} height={40} />
</Link>
<Link href={"https://www.instagram.com/trend_boutiquetr1"}  target="_blank">
        <Image src="/insta-image.svg" alt="Instagram" width={40} height={40} />
</Link>
  
    </div>      
  </div>
      <hr className="divider" />


      <div className='address wrapper'> 
        <h2>عناوين</h2>
<div>
            <Link href={"/"}> 
            <span>سوريا - ادلب</span>
            <span><FontAwesomeIcon icon={faLocation} size="lg" /></span>
          </Link>

         
         <Link href={"/"}>
         
            <span>+963947739774</span>
            <span><FontAwesomeIcon icon={faPhone} size="lg" /></span>
</Link>
</div>
      </div>
      <hr className="divider" />

      <div className='footer-links wrapper'>
        <h2>الصحفات</h2>
        <div>
          <Link href="/">الصفحة الرئيسية</Link>
          <Link href="/products">المنتجات</Link>
          <Link href="/store-policy">سياسة متجرنا</Link>
        </div>
      </div>
      <hr className="divider" />



      <div className='footer-logo wrapper'>
        <h2>Trend Fashion Idleb</h2>
<div>
        <Link href="/" className="">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={120}
          height={90} // adjust proportionally
          className="footer-logo"
          />
      </Link>
</div>

<p>

Trend Fashion Idleb<br/>
نجمع لك عالم التسوق في مكان واحد بكل سهولة وراحة نقدّم منتجات متنوعة وأصلية بجودة عالية، مع خدمة توصيل سريعة وموثوقة، لتجربة تسوق مميزة تجعل كل زيارة لك معنا تجربة لا تُنسى</p>
      </div>

          </div>
    </footer>
  )
}
