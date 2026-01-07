"use client";
import { useAuth } from "../../context/AuthContext";
import React, { useEffect, useState } from "react";
import "./Login.css";
import { useLoading } from "../../context/LoadingContext";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const { login } = useAuth();
  const { setLoading } = useLoading();

  // إخفاء رسالة النجاح تلقائياً بعد 3 ثواني
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setSubmitted(false), 3000);
      return () => clearTimeout(timer); // تنظيف المؤقت عند الخروج من الصفحة
    }
  }, [submitted]);

  const validate = () => {
    const newErrors = {};

    // التحقق من البريد الإلكتروني
    if (!email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "الرجاء إدخال بريد إلكتروني صحيح.";
    }

    // التحقق من كلمة السر
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
      setLoading(true);
      const res = await login(email, password);

     
      setLoading(false);

      if (res?.isSuccess) {
        setSubmitted(true);
        setErrors({});
      } else {
        setErrors({ form: "البريد او كلمة المرور غير صحيحة" });
      }
    } else {
      setErrors(validationErrors);
      setSubmitted(false);
    }
  };

  return (
    <div className="login-container">
      <h2>تسجيل الدخول</h2>

      <form onSubmit={handleSubmit} noValidate>
        {errors.form && <p className="form-error">{errors.form}</p>}

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

        <button type="submit">تسجيل الدخول</button>
      </form>

      <Link
        style={{ marginTop: "1rem", fontWeight: "500", display: "block" }}
        href={"/sign-up"}
      >
        هل تريد إنشاء حساب؟
      </Link>

      {submitted && <p className="success">✅ تم تسجيل الدخول بنجاح!</p>}
    </div>
  );
}
