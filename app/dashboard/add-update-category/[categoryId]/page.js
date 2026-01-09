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
  const { setToast, accessToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const isAddMode = categoryId == "0";
  const { setLoading, loading } = useLoading();

  const [form, setForm] = useState({
    id: null,
    name: "",
    img_url: "",
    parentId: null,
  });

  const [uploading, setUploading] = useState(false);
  const [resolvedImgUrl, setResolvedImgUrl] = useState("/ProductImage-Temp.jpg");
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
        const res = await apiFetch(`/categories/${categoryId}`,{}, false);
        if (!res) throw new Error("لم يتم العثور على الفئة");

        setForm({
          id: res.id,
          name: res.name || "",
          img_url: res.full_img_url || "",
          parentId: res.parent_id || null,
        });


        if (res.full_img_url) {
          setResolvedImgUrl(res.full_img_url || "/ProductImage-Temp.jpg");
        }

        setLoading(false);
      } catch (err) {
        setToast({ error: true, message: "فشل تحميل بيانات الفئة", show: true });
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId, isAddMode, setToast]);

  // Handle file selection + add-by-link
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [imageLink, setImageLink] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Revoke previous temporary URL if any
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl);
    }

    const tempUrl = URL.createObjectURL(file);
    setSelectedImage(file);
    setSelectedImageUrl(tempUrl);
    setResolvedImgUrl(tempUrl); // immediately show preview

    // Clear any previous image link
    setImageLink("");
  };

  useEffect(() => {
    return () => {
      if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
    };
  }, [selectedImageUrl]);

  const handleImageLinkChange = (e) => {
    setImageLink(e.target.value);
  };

  const handleAddImageLink = async () => {
    if (!imageLink || !/^https?:\/\//i.test(imageLink)) {
      setToast({ error: true, message: 'أدخل رابط صورة صالح (http/https)', show: true });
      return;
    }

    try {
      setLinkLoading(true);
      // Try resolving the link (handles IDs / storage keys if needed)
      const resolved = await getImageSrc(imageLink).catch(() => imageLink);

      // set as the category image URL and clear any selected file
      setForm(prev => ({ ...prev, img_url: resolved || imageLink }));
      setResolvedImgUrl(resolved || imageLink);
      setSelectedImage(null);

      // clear link input
      setImageLink("");
    } catch (err) {
      setToast({ error: true, message: 'فشل تحميل الصورة من الرابط', show: true });
    } finally {
      setLinkLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, img_url: '' }));
    setResolvedImgUrl('/ProductImage-Temp.jpg');
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl);
      setSelectedImageUrl(null);
      setSelectedImage(null);
    }
    setImageLink("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "الاسم مطلوب";
    if (!form.img_url && !selectedImage) return "الصورة مطلوبة";
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
      let uploadedUrl = form.img_url;

      // If a new image is selected, upload it to the storage service
      if (selectedImage) {


        setUploading(true);

        const formData = new FormData();
        formData.append("file", selectedImage);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storage/upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (!res.ok) {
          const errPayload = await res.json().catch(() => ({}));
          throw new Error(errPayload.message || "فشل رفع الصورة");
        }


        const json = await res.json();
        uploadedUrl = json?.data?.key;
        if (!uploadedUrl) throw new Error("لم يتم إرجاع رابط الصورة بعد الرفع");

        // update preview to resolved uploaded URL
        const resolved = await getImageSrc(uploadedUrl).catch(() => uploadedUrl);
        setResolvedImgUrl(resolved || uploadedUrl);

        // cleanup selected image state
        setSelectedImage(null);
        if (selectedImageUrl) {
          URL.revokeObjectURL(selectedImageUrl);
          setSelectedImageUrl(null);
        }

        setUploading(false);
      }

      const payload = {
        name: form.name,
        img_url: uploadedUrl || null,
        parent_id: form.parentId
      };

      const saveRes = await apiFetch(isAddMode ? `/categories` : `/categories/${categoryId}`, {
        method: isAddMode ? "POST" : "PUT",
        body: JSON.stringify(payload)
      });

      if (saveRes.isSuccess) {
        setToast({ error: false, message: isAddMode ? "تمت إضافة الفئة بنجاح" : "تم تحديث الفئة بنجاح", show: true });
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
<select
  value={form.parentId ?? 0}
  onChange={(e) => {
    const value = Number(e.target.value);
    setForm(prev => ({
      ...prev,
      parentId: value === 0 ? null : value
    }));
  }}
>
  <option value={0}>لا</option>
        <optgroup>
{
  categories.map((cat) => {
    if (cat.id == categoryId) return;

             return   <option disabled={cat.parent_id == categoryId} value={cat.id} key={cat.id}>
              {cat.name}
            </option>  })  
}
        </optgroup>
      </select>



      <label>رفع صورة *</label>
      <input type="file" accept="image/*" onChange={handleFileSelect} />

      <div className="image-link-row">
        <input
          className="image-link-input"
          placeholder="أدخل رابط الصورة (مثال: https://example.com/img.jpg)"
          value={imageLink}
          onChange={handleImageLinkChange}
        />
        <button type="button" className="image-link-button" onClick={handleAddImageLink} disabled={linkLoading}>
          {linkLoading ? 'جاري التحميل...' : 'أضف الرابط'}
        </button>
        <button type="button" className="remove-image-button" onClick={handleRemoveImage}>
          إزالة الصورة
        </button>
      </div>

      {(uploading || loading) && <p>جارٍ المعالجة...</p>}

      {resolvedImgUrl && (
        <div className="category-image-preview">
          <img src={resolvedImgUrl} alt={form.name} style={{ width: 150, height: 150, objectFit: "cover" }} />
        </div>
      )}

      {/* {!isAddMode && (
        <div>
          <label>عدد المنتجات</label>
          <input value={form.productCount} disabled />
        </div>
      )} */}

      <button disabled={loading || uploading} onClick={handleSave}>
        {isAddMode ? "إضافة الفئة" : "تحديث الفئة"}
      </button>
    </div>
  );
}
