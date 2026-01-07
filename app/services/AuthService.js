import { getCookie, setCookie, deleteCookie } from "../utils/cookies";
import {jwtDecode} from "jwt-decode";
import apiFetch from "./apiFetchService";

// ===== Login =====
export async function Signin(email, password) {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, false);

       console.log("Login response:", response);


  if (response.isSuccess) {
    setCookie("accessToken", response.data.accessToken);
  } else {
    deleteCookie("accessToken");
  }

  return response;
}

// ===== Register =====
export async function register(name, email, password) {
  const response = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),

  }, false);

  if (response.isSuccess) {
    setCookie("accessToken", response.data.accessToken);
  } else {
    deleteCookie("accessToken");
  }

  return response;
}

// ===== Logout =====
export async function logout() {
  const response = await apiFetch("/auth/logout", { method: "POST" }, false);
  deleteCookie("accessToken");
  return response;
}

// ===== Refresh Token =====
export async function refreshToken() {
  const token = getCookie("accessToken");
  if (!token) return false;

  const jwtDecoded = jwtDecode(token);
  const userId = jwtDecoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  console.log("Refreshing token for userId:", jwtDecoded);
  const res = await apiFetch(`/auth/refresh/${userId}`, { method: "POST" }, false);

  if (res.isSuccess) {
    setCookie("accessToken", res.data.accessToken);
    return true;
  }

  deleteCookie("accessToken");
  return false;
}
