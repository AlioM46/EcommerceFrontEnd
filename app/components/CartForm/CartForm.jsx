"use client";
import React, { useState, useEffect } from "react";
import "./CartForm.css";
import Button from "../Button/Button";
import { useAuth } from "@/app/context/AuthContext";

export default function CheckoutForm() {
  const { cartItems } = useAuth();

  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    discountCode: "",
    address: ""
  });

  const [errors, setErrors] = useState({});
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);

  // Load Syrian cities
  useEffect(() => {
    const storedCities = [
      "دمشق","حلب","حمص","حماة","اللاذقية","طرطوس",
      "درعا","القنيطرة","ريف دمشق","دير الزور","الرقة",
      "الحسكة","إدلب","السويداء"
    ];
    setCities(storedCities);
  }, []);

  // Calculate subtotal & total whenever cartItems change
  useEffect(() => {
    const sum = cartItems.reduce((acc, p) => {
      const price = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
      return acc + price * (p.qty || 1);
    }, 0);

    setSubtotal(sum);
    setTotal(sum + shipping);
  }, [cartItems, shipping]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "الاسم مطلوب";
    else if (formData.name.trim().length < 2) newErrors.name = "الاسم قصير جداً";

    if (!formData.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    else if (!/^\d{8,15}$/.test(formData.phone.trim())) newErrors.phone = "رقم الهاتف غير صالح";

    if (!formData.address.trim()) newErrors.address = "العنوان مطلوب";
    if (!city) newErrors.city = "المدينة مطلوبة";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const handleOrder = () => {
  if (!validate()) return;

  const order = {
    ...formData,
    city,
    cartItems,
    subtotal,
    shipping,
    total,
    date: new Date().toISOString()
  };

  localStorage.setItem("checkoutOrder", JSON.stringify(order));
  alert("سيتم تحويلك الى الواتساب للشراء.... الرجاء الانتظار");

  // ✅ Call WhatsApp redirect
  handleWhatsappRedirection();
};


const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONT_END_URL;


const handleWhatsappRedirection = () => {
  const phoneNumber = "352681537670"; // your WhatsApp number
  const order = JSON.parse(localStorage.getItem("checkoutOrder"));

  if (!order) return;

  let message = `🛒 *طلب جديد* 🛒\n\n`;

  // Customer info
  message += `👤 الاسم: ${order.name}\n`;
  message += `📞 الهاتف: ${order.phone}\n`;
  message += `🏙️ المدينة: ${order.city}\n`;
  message += `📍 العنوان: ${order.address}\n`;


  if (order.discountCode) {
    message += `🏷️ كود الخصم: ${order.discountCode}\n`;
  }
  message += `\n`;



  // Cart items
message += `📦 *المنتجات:*\n`;
order.cartItems.forEach((p, i) => {
  const price = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
  const colorText = p.color ? `, اللون: ${p.color}` : "";
  const sizeText = p.size ? `, المقاس: ${p.size}` : "";

  if (p.sku != "" && p.sku != null) {
  message += `SKU Code: ${p?.sku}\n`

  }
  message += `${i + 1}. ${p.name} (معرف: ${p.id})${colorText}${sizeText} — ${p.qty || 1} × ${price.toFixed(2)}$\n`;
  message += `رابط المنتج:\t${FRONTEND_URL}/products/${p.id}\n`;
  message += "--------------------------------------------------------------------\n"

});

  

  message += `\n`;

  // Totals
  message += `💰 المجموع الفرعي: ${order.subtotal.toFixed(2)}$\n`;
  message += `🚚 الشحن: ${order.shipping.toFixed(2)}$\n`;
  message += `✅ الإجمالي: *${order.total.toFixed(2)}$*\n`;
const dateObj = new Date(order.date);
const date = dateObj.toLocaleDateString("ar-SY", { year: "numeric", month: "2-digit", day: "2-digit" });
const time = dateObj.toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit" });

message += `\n📅 التاريخ: ${date}\n⏰ الساعة: ${time}`;

  // ✅ Open WhatsApp
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
};

  

  return (
    <div className="checkout-container">
      <h2 className="section-title">معلوماتك الشخصية</h2>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label>اسمك</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="اكتب"
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label>رقمك</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="905523434343"
          />
          {errors.phone && <p className="error">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label>كود الخصم</label>
          <input
            type="text"
            name="discountCode"
            value={formData.discountCode}
            onChange={handleInputChange}
            placeholder="xxxxxx"
          />
        </div>

        <div className="form-group">
          <label>اختر المدينة</label>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">اختر المدينة</option>
            {cities.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
          {errors.city && <p className="error">{errors.city}</p>}
        </div>
      </div>

      <div className="form-group mb-4">
        <label>عنوانك بالتفصيل</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="اكتب"
        />
        {errors.address && <p className="error">{errors.address}</p>}
      </div>

      <hr className="divider" />

      <h2 className="section-title">تفاصيل الطلبية</h2>
      <div className="order-details mb-4">
        {cartItems.length > 0 ? (
          cartItems.map((p, i) => {
            const price = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
            return (
              <div key={i} className="order-item">
                <span>{p.name}</span>
                <span>{p.qty || 1} × {price.toFixed(2)} $</span>
              </div>
            )
          })
        ) : (
          <div className="order-item placeholder">
            <span>لا توجد منتجات</span>
          </div>
        )}
      </div>

      <h2 className="section-title">ملخص الطلبية</h2>
      <div className="order-summary mb-2">
        <div className="summary-row">
          <span>المجموع الفرعي ({cartItems.length} منتجات)</span>
          <span>{subtotal.toFixed(2)} $</span>
        </div>
        <div className="summary-row">
          <span>مصاريف الشحن</span>
          <span>{shipping.toFixed(2)} $</span>
        </div>
      </div>

      <hr className="divider" />
      <div className="summary-final">
        <span>الإجمالي</span>
        <span>{total.toFixed(2)} $</span>
      </div>

      <Button onClick={() => handleOrder()} >
        إتمام الطلب
      </Button>
    </div>
  );
}
