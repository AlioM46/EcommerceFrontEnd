"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiFetch from "@/app/services/apiFetchService";
import { useAuth } from "@/app/context/AuthContext";
import "./add-update-category.css";
import { useLoading } from "@/app/context/LoadingContext";
import { getImageSrc } from "@/app/utils/handleUrls";

const DEFAULT_IMG = "/ProductImage-Temp.jpg";

export default function AddUpdateCategory() {
  const { categoryId } = useParams();
  const router = useRouter();
  const { setToast, accessToken } = useAuth();
  const { setLoading, loading } = useLoading();

  const isAddMode = categoryId == "0";

  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);

  // ✅ Store key separately (what you send to backend)
  const [form, setForm] = useState({
    id: null,
    name: "",
    img_key: "",      // ✅ storage key or url
    parentId: null,
  });

  // ✅ Preview image (what you show in UI)
  const [imgPreview, setImgPreview] = useState(DEFAULT_IMG);

  // File selection
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedObjectUrl, setSelectedObjectUrl] = useState(null);

  // Link add
  const [imageLink, setImageLink] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);

  const [uploading, setUploading] = useState(false);

  /* ================= Validation ================= */
  const errorMsg = useMemo(() => {
    if (!form.name.trim()) return "الاسم مطلوب";
    if (!form.img_key && !selectedFile) return "الصورة مطلوبة";
    return null;
  }, [form.name, form.img_key, selectedFile]);

  /* ================= Fetch categories ================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/categories");
        if (!mounted) return;
        if (Array.isArray(res)) setCategories(res);
        else if (Array.isArray(res?.data)) setCategories(res.data);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setLoading]);

  /* ================= Fetch category (update) ================= */
  useEffect(() => {
    if (isAddMode) {
      setForm({ id: null, name: "", img_key: "", parentId: null });
      setImgPreview(DEFAULT_IMG);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/categories/${categoryId}`, {}, false);
        if (!res) throw new Error("لم يتم العثور على الفئة");

        // ✅ Expect:
        // res.img_url = key, res.full_img_url = full url
        const key = res.img_url || "";
        const full = res.full_img_url || "";

        if (!mounted) return;

        setForm({
          id: res.id,
          name: res.name || "",
          img_key: key, // ✅ keep the key
          parentId: res.parent_id || null,
        });

        // ✅ show preview
        setImgPreview(full || (key ? await getImageSrc(key).catch(() => key) : DEFAULT_IMG));
      } catch {
        setToast({ error: true, message: "فشل تحميل بيانات الفئة", show: true });
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [categoryId, isAddMode, setLoading, setToast]);

  /* ================= Cleanup object URL ================= */
  useEffect(() => {
    return () => {
      if (selectedObjectUrl) {
        try {
          URL.revokeObjectURL(selectedObjectUrl);
        } catch {}
      }
    };
  }, [selectedObjectUrl]);

  /* ================= Handlers ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // cleanup old object url
    if (selectedObjectUrl) {
      try {
        URL.revokeObjectURL(selectedObjectUrl);
      } catch {}
    }

    const tempUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setSelectedObjectUrl(tempUrl);

    // ✅ preview immediately
    setImgPreview(tempUrl);

    // ✅ IMPORTANT: don't overwrite img_key yet (only after upload)
    // clear link
    setImageLink("");
  };
const handleAddImageLink = async () => {
  if (!imageLink || !/^https?:\/\//i.test(imageLink)) {
    setToast({ error: true, message: "أدخل رابط صورة صالح (http/https)", show: true });
    return;
  }

  try {
    setLinkLoading(true);

    // ✅ keep your old logic: resolve then store the RESOLVED URL
    const resolved = await getImageSrc(imageLink).catch(() => imageLink);

    setForm(prev => ({ ...prev, img_key: resolved || imageLink })); // ✅ store resolved URL
    setImgPreview(resolved || imageLink);

    // ✅ clear selected file (same as your old behavior)
    if (selectedObjectUrl) {
      try { URL.revokeObjectURL(selectedObjectUrl); } catch {}
    }
    setSelectedObjectUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setImageLink("");
  } catch {
    setToast({ error: true, message: "فشل تحميل الصورة من الرابط", show: true });
  } finally {
    setLinkLoading(false);
  }
};



  const handleRemoveImage = () => {
    // remove stored key
    setForm((prev) => ({ ...prev, img_key: "" }));
    setImgPreview(DEFAULT_IMG);

    // cleanup local selection
    if (selectedObjectUrl) {
      try {
        URL.revokeObjectURL(selectedObjectUrl);
      } catch {}
    }
    setSelectedObjectUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setImageLink("");
  };

  /* ================= Save ================= */
  const handleSave = async () => {
    if (errorMsg) {
      setToast({ error: true, message: errorMsg, show: true });
      return;
    }

    setLoading(true);

    try {
      let finalKey = form.img_key;

      // ✅ If a file is selected -> upload and get key
      if (selectedFile) {
        if (!accessToken) {
          setToast({ error: true, message: "يجب تسجيل الدخول لرفع الصور", show: true });
          return;
        }

        setUploading(true);

        const fd = new FormData();
        fd.append("file", selectedFile);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storage/upload`, {
          method: "POST",
          body: fd,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          const errPayload = await res.json().catch(() => ({}));
          throw new Error(errPayload.message || "فشل رفع الصورة");
        }

        const json = await res.json();
        const key = json?.data?.key;
        if (!key) throw new Error("لم يتم إرجاع key بعد الرفع");

        finalKey = key;

        // update preview to real image
        const resolved = await getImageSrc(key).catch(() => key);
        setImgPreview(resolved || DEFAULT_IMG);

        // cleanup file selection
        if (selectedObjectUrl) {
          try {
            URL.revokeObjectURL(selectedObjectUrl);
          } catch {}
        }
        setSelectedObjectUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        setUploading(false);
      }

      const payload = {
        name: form.name.trim(),
        img_url: finalKey || null,     // ✅ send key (or url)
        parent_id: form.parentId,
      };

      const saveRes = await apiFetch(
        isAddMode ? `/categories` : `/categories/${categoryId}`,
        {
          method: isAddMode ? "POST" : "PUT",
          body: JSON.stringify(payload),
        }
      );

      if (saveRes?.isSuccess) {
        setToast({
          error: false,
          message: isAddMode ? "تمت إضافة الفئة بنجاح" : "تم تحديث الفئة بنجاح",
          show: true,
        });
        router.push("/dashboard");
      } else {
        throw new Error(saveRes?.information || "فشلت العملية");
      }
    } catch (err) {
      setToast({
        error: true,
        message: err?.information || err?.message || "حدث خطأ أثناء الحفظ",
        show: true,
      });
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  return (
    <div className="update-category">
      <div className="uc-header">
        <div>
          <h2 className="uc-title">{isAddMode ? "إضافة فئة جديدة" : "تعديل الفئة"}</h2>
          <p className="uc-sub">اختر الاسم والفئة الأب وأضف صورة ثم احفظ</p>
        </div>

      </div>

      <div className="uc-grid">
        {/* LEFT */}
        <div className="card">
          <h3 className="section-title">بيانات الفئة</h3>

          <div className="field">
            <label className="label">الاسم *</label>
            <input className="input" name="name" value={form.name} onChange={handleChange} />
          </div>

          <div className="field">
            <label className="label">تتبع لفئة أخرى؟</label>
            <select
              className="input"
              value={form.parentId ?? 0}
              onChange={(e) => {
                const value = Number(e.target.value);
                setForm((prev) => ({
                  ...prev,
                  parentId: value === 0 ? null : value,
                }));
              }}
            >
              <option value={0}>لا</option>
              {categories.map((cat) => {
                if (String(cat.id) === String(categoryId)) return null;
                return (
                  <option key={cat.id} value={cat.id} disabled={cat.parent_id == categoryId}>
                    {cat.name}
                  </option>
                );
              })}
            </select>
            <div className="help">لا تختار نفس الفئة كأب لنفسها</div>
          </div>

          <div className="divider" />

          <h3 className="section-title">الصورة</h3>

          <div className="field">
            <label className="label">رفع صورة *</label>
            <input
              ref={fileInputRef}
              className="input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={loading || uploading}
            />
            <div className="help">يمكنك رفع صورة، أو لصق رابط/Key</div>
          </div>

          <div className="link-row">
            <input
              className="input"
              placeholder="رابط الصورة أو key"
              value={imageLink}
              onChange={(e) => setImageLink(e.target.value)}
              disabled={loading || uploading}
            />
            <button className="btn" type="button" onClick={handleAddImageLink} disabled={linkLoading || loading || uploading}>
              {linkLoading ? "..." : "إضافة"}
            </button>
          </div>

          <div className="right-actions">
            <button className="btn danger" type="button" onClick={handleRemoveImage} disabled={loading || uploading}>
              إزالة الصورة
            </button>
          </div>

          {errorMsg ? <div className="notice">⚠️ {errorMsg}</div> : null}
        </div>

        {/* RIGHT */}
        <div className="card sticky">
          <h3 className="section-title">المعاينة</h3>

          <div className="upload-box">
            <div className="upload-top">
              <div>
                <div className="upload-title">صورة الفئة</div>
                <div className="upload-sub">
                  {selectedFile ? "هذه معاينة قبل الرفع" : form.img_key ? "صورة محفوظة/محددة" : "لا توجد صورة"}
                </div>
              </div>
            </div>

            <div className="preview">
              <img src={imgPreview || DEFAULT_IMG} alt={form.name || "Category"} />
              <div className="preview-meta">
                <span>الاسم: {form.name || "-"}</span>
                <span>الحالة: {loading || uploading ? "جارٍ..." : "جاهز"}</span>
              </div>
            </div>
          </div>

          <div className="right-actions">
            <button className="btn ghost" onClick={() => router.back()} disabled={loading || uploading}>
              رجوع
            </button>
            <button className="btn primary" onClick={handleSave} disabled={loading || uploading}>
              {loading || uploading ? "جاري الحفظ..." : isAddMode ? "إضافة" : "تحديث"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
