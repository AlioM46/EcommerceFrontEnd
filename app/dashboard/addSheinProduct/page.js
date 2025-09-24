"use client"

import Button from "@/app/components/Button/Button";
import { useAuth } from "@/app/context/AuthContext";
import apiFetch from "@/app/services/apiFetchService";
import { useState } from "react";
import "./AddSheinProduct.css"; // import the CSS file
import { useLoading } from "@/app/context/LoadingContext";

export default function AddSheinProduct() {
    const [countryCode, setCountryCode] = useState("SA");
    const [sheinUrl, setSheinUrl] = useState("");
    const { setToast } = useAuth();
const {setLoading , loading} = useLoading();

    const isValid = () => {
        if (!countryCode?.trim()) return false;
        if (!sheinUrl?.trim()) return false;
        return true;
    };


    const handleAddProduct = async () => {
        if (!isValid()) {
            setToast({ show: true, message: "الرجاء تعبئة جميع الحقول", error: true });
            return;
        }

        setLoading(true); // start loading

        try {
const res = await apiFetch(
    `/SheinProducts/?url=${encodeURIComponent(sheinUrl)}&country=${countryCode.toUpperCase()}&currency=USD&language=ar&max_items_count=1&max_items_per_url=0&include_size_chart=false`,
    { method: "POST" },false
);


            if (res.isSuccess) {
                setToast({ show: true, message: "تم اضافة المنتج من شي ان بنجاح" });
                setCountryCode("SA"); 
                setSheinUrl("");
            } else {
                setToast({
                    show: true,
                    message: `حدث خطأ اثناء اضافة المنتج: ${res?.information || res?.message || ""}`,
                    error: true
                });
            }
        } catch (err) {
            setToast({ show: true, message: "حدث خطأ غير متوقع", error: true });
        } finally {
            setLoading(false); // stop loading
        }
    };

    return (
        <div className="shein-card">
            <h2 className="shein-title">إضافة منتج من شي ان</h2>

            <div className="shein-input-group">
                <label>رمز المتجر *</label>
                <input
                    type="text"
                    placeholder="مثال: ar"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="shein-input-group">
                <label>رابط المنتج (عن طريق المتصفح او الـلابتوب) *</label>
                <input
                    type="text"
                    placeholder="أدخل معرف المنتج"
                    value={sheinUrl}
                    onChange={(e) => setSheinUrl(e.target.value)}
                    disabled={loading}
                />
            </div>

            <Button
                onClick={handleAddProduct}
                className="shein-btn"
                disabled={loading}
            >

                {loading ? "جاري الإضافة..." : "إضافة؟"}

            </Button>
        </div>
    );
}
