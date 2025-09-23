"use client"

import apiFetch from "@/app/services/apiFetchService";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { faCartShopping, faMessage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./product.css"
import { useAuth } from "@/app/context/AuthContext";
import Button from "@/app/components/Button/Button";
import { getImageSrc } from "@/app/utils/handleUrls";
import { useLoading } from "@/app/context/LoadingContext";
import ProductSkeleton from "@/app/components/Skeletons/ProductSkeleton/ProductSkeleton";

export default function Product() {

  const [product, setProduct] = useState({});
  const { productId } = useParams();  
  const [currentImage, setCurrentImage] = useState("");
  const [chosenColor , setChosenColor] = useState("");
  const [chosenSize ,setChosenSize] = useState("");
  
  const [resolvedImages, setResolvedImages] = useState([]);

  const productImagesUrls = product.productImagesUrl || [];




  const { addToCart } = useAuth();
  const { setLoading, loading } = useLoading();

  const imagesListRef = useRef(null);
  const [slidePosition, setSlidePosition] = useState(0);

  
  useEffect(() => {
  if (!productImagesUrls || productImagesUrls.length === 0) return;

  Promise.all(productImagesUrls.map(url => getImageSrc(url)))
    .then(urls => {
      setResolvedImages(urls);
      setCurrentImage(urls[0] || "/ProductImage-Temp.jpg");
    })
    .catch(err => console.error(err));
}, [productImagesUrls]);



  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      const res = await apiFetch(`/product/${productId}`);
      setProduct(res);

      setCurrentImage(res.productImagesUrl[0] || "");
      setChosenColor(res.productColors[0] || "")
      setChosenSize(res.productSizes[0] || "")
      setLoading(false)
    }
    fetchProduct();
  }, [productId]);


  const orderByWhatsapp = () => {


      
    const phoneNumber = "963947739774";
var message = "";
  const price = product.discountPrice && product.discountPrice > 0 ?product.discountPrice : product.price;
  const colorText = chosenColor? `\n\nاللون: ${chosenColor}\n` : "";
  const sizeText = chosenSize? `المقاس: ${chosenSize}\n` : "";

  if (product.sku != "" && product.sku != null) {
  message += `SKU Code: ${product?.sku}\n`

  }
  message += `$${product.name} (معرف: ${product.id})${colorText}${sizeText} {1} × ${price.toFixed(2)}\n`;
  message += `رابط المنتج:\t${process.env.NEXT_PUBLIC_FRONT_END_URL}/products/${product.id}\n`;
const dateObj = new Date(); // correct
const date = dateObj.toLocaleDateString("ar-SY", { year: "numeric", month: "2-digit", day: "2-digit" });
const time = dateObj.toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit" });

  message += `✅ الإجمالي: *${price.toFixed(2)}$*\n`;
message += `\n📅 التاريخ: ${date}\n⏰ الساعة: ${time}`;

  // ✅ Open WhatsApp
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");


  }


  let priceJsx;
  if (product.discountPrice > 0) {
    priceJsx = <>
      <span className="prd-price"><span className="dollarSign">$</span>{product.discountPrice}</span>
      <br/>
      <span className="prd-old-price"><span className="dollarSign">$</span>{product.price}</span>
    </>
  } else {
    priceJsx = <span className="prd-price"><span className="dollarSign">$</span>{product.price}</span>
  }

  const slideLeft = () => {
    if (!imagesListRef.current) return;
    const containerWidth = imagesListRef.current.offsetWidth;
    const totalWidth = imagesListRef.current.scrollWidth;
    const step = 120;
    let newPos = slidePosition + step;
    if (newPos > 0) newPos = 0;
    setSlidePosition(newPos);
  }

  const slideRight = () => {
    if (!imagesListRef.current) return;
    const containerWidth = imagesListRef.current.offsetWidth;
    const totalWidth = imagesListRef.current.scrollWidth;
    const step = 120;
    let newPos = slidePosition - step;
    if (newPos < -(totalWidth - containerWidth)) newPos = -(totalWidth - containerWidth);
    setSlidePosition(newPos);
  }

  if (loading) {
    return <ProductSkeleton/>
  }

  return (
    <div className="prd-product-container">

      {/* LEFT SIDE */}
      <div className="prd-product-info">
        <h1 className="prd-product-name">{product.name}</h1>
        <div className="prd-product-description">
          <h2>وصف المنتج:</h2>
          <p>{product.description || "لايوجد وصف للمنتج"}</p>
        </div>


{product.productColors?.length > 0 && (
          <div className="prd-product-colors">
            <strong>الألوان:</strong>{" "}
            {product.productColors.map((color, i) => (
              <button
                key={i}
                onClick={() => setChosenColor(color)}
                className={`prd-color-circle ${chosenColor === color ? "prd-active-color-button" : ""}`}
              >
                {color[0]?.toUpperCase() + color?.slice(1)}
              </button>
            ))}
          </div>
        )}
                {product.productSizes?.length > 0 && (
          <div className="prd-product-sizes">
            <strong>المقاسات:</strong>{" "}
            {product.productSizes.map((size, i) => (
              <button
                key={i}
                onClick={() => setChosenSize(size)}
                className={`prd-size-tag ${chosenSize === size ? "prd-active-size-button" : ""}`}
              >
                {size[0]?.toUpperCase() + size?.slice(1)}
              </button>
            ))}
          </div>
        )}
                <div className="prd-product-price">{priceJsx}</div>



        {product.inStock > 0 ?  
          <h2 className="prd-product-inStock">متوفر الان</h2> :
          <h2 className="prd-product-outOfStock">نفذ المخزون</h2> 
        }

        {product.brand && <h3 className="prd-product-brand">العلامة التجارية: {product.brand}</h3>}

        {product.categories?.length > 0 && (
          <div className="prd-product-categories">
            <strong>الفئة:</strong>{" "}
            {product.categories.map((cat, i) => (
              <span key={i} className="prd-category-tag">{cat}</span>
            ))}
          </div>
        )}


        


        <div className="prd-product-rating">
          <strong>التقييم:</strong>{" "}
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < product.rating ? "prd-star filled" : "prd-star"}>★</span>
          ))}
          <span className="prd-reviews-count">({product.reviewsCount})</span>
        </div>



        <div className="prd-product-buttons">
          <Button onClick={() => addToCart(product, chosenColor, chosenSize)}>
            <FontAwesomeIcon icon={faCartShopping} size="md"/> 
            اضافة الى السلة 
          </Button>

          <Button onClick={() => orderByWhatsapp()}>
            <FontAwesomeIcon icon={faMessage} color="green" size="md" /> 
            اشتر الان عبر واتساب
          </Button>
        </div>

        <hr/>


      </div>

      {/* RIGHT SIDE */}
      <div className="prd-product-images">
        <div className="prd-main-image-wrapper">
          <img
            className="prd-main-image"
            src={currentImage}
            alt="product image"
          />
        </div>

        <div className="prd-images-list-wrapper">
          <div className="prd-btn-container">
            <button className="prd-arrow-btn" onClick={slideLeft}>◀</button>
            <button className="prd-arrow-btn" onClick={slideRight}>▶</button>
          </div>

          <div
            className="prd-images-list"
            ref={imagesListRef}
            style={{ transform: `translateX(${slidePosition}px)` }}
          >
            {resolvedImages?.map((imgUrl, i) => (
              <img
                key={i}
                src={imgUrl || "/ProductImage-Temp.jpg"}
                alt="product thumbnail"
                onClick={() => setCurrentImage(imgUrl || "/ProductImage-Temp.jpg")}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
