"use client";
import React, { useEffect, useState } from "react";
import apiFetch from "@/app/services/apiFetchService";
import { useParams, useRouter } from "next/navigation";
import "./add-update-product.css";
import { useAuth } from "@/app/context/AuthContext";
import { useLoading } from "@/app/context/LoadingContext";

export default function AddUpdateProduct() {
  const { productId } = useParams();
  const { setToast } = useAuth();
  const router = useRouter();
  const isAddMode = productId === "0";

  const { loading, setLoading } = useLoading();

  const [categories, setCategories] = useState([]);

  /* ================= FORM STATE ================= */
  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    price: "",
    discount_price: "",
    brand: "",
    rating: "",
    reviews_count: "",
    in_stock: "",
    category_ids: [],
    colors: [],
    sizes: [],
    images: [] // EXISTING image URLs from DB
  });

  /* ================= FILE STATES ================= */
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedUrls, setSelectedUrls] = useState([]);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    apiFetch("/categories", {}, false).then(res => {
      if (Array.isArray(res)) setCategories(res);
    });
  }, []);

  /* ================= FETCH PRODUCT (UPDATE MODE) ================= */
  useEffect(() => {
    if (isAddMode) return;

    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await apiFetch(`/product/${productId}`, {}, false);
        const data = res.data;

        setForm({
          ...data,
          category_ids: data.categories?.map(c => c.id) || [],
          colors: data.colors?.map(c => c.color) || [],
          sizes: data.sizes?.map(s => s.size) || [],
          images: data.images?.map(i => i.url) || []
        });
      } catch {
        setToast({ error: true, message: "فشل تحميل المنتج", show: true });
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  /* ================= INPUT HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name, index, value) => {
    const copy = [...form[name]];
    copy[index] = value;
    setForm(prev => ({ ...prev, [name]: copy }));
  };

  const addArrayItem = (name) =>
    setForm(prev => ({ ...prev, [name]: [...prev[name], ""] }));

  const removeArrayItem = (name, index) => {
    const copy = [...form[name]];
    copy.splice(index, 1);
    setForm(prev => ({ ...prev, [name]: copy }));
  };

  /* ================= FILE SELECTION ================= */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setSelectedUrls(files.map(f => URL.createObjectURL(f)));
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    setLoading(true);

    try {
      let uploadedUrls = [];

      /* =====================================================
         CLOUDFARE IMAGE UPLOAD
         -----------------------------------------------------
         ⚠️ KEEPING THIS CODE COMMENTED AS REQUESTED
         =====================================================
      */
      /*
      for (const file of selectedFiles) {
        const fd = new FormData();
        fd.append("file", file);

        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/Files/upload`,
          { method: "POST", body: fd }
        );

        const json = await uploadRes.json();
        if (json?.data?.key) uploadedUrls.push(json.data.key);
      }
      */

      /* =====================================================
         IMAGE LOGIC
         -----------------------------------------------------
         - Existing DB images are preserved
         - Uploaded images are appended
         =====================================================
      */
      const finalImages = [
        ...form.images.filter(Boolean),
        ...uploadedUrls
      ];

      const payload = {
        name: form.name,
        description: form.description,
        brand: form.brand,
        price: Number(form.price),
        discount_price: Number(form.discount_price || 0),
        rating: Number(form.rating || 0),
        reviews_count: Number(form.reviews_count || 0),
        in_stock: Number(form.in_stock || 0),
        category_ids: form.category_ids.map(Number),
        colors: form.colors.filter(Boolean),
        sizes: form.sizes.filter(Boolean),
        images: finalImages
      };

      await apiFetch(
        isAddMode ? "/product" : `/product/${productId}`,
        {
          method: isAddMode ? "POST" : "PUT",
          body: JSON.stringify(payload)
        },
        false
      );

      setToast({
        error: false,
        message: isAddMode ? "تمت إضافة المنتج" : "تم تحديث المنتج",
        show: true
      });

      router.push("/dashboard");

    } catch (err) {
      setToast({ error: true, message: err.message, show: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-product">
      <h2>{isAddMode ? "إضافة منتج" : "تعديل منتج"}</h2>

      <input name="name" value={form.name} onChange={handleChange} />
      <textarea name="description" value={form.description} onChange={handleChange} />
      <input type="number" name="price" value={form.price} onChange={handleChange} />
      <input type="number" name="discount_price" value={form.discount_price} onChange={handleChange} />
      <input name="brand" value={form.brand} onChange={handleChange} />

      {/* CATEGORY */}
      <select
        value={form.category_ids[0] ?? ""}
        onChange={e => {
          const v = Number(e.target.value);
          setForm(p => ({ ...p, category_ids: v ? [v] : [] }));
        }}
      >
        <option value="">لا فئة</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* COLORS / SIZES / IMAGES */}
      {["colors", "sizes", "images"].map(name => (
        <div key={name}>
          <h4>{name}</h4>
          {form[name].map((v, i) => (
            <div key={i}>
              <input value={v} onChange={e => handleArrayChange(name, i, e.target.value)} />
              <button onClick={() => removeArrayItem(name, i)}>حذف</button>
            </div>
          ))}
          <button onClick={() => addArrayItem(name)}>إضافة</button>
        </div>
      ))}

      <input type="file" multiple onChange={handleFileChange} />

      <button onClick={handleSave} disabled={loading}>
        {loading ? "جاري الحفظ..." : "حفظ"}
      </button>
    </div>
  );
}
