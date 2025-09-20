"use client";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import "./UnAuthorized.css"; // CSS file

export default function UnAuthorized() {
  const { user } = useAuth();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card container">
        <h1 className="unauthorized-title">
          عذراً يا {user?.name || "المستخدم"}
        </h1>
        <p className="unauthorized-message">
          لا تمتلك الصلاحية للدخول إلى هذا الرابط.
        </p>
        <Link href="/" className="unauthorized-button">
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
