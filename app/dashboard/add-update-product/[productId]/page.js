"use client";
import React, { useEffect, useState } from "react";
import apiFetch from "@/app/services/apiFetchService";
import { useParams, useRouter } from "next/navigation";
import "./add-update-product.css";
import { useAuth } from "@/app/context/AuthContext";
import { useLoading } from "@/app/context/LoadingContext";

export default function AddUpdateProduct() {
  const { productId } = useParams();
  const { setToast, user } = useAuth();
  const router = useRouter();

  const isAddMode = productId === "0";
  

  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);



  const {loading, setLoading} = useLoading(); 

    // New state for multiple previews and selection
const [selectedFiles, setSelectedFiles] = useState([]); // Array of File objects
const [selectedUrls, setSelectedUrls] = useState([]);   // URLs for preview
const [chosenImages, setChosenImages] = useState([]);   // URLs selected to save

  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    brand: "",
    rating: "",
    reviewsCount: "",
    createdAt: "",
    updatedAt: null,
    userId: "",
    inStock: "",
    categoryIds: [],
    categories: [],
    productColors: [],
    productSizes: [],
    productImagesUrl: []
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await apiFetch("/categories",{}, false);
      if (res?.length > 0) setCategories(res);
    };
    fetchCategories();
  }, []);

  // Fetch product data if in update mode
  useEffect(() => {
    if (isAddMode) return;

    async function fetchProduct() {
      try {
        const res = await apiFetch(`/product/${productId}`,{}, false);
        if (!res) throw new Error("لم يتم العثور على المنتج");

        setForm(prev => ({
          ...prev,
          ...res,
          brand: res.brand ?? "",
          description: res.description ?? "",
          rating: res.rating ?? 0,
          reviewsCount: res.reviewsCount ?? 0,
          categories: res.categories ?? [],
          productColors: res.productColors ?? [],
          productSizes: res.productSizes ?? [],
          productImagesUrl: res.productImagesUrl ?? []
        }));


      } catch (err) {
        setToast({ error: true, message: "فشل تحميل بيانات المنتج", show: true });
      setLoading(false)

      }
    }
    fetchProduct();
  }, [productId, isAddMode, setToast]);


  
  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle dynamic arrays
  const handleArrayChange = (arrayName, index, value) => {
    const updated = [...form[arrayName]];
    updated[index] = value;
    setForm(prev => ({ ...prev, [arrayName]: updated }));
  };
  const handleAddArrayItem = (arrayName) =>
    setForm(prev => ({ ...prev, [arrayName]: [...prev[arrayName], ""] }));
  const handleRemoveArrayItem = (arrayName, index) => {
    const updated = [...form[arrayName]];
    updated.splice(index, 1);
    setForm(prev => ({ ...prev, [arrayName]: updated }));
  };




