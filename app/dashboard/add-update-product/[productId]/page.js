"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import apiFetch from "@/app/services/apiFetchService";
import { useParams, useRouter } from "next/navigation";
import "./add-update-product.css";
import { useAuth } from "@/app/context/AuthContext";
import { useLoading } from "@/app/context/LoadingContext";

const emptyForm = {
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
  images: [], // ✅ [{key, url, source}]
};

function toNumberSafe(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function uniqByKey(images) {
  const map = new Map();
  for (const img of images) {
    if (!img?.key) continue;
    map.set(img.key, img);
  }
  return Array.from(map.values());
}

// ✅ fallback: if backend does NOT return key, try to extract from url
function extractKeyFromUrl(url) {
  try {
    // Example: https://cdn.com/bucket/path/to/key.jpg -> key is everything after last /
    // If your keys contain folders, you MUST return key from backend instead.
    // This fallback works only if key is last segment.
    return decodeURIComponent(url.split("?")[0].split("/").pop());
  } catch {
    return null;
  }
}

export default function AddUpdateProduct() {
  const { productId } = useParams();
  const router = useRouter();
  const isAddMode = productId === "0";

  const { setToast, accessToken } = useAuth();
  const { loading, setLoading } = useLoading();

  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);

  // ✅ New local files before upload
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedUrls, setSelectedUrls] = useState([]); // object URLs

  const errors = useMemo(() => {
    const e = {};
    if (!form.name?.trim()) e.name = "الاسم مطلوب";
    if (!form.description?.trim()) e.description = "الوصف مطلوب";
    if (form.price === "" || toNumberSafe(form.price, -1) < 0) e.price = "السعر غير صالح";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    apiFetch("/categories", {}, false).then((res) => {
      if (Array.isArray(res)) setCategories(res);
      else if (Array.isArray(res?.data)) setCategories(res.data);
    });
  }, []);

  /* ================= FETCH PRODUCT (UPDATE MODE) ================= */
  useEffect(() => {
    if (isAddMode) {
      setForm(emptyForm);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/product/${productId}`, {}, false);
        const data = res?.data ?? res;

        if (!mounted) return;

        // ✅ IMPORTANT: build images as [{key,url,source:"existing"}]
        const existingImages =
          data?.images?.map((i) => {
            const url = i.full_url || i.url;
            const key = i.key || i.storage_key || i.path || extractKeyFromUrl(url); // fallback
            return key ? { key, url, source: "existing" } : null;
          }).filter(Boolean) || [];

        setForm({
          ...emptyForm,
          ...data,
          category_ids: data.categories?.map((c) => c.id) || [],
          colors: data.colors?.map((c) => c.color) || [],
          sizes: data.sizes?.map((s) => s.size) || [],
          images: existingImages,
          price: data?.price ?? "",
          discount_price: data?.discount_price ?? "",
          rating: data?.rating ?? "",
          reviews_count: data?.reviews_count ?? "",
          in_stock: data?.in_stock ?? "",
        });
      } catch {
        setToast({ error: true, message: "فشل تحميل المنتج", show: true });
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [productId, isAddMode, setLoading, setToast]);

  /* ================= INPUT HANDLERS ================= */
  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleArrayChange = (name, index, value) => {
    setForm((prev) => {
      const copy = [...prev[name]];
      copy[index] = value;
      return { ...prev, [name]: copy };
    });
  };

  const addArrayItem = (name) => setForm((prev) => ({ ...prev, [name]: [...prev[name], ""] }));

  const removeArrayItem = (name, index) => {
    setForm((prev) => {
      const copy = [...prev[name]];
      copy.splice(index, 1);
      return { ...prev, [name]: copy };
    });
  };

  /* ================= FILE SELECTION ================= */
  const cleanupObjectUrls = (urls) => {
    urls.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch {}
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    cleanupObjectUrls(selectedUrls);

    setSelectedFiles(files);
    setSelectedUrls(files.map((f) => URL.createObjectURL(f)));
  };

  useEffect(() => {
    return () => cleanupObjectUrls(selectedUrls);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setSelectedUrls((prev) => {
      const removed = prev[index];
      cleanupObjectUrls([removed]);
      return prev.filter((_, i) => i !== index);
    });

    setTimeout(() => {
      if (fileInputRef.current && selectedFiles.length <= 1) fileInputRef.current.value = "";
    }, 0);
  };

  // ✅ Delete an existing image from the product (state only)
  const removeExistingImage = (key) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.key !== key),
    }));
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!isValid) {
      setToast({ error: true, message: "تأكد من إدخال البيانات بشكل صحيح", show: true });
      return;
    }

    setLoading(true);

    try {
      // upload needs auth
      if (selectedFiles.length > 0 && !accessToken) {
        setToast({ error: true, message: "يجب تسجيل الدخول لرفع الصور", show: true });
        return;
      }

      // ✅ Upload new selected files -> get keys
      const uploaded = [];

      for (const file of selectedFiles) {
        const fd = new FormData();
        fd.append("file", file);

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storage/upload`, {
          method: "POST",
          body: fd,
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (!uploadRes.ok) {
          const errPayload = await uploadRes.json().catch(() => ({}));
          throw new Error(errPayload.message || "فشل رفع الصورة");
        }

        const json = await uploadRes.json();

        // ✅ IMPORTANT: we need key + (optional) preview url
        const key = json?.data?.key;
        const url =
          json?.data?.full_url ||
          json?.data?.url ||
          json?.data?.public_url ||
          null;

        if (key) uploaded.push({ key, url: url || "", source: "new" });
      }

      // ✅ Merge existing images + uploaded images (dedupe by key)
      const finalImageObjects = uniqByKey([...form.images, ...uploaded]);

      // ✅ Clear local file selection
      cleanupObjectUrls(selectedUrls);
      setSelectedFiles([]);
      setSelectedUrls([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // ✅ Payload must contain ONLY KEYS
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        brand: (form.brand || "").trim(),
        price: toNumberSafe(form.price, 0),
        discount_price: toNumberSafe(form.discount_price || 0, 0),
        rating: toNumberSafe(form.rating || 0, 0),
        reviews_count: toNumberSafe(form.reviews_count || 0, 0),
        in_stock: toNumberSafe(form.in_stock || 0, 0),
        category_ids: (form.category_ids || []).map(Number).filter(Boolean),
        colors: (form.colors || []).map((x) => String(x).trim()).filter(Boolean),
        sizes: (form.sizes || []).map((x) => String(x).trim()).filter(Boolean),
        images: finalImageObjects.map((x) => x.key), // ✅ only keys
      };

      await apiFetch(
        isAddMode ? "/product" : `/product/${productId}`,
        {
          method: isAddMode ? "POST" : "PUT",
          body: JSON.stringify(payload),
        },
        false
      );

      // ✅ Update local state to the merged list (keeps UI correct)
      setForm((prev) => ({ ...prev, images: finalImageObjects }));

      setToast({
        error: false,
        message: isAddMode ? "تمت إضافة المنتج" : "تم تحديث المنتج",
        show: true,
      });

      router.push("/dashboard");
    } catch (err) {
      setToast({ error: true, message: err?.message || "حدث خطأ", show: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aup-wrap">
      <div className="aup-header">
        <div>
          <h2 className="aup-title">{isAddMode ? "إضافة منتج" : "تعديل منتج"}</h2>
          <p className="aup-subtitle">املأ البيانات ثم اضغط حفظ</p>
        </div>
      </div>

      <div className="aup-grid">
        {/* LEFT */}
        <div className="card">
          <h3 className="section-title">المعلومات الأساسية</h3>

          <div className="grid-2">
            <Field label="الاسم" value={form.name} error={errors.name} onChange={(v) => setField("name", v)} />
            <Field label="الماركة" value={form.brand} onChange={(v) => setField("brand", v)} />
          </div>

          <div className="section-spacer" />

          <FieldArea label="الوصف" value={form.description} error={errors.description} onChange={(v) => setField("description", v)} />

          <div className="section-spacer" />
          <h3 className="section-title">الأسعار والمخزون</h3>

          <div className="grid-4">
            <Field type="number" label="السعر" value={form.price} error={errors.price} onChange={(v) => setField("price", v)} />
            <Field type="number" label="سعر التخفيض" value={form.discount_price} onChange={(v) => setField("discount_price", v)} />
            <Field type="number" label="الكمية بالمخزون" value={form.in_stock} onChange={(v) => setField("in_stock", v)} />
            <Field type="number" label="التقييم" value={form.rating} onChange={(v) => setField("rating", v)} />
          </div>

          <div className="section-spacer" />

          <div className="grid-2">
            <Field type="number" label="عدد المراجعات" value={form.reviews_count} onChange={(v) => setField("reviews_count", v)} />

            <div className="field">
              <label className="label">الفئة</label>
              <select
                className="input"
                value={form.category_ids?.[0] ?? ""}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setForm((p) => ({ ...p, category_ids: v ? [v] : [] }));
                }}
                disabled={loading}
              >
                <option value="">لا فئة</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="help">يمكنك اختيار فئة واحدة حالياً</div>
            </div>
          </div>

          <div className="section-spacer" />
          <h3 className="section-title">الخصائص</h3>

          <ArrayEditor
            label="الألوان"
            values={form.colors}
            onAdd={() => addArrayItem("colors")}
            onRemove={(i) => removeArrayItem("colors", i)}
            onChange={(i, v) => handleArrayChange("colors", i, v)}
          />

          <div className="section-spacer" />

          <ArrayEditor
            label="الأحجام"
            values={form.sizes}
            onAdd={() => addArrayItem("sizes")}
            onRemove={(i) => removeArrayItem("sizes", i)}
            onChange={(i, v) => handleArrayChange("sizes", i, v)}
          />
        </div>

        {/* RIGHT */}
        <div className="card sticky">
          <h3 className="section-title">الصور</h3>

          <div className="upload-box">
            <div className="upload-top">
              <div>
                <div className="upload-title">رفع صور جديدة</div>
                <div className="upload-sub">يمكنك اختيار عدة صور مرة واحدة</div>
              </div>

              <label className={`btn outline ${loading ? "disabled" : ""}`}>
                اختر صور
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {selectedUrls.length > 0 && (
              <>
                <div className="divider" />
                <div className="img-grid">
                  {selectedUrls.map((u, i) => (
                    <div key={u} className="img-item">
                      <img src={u} alt={`selected-${i}`} />
                      <button type="button" className="img-remove" onClick={() => removeSelectedFile(i)} disabled={loading}>
                        ✕
                      </button>
                      <div className="img-badge">قبل الرفع</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="divider" />

          {form.images.length ? (
            <div className="img-grid">
              {form.images.map((img) => (
                <div key={img.key} className="img-item">
                  <img src={img.url} alt={img.key} />
                  <button type="button" className="img-remove" onClick={() => removeExistingImage(img.key)} disabled={loading}>
                    ✕
                  </button>
                  <div className="img-badge">حالي</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">لا توجد صور حالياً</div>
          )}

          <div className="right-actions">
            <button className="btn ghost" onClick={() => router.back()} disabled={loading}>
              رجوع
            </button>
            <button className="btn primary" onClick={handleSave} disabled={loading || !isValid}>
              {loading ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI Components ---------- */
function Field({ label, value, onChange, type = "text", error }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <input className={`input ${error ? "input-error" : ""}`} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}

function FieldArea({ label, value, onChange, error }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <textarea className={`textarea ${error ? "input-error" : ""}`} value={value} onChange={(e) => onChange(e.target.value)} />
      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}

function ArrayEditor({ label, values, onAdd, onRemove, onChange }) {
  return (
    <div className="array-editor">
      <div className="array-head">
        <div className="array-title">{label}</div>
        <button type="button" className="btn outline small" onClick={onAdd}>
          + إضافة
        </button>
      </div>

      {values?.length ? (
        values.map((v, i) => (
          <div key={`${label}-${i}`} className="array-row">
            <input className="input" value={v} onChange={(e) => onChange(i, e.target.value)} />
            <button type="button" className="btn danger small" onClick={() => onRemove(i)}>
              حذف
            </button>
          </div>
        ))
      ) : (
        <div className="empty">لا يوجد عناصر بعد</div>
      )}
    </div>
  );
}
