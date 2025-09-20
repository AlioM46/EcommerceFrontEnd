
"use client";
import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer.jsx";
import Toast from "./components/Toast/Toast.jsx";
import SpinnerWrapper from "./components/SpinnerLoading/SpinnerWrapper";
import { LoadingProvider } from "./context/LoadingContext";


    function ToastWrapper() {
  const { toast } = useAuth();
  return <Toast show={toast.show} message={toast.message} error={toast.error} />;
}

export default function ClientAppWrapper({ children }) {




  return (
    <AuthProvider>
      <LoadingProvider>

      <Header />
      {children}
      <Footer />
   <SpinnerWrapper />
   <ToastWrapper/>
      </LoadingProvider>
    </AuthProvider>
  );
}
