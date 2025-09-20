"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiFetch from "@/app/services/apiFetchService";
import { useAuth } from "@/app/context/AuthContext";
import "./add-update-category.css";
import { useLoading } from "@/app/context/LoadingContext";
import { getImageSrc } from "@/app/utils/handleUrls";

export default function AddUpdateCategory() {
  const { categoryId } = useParams();
  const router = useRouter();
  const { setToast } = useAuth();
  const [categories, setCategories] = useState([]);
  const isAddMode = categoryId === "0";
  const { setLoading, loading } = useLoading();

  const [form, setForm] = useState({
    id: null,
    name: "",
    imgUrl: "",
    parentId: 0,
    productCount: 0
  });

  const [uploading, setUploading] = useState(false);
  const [resolvedImgUrl, setResolvedImgUrl] = useState("/CategoryImage-Temp.jpg");
  const [selectedImage, setSelectedImage] = useState(null); // File object for new image

  // Fetch categories list
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const res = await apiFetch("/categories");
      if (res?.length > 0) setCategories(res);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  // Fetch category if update mode
  useEffect(() => {
    if (isAddMode) return;

    const fetchCategory = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/Categories/${categoryId}`);
        if (!res) throw new Error("لم يتم العثور على الفئة");

        setForm({
          id: res.id,
          name: res.name || "",
          imgUrl: res.imgUrl || "",
          parentId: res.parentId || 0,
          productCount: res.productCount || 0
        });

        if (res.imgUrl) {
          const url = await getImageSrc(res.imgUrl);
          setResolvedImgUrl(url || "/CategoryImage-Temp.jpg");
        }

        setLoading(false);
      } catch (err) {
        setToast({ error: true, message: "فشل تحميل بيانات الفئة", show: true });
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId, isAddMode, setToast]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    const tempUrl = URL.createObjectURL(file);
    setResolvedImgUrl(tempUrl); // immediately show preview
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "الاسم مطلوب";
    if (!form.imgUrl && !selectedImage) return "الصورة مطلوبة";
    return null;
  };

  const handleSave = async () => {
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setToast({ error: true, message: validationError, show: true });
      setLoading(false);
      return;
    }

    try {
      let uploadedKey = form.imgUrl;

      // If a new image is selected, upload it
      if (selectedImage) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedImage);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Files/upload`, {
          method: "POST",
          body: formData
        });

        if (!res.ok) throw new Error("فشل رفع الصورة");

        const data = await res.json();
        uploadedKey = data.data.key;

        // Resolve the uploaded URL to display after save
        const resolvedUrl = await getImageSrc(uploadedKey);
        setResolvedImgUrl(resolvedUrl || "/CategoryImage-Temp.jpg");

        setUploading(false);
      }

      // Save category
      const saveRes = await apiFetch(
        isAddMode ? `/Categories` : `/Categories/${categoryId}`,
        {
          method: isAddMode ? "POST" : "PUT",
          body: JSON.stringify({ name: form.name, imgUrl: uploadedKey, parentId: form.parentId })
        }
      );

      if (saveRes.isSuccess) {
        setToast({
          error: false,
          message: isAddMode ? "تمت إضافة الفئة بنجاح" : "تم تحديث الفئة بنجاح",
          show: true
        });
        router.push("/dashboard");
      } else {
        throw new Error(saveRes?.information || "فشلت العملية");
      }
    } catch (err) {
      setToast({ error: true, message: err.information || err.message || "حدث خطأ أثناء الحفظ", show: true });
      setUploading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-category">
      <h2>{isAddMode ? "إضافة فئة جديدة" : "تعديل الفئة"}</h2>

      <label>الاسم *</label>
      <input name="name" value={form.name} onChange={handleChange} />

      <label>تتبع لفئة اخرى؟</label>
      <select onChange={(e) => setForm({ ...form, parentId: e.target.value })} value={form.parentId || 0}>
        <option value={0}>لا</option>
        <optgroup>
          {categories.map(c => c.id != categoryId && (
            <option disabled={c.parentId == categoryId} value={c.id} key={c.id}>
              {c.fullPath}
            </option>
          ))}
        </optgroup>
      </select>

      <label>رفع صورة *</label>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      {(uploading || loading) && <p>جارٍ المعالجة...</p>}

      {resolvedImgUrl && (
        <div className="category-image-preview">
          <img src={resolvedImgUrl} alt={form.name} style={{ width: 150, height: 150, objectFit: "cover" }} />
        </div>
      )}

      {!isAddMode && (
        <div>
          <label>عدد المنتجات</label>
          <input value={form.productCount} disabled />
        </div>
      )}

      <button disabled={loading || uploading} onClick={handleSave}>
        {isAddMode ? "إضافة الفئة" : "تحديث الفئة"}
      </button>
    </div>
  );
}
