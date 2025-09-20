"use client";
import { useAuth } from "../../context/AuthContext";
import React, { use, useEffect, useState } from "react";
import "./Login.css";
import { useLoading } from "../../context/LoadingContext";
import { usePathname } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const {login } = useAuth();


  const {setLoading} = useLoading();



// Automatically hide success message after 3 seconds
useEffect(() => {
  if (submitted) {
    const timer = setTimeout(() => setSubmitted(false), 3000);
    return () => clearTimeout(timer); // cleanup if component unmounts early
  }
}, [submitted]);




  const validate = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email.";
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    return newErrors;
  };

  const  handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true)
      const res = await login(email,password);
      setLoading(false)
      
if (res?.isSuccess){
      setSubmitted(true);
      setErrors({});
} else {
    setErrors({form: res?.information || "Login failed"});
}



      // TODO: call your API or AuthContext login here
    } else {
      setErrors(validationErrors);
      setSubmitted(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit} noValidate>
          {errors.form && <p className=" form-error">{errors.form}</p>}

        
        {/* Email */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        <button type="submit">Login</button>
      </form>

      {submitted && <p className="success">✅ Login successful!</p>}
    </div>
  );
}
