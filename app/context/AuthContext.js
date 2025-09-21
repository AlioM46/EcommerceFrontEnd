"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { Signin, logout as Logout, register as Register } from "../services/AuthService";
import {jwtDecode} from "jwt-decode";
import { useRouter } from "next/navigation";
import { setCookie, getCookie, deleteCookie } from "../utils/cookies.js";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);    
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartItems, setCartItems] = useState([]);    
  const [toast, setToast] = useState({ show: false, message: "" , error: false });
  const [cartLength, setCartLength]  = useState(0)

  const router = useRouter();

  // ===== Cookie helpers =====
 

  // ===== Cart =====
  const addToCart = (product, color,size) => {



    
    let cart = JSON.parse(window.localStorage.getItem("cart") || "[]");

    const existingIndex = cart.findIndex(p => p.id == product.id && p.color === color && p.size === size);
   

    
  if (existingIndex !== -1) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({ ...product, color, size, qty: 1 });
  }

    window.localStorage.setItem("cart", JSON.stringify(cart));
    setCartItems(cart);
    setCartLength(cart.length || 0)



    setToast({ show: true, message: `${product.name} تم إضافته إلى السلة` });
  };

  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(() => setToast({ show: false, message: "", error: false }), 3000);
    return () => clearTimeout(timer);
  }, [toast.show]);

  useEffect(() => {
    // Initialize cart
    const cartItemsList = JSON.parse(window.localStorage.getItem("cart") || "[]");
    if (cartItemsList.length > 0) {
      setCartItems(cartItemsList);
 setCartLength(cartItemsList.length || 0)
    }
      
   
    else window.localStorage.setItem("cart", JSON.stringify([]));

    // ===== Initialize auth from cookie =====
    const token = getCookie("accessToken");
    if (token) {
      setAccessToken(token);
      setIsAuthenticated(true);
      setUserInformation(token);
    }
  }, []);

  useEffect(() => {
    const owner = user?.role?.toLowerCase() === "owner";
    const admin = user?.role?.toLowerCase() === "admin";
    setIsOwner(owner);
    setIsAdmin(admin);
  }, [user]);

  const setUserInformation = (token) => {
    if (!token) return;

    const jwtDecoded = jwtDecode(token);
    const userId = jwtDecoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const email = jwtDecoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
    const name = jwtDecoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    const role = jwtDecoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    setUser({ userId, email, name, role });
  };

  // ===== Auth actions =====
  const login = async (email, password) => {
    const res = await Signin(email, password);
    if (res?.isSuccess) {
      setCookie("accessToken", res.data.accessToken); // store in cookie
      setAccessToken(res.data.accessToken);
      setIsAuthenticated(true);
      setUserInformation(res.data.accessToken);
      setTimeout(() => router.push("/"), 1500);
    } else {
      deleteCookie("accessToken");
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await Register(name, email, password);
    if (res?.isSuccess) {
      setCookie("accessToken", res.data.accessToken);
      setAccessToken(res.data.accessToken);
      setIsAuthenticated(true);
      setUserInformation(res.data.accessToken);
      setTimeout(() => router.push("/"), 1500);
    } else {
      deleteCookie("accessToken");
    }
    return res;
  };

  const logout = async () => {
    await Logout();
    deleteCookie("accessToken");
    setAccessToken(null);
    setIsAuthenticated(false);
    setUser({});
    setIsAdmin(false);
    setIsOwner(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        register,
        login,
        logout,
        setCartItems,
        addToCart,
        setToast,
        cartLength,
        toast,
        cartItems,
        user,
        accessToken,
        isAuthenticated,
        isAdmin,
        isOwner
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
