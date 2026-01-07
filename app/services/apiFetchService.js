import next from "next";
import { getCookie, deleteCookie } from "../utils/cookies";
import { refreshToken } from "./AuthService";
export let accessToken = "";

export function setAccessToken(token) {
  accessToken = token || null;
}

export default async function apiFetch(url, options = {}, caching = true , revalidateSeconds = 240) {
  // Read token from cookie
  setAccessToken(getCookie("accessToken"));

  console.log(getCookie("accessToken"));

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };


  try {
    let res = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers,
      credentials: "include",
            next: caching ? { revalidate: revalidateSeconds } : undefined,

    },

);

    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }


    if (res.status === 401) {
      const refreshed = await refreshToken();

      if (refreshed) {
        const newToken = getCookie("accessToken");

        setAccessToken(newToken);
        headers.Authorization = `Bearer ${newToken}`;

        res = await fetch(`${baseUrl}${url}`, {
          ...options,
          headers,
          credentials: "include",
        });

        try {
          data = await res.json();
        } catch {
          data = null;
        }
      } else {
        // 🔴 Refresh failed → kill session
        setAccessToken(null);
        // Delete cookie
        deleteCookie("accessToken")
        
        // Redirect to login
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.location.href = "/login";
          }, 2500);
        }

        return {
          isSuccess: false,
          information: "Session expired. Please log in again.",
        };
      }
    }

    return data;
  } catch (error) {
    console.error("حدث خطأ بالموقع, الرجاء المحاولة مجدداً:", error);
    return { isSuccess: false, information: "Network error" };
  }
}
