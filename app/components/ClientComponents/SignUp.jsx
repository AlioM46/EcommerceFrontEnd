"use client";
import { useAuth } from "../../context/AuthContext";
import React, { useEffect, useState } from "react";
import "./Login.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const { register } = useAuth();

  // إخفاء رسالة النجاح بعد 3 ثوانٍ
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setSubmitted(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  // إخفاء الأخطاء بعد 5 ثوانٍ
  useEffect(() => {
    if (errors) {
      const timer = setTimeout(() => setErrors({}), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  const validate = () => {
    const newErrors = {};

    // التحقق من الاسم
    if (!name.trim()) {
      newErrors.name = "الاسم مطلوب.";
    }

    // التحقق من البريد الإلكتروني
    if (!email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "يرجى إدخال بريد إلكتروني صحيح.";
    }

    // التحقق من كلمة المرور
    if (!password.trim()) {
      newErrors.password = "كلمة المرور مطلوبة.";
    } else if (password.length < 6) {
      newErrors.password = "يجب أن تكون كلمة المرور 6 أحرف على الأقل.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length === 0) {
      const res = await register(name, email, password);


      if (res?.isSuccess) {
        setSubmitted(true);
        setErrors({});
      } else {
        setErrors({ form: res?.information || "فشل إنشاء الحساب" });
      }
    } else {
      setErrors(validationErrors);
      setSubmitted(false);
    }
  };

  return (
    <div className="login-container">
      <h2>إنشاء حساب</h2>

      <form onSubmit={handleSubmit} noValidate>
        {errors.form && <p className="form-error">{errors.form}</p>}

        {/* الاسم */}
        <div className="form-group">
          <label>الاسم</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخل اسمك"
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>

        {/* البريد الإلكتروني */}
        <div className="form-group">
          <label>البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="أدخل بريدك الإلكتروني"
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        {/* كلمة المرور */}
        <div className="form-group">
          <label>كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور"
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        <button type="submit">تسجيل</button>
      </form>

      {submitted && <p className="success">✅ تم إنشاء الحساب بنجاح!</p>}
    </div>
  );
}