const handleFileChange = (e) => {
  const files = Array.from(e.target.files); // File objects
  const urls = files.map(file => URL.createObjectURL(file)); // preview

  setSelectedFiles(files);
  setSelectedUrls(urls);
  setChosenImages(urls); // selected to upload

}
const toggleImageSelection = (url) => {
  setChosenImages(prev => 
    prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
  );
};


  // Form validation
  const validateForm = () => {
    if (!form.name.trim()) return "الاسم مطلوب";
    if (isNaN(form.price) || Number(form.price) <= 0) return "السعر يجب أن يكون رقم أكبر من صفر";
    if (form.discountPrice && Number(form.discountPrice) > Number(form.price))
      return "سعر الخصم يجب أن يكون أقل من السعر الأصلي";
    if (form.rating && (form.rating < 0 || form.rating > 5)) return "التقييم يجب أن يكون بين 0 و 5";
    if (form.reviewsCount && form.reviewsCount < 0) return "عدد المراجعات لا يمكن أن يكون سالباً";
    if (form.inStock && form.inStock < 0) return "الكمية المتاحة لا يمكن أن تكون سالبة";
    return null;
  };

  // Save product
  const handleSave = async () => {


    
    const validationError = validateForm();
    if (validationError) return setToast({ error: true, message: validationError, show: true });

    
    setLoading(true);


       

    try {


      var uploadedUrls = [];

for (const file of selectedFiles) {
  const formData = new FormData();
  formData.append("file", file); // must match backend param

  // console.log("File object:", file);
  for (let pair of formData.entries()) {
    // console.log("FormdAta",pair[0], pair[1]); // check that file is actually in FormData
  }

  const fileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Files/upload`, {
    method: "POST",
    body: formData,
  });


  const data = await fileRes.json();
  // setToast({show:true, message: JSON.stringify({data})})

  if (data.data.key) uploadedUrls.push(data.data.key);
}






// return;
      // 2️⃣ Merge with already existing URLs in form
      const finalImageUrls = [...form.productImagesUrl.filter(c => c.trim() !== ""), ...uploadedUrls];
     
     
     const payload = {
  ...form,
  categoryIds: form?.categoryIds[0] == "" ? [] :form.categoryIds,
  productImagesUrl: finalImageUrls, // <-- include it here
  price: Number(parseFloat(form.price).toFixed(2)),
  discountPrice: form.discountPrice ? Number(parseFloat(form.discountPrice).toFixed(2)) : 0,
  inStock: parseInt(form.inStock || 0),
  rating: parseFloat(form.rating || 0),
  reviewsCount: parseInt(form.reviewsCount || 0),
  categories: form.categories.filter(c => c.trim() !== ""),
  productColors: form.productColors.filter(c => c.trim() !== ""),
  productSizes: form.productSizes.filter(c => c.trim() !== ""),
};
      const today = new Date().toISOString().split("T")[0];
      if (isAddMode) {
        payload.createdAt = today;
        payload.userId = user.userId;
      } else {
        payload.updatedAt = today;
      }
      const res = await apiFetch(isAddMode ? `/product` : `/product/${productId}`, {
        method: isAddMode ? "POST" : "PUT",
        body: JSON.stringify(payload)
      }, false);

      if (res.isSuccess) {
        setToast({ error: false, message: isAddMode ? "تمت إضافة المنتج بنجاح" : "تم تحديث المنتج بنجاح", show: true });
        router.push("/dashboard");
      } else throw new Error(res?.message || "فشل العملية");
    } catch (err) {
      setToast({ error: true, message: err.message || "حدث خطأ أثناء الحفظ", show: true });
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-product p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl mb-6">{isAddMode ? "إضافة منتج جديد" : "تعديل المنتج"}</h2>

      <label>الاسم *</label>
      <input name="name" value={form.name} onChange={handleChange} />

      <label>الوصف</label>
      <textarea name="description" value={form.description} onChange={handleChange} />

      <label>السعر *</label>
      <input type="number" name="price" value={form.price} onChange={handleChange} />

      <label>سعر الخصم</label>
      <input type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange} />

      <label>العلامة التجارية</label>
      <input name="brand" value={form.brand} onChange={handleChange} />

      <label>التقييم (0-5)</label>
      <input type="number" step="0.1" min={0} max={5} name="rating" value={form.rating} onChange={handleChange} />

      <label>عدد المراجعات</label>
      <input type="number" name="reviewsCount" min={0} value={form.reviewsCount} onChange={handleChange} />

      <label>الكمية المتاحة</label>
      <input type="number" name="inStock" min={0} value={form.inStock} onChange={handleChange} />

      <label>الفئة</label>
      <select onChange={(e) => setForm({ ...form, categoryIds: [e.target.value] })} value={form.categoryIds[form.categoryIds.length - 1] || ""}>
        <option value={""}>لا يندرج تحت اي فئة</option>
        <optgroup>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.fullPath}</option>)}
        </optgroup>
      </select>

      <div className="mb-4">
        <h4>الفئات الحالية</h4>
        <ul>{form.categories.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
      </div>

      {/* Dynamic arrays */}
      {["productColors", "productSizes", "productImagesUrl"].map((arrayName) => (
        <div key={arrayName} className="mb-4">1
          <h4>{arrayName}</h4>
          {form[arrayName].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-1">
              <input
                value={item}
                placeholder={arrayName === "productImagesUrl" ? "لصق رابط ": ""}
                onChange={(e) =>
                  handleArrayChange(arrayName, idx, e.target.value)
                }
              />
              <button type="button" onClick={() => handleRemoveArrayItem(arrayName, idx)}>حذف</button>
            </div>
          ))}
          <button type="button" onClick={() => handleAddArrayItem(arrayName)}>اضافة</button>
        </div>
      ))}

      {/* File upload */}
<div className="mb-4">
  <input type="file" accept="image/*" multiple onChange={handleFileChange} />

  {selectedUrls.length > 0 && (
    <div className="image-preview-container">
      {selectedUrls.map((url, idx) => (
        <div
          key={idx}
          className={`image-preview ${chosenImages.includes(url) ? "selected" : ""}`}
          onClick={() => toggleImageSelection(url)}
        >
          <img src={url} alt={`Preview ${idx}`} />
          {chosenImages.includes(url) && (
            <button onClick={(e) => { e.stopPropagation(); toggleImageSelection(url); }}>×</button>
          )}
        </div>
      ))}
    </div>
  )}
</div>


      <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
        {loading ? "جاري الحفظ..." : isAddMode ? "إضافة المنتج" : "تحديث المنتج"}
      </button>
    </div>
  );
}
