"use client";

import React, { useState, useEffect} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faBars, faTimes, faSearch, faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/app/context/AuthContext";
import Button from "../Button/Button";
import "./Header.css";
import "../../globals.css";



export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { isAuthenticated, logout, isAdmin, isOwner, cartLength } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // current URL

  
  useEffect(() => {
  const handleClickAnywhere = () => {
    if (menuOpen) setMenuOpen(false);
  };

  document.addEventListener("click", handleClickAnywhere);

  return () => {
    document.removeEventListener("click", handleClickAnywhere);
  };
}, [menuOpen]);



  const navLinks = [
    { href: "/", label: "الصفحة الرئيسية" },
    { href: "/products", label: "المنتجات" },
    { href: "/orders", label: "الطلبات" },
    { href: "/address", label: "العناوين" },
    { href: "/store-policy", label: "سياسة المتجر" },
  ];

  if (isAdmin || isOwner) navLinks.push({ href: "/dashboard", label: "Dashboard" });

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/products?البحث-عن=${encodeURIComponent(searchQuery)}`);
    setMenuOpen(false);
    setSearchQuery("");
  };

  return (
    <header>
      <div className="container">
        {/* Logo */}

        <Link href="/" className="logo">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={120}
            height={60}
            className="logo-image"
          />
        </Link>

        {/* Hamburger Icon */}

<div style={{display:"flex", justifyContent:"center", alignItems:"center", gap:".90rem"} } className="container-bars">
<Link href={"/login"}>
  <FontAwesomeIcon icon={faCircleUser} size="xl"/>

  
</Link>

            <Link href={"/cart"} className="special-cart">
            <FontAwesomeIcon icon={faCartShopping} className="cart-icon" size="lg"/>

<span>{cartLength}</span>
            </Link>



<Link href={"/products"}>
<FontAwesomeIcon icon={faSearch} size="xl"/>
</Link>
          <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} size="lg" />
        </button>

</div>

        

        {/* Nav Bar */}

        <nav className={`navBar ${menuOpen ? "active" : ""}`}>
          <div className="navbar-links-container">
            {navLinks.map((link) => {
        return <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${
                  pathname === link?.href || pathname?.startsWith(link.href + "/")
                    ? "active-link"
                    : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            })}
          </div>

          {/* Search */}
          <div className="header-search-container nav-active-disable">
            <input
              className="header-searchBar"
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search-button "  onClick={handleSearch}>
              <FontAwesomeIcon icon={faSearch} size="sm" />
            </button>
          </div>

          {/* Auth Buttons & Cart */}
          <div>

            <Link href={"/cart"} className="special-cart special-link ">
            <FontAwesomeIcon icon={faCartShopping} className="cart-icon" size="lg"/>

<span>{cartLength}</span>
            </Link>

            {isAuthenticated ? (
              <Button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
              >
                Logout
              </Button>
            ) : (
              <>
                <Button>
                  <Link
                    href="/login"
                    className="login-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    تسجيل الدخول
                  </Link>
                </Button>
                <Button>
                  <Link
                  
                    href="/sign-up"
                    className="signup-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    انشاء حساب
                  </Link>
                </Button>
              </>
            )}

          </div>
        </nav>
      </div>
    </header>
  );
}
