export async function getImageSrc(ImgUrl) {
  if (!ImgUrl || ImgUrl.length === 0) return "";

  // Already a full URL
  if (ImgUrl.startsWith("http") || ImgUrl.startsWith("https")) {
    return ImgUrl;
  }

  // Otherwise, use your backend to get temporary download URL
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Files/download/${ImgUrl}`);
    if (!res.ok) throw new Error("Failed to fetch image URL");
    
    const data = await res.json();
    console.log(data.data)
    // data should contain something like { url: "https://..." }
    return data?.data || "";
  } catch (err) {
    console.error("Error fetching image URL:", err);
    return "";
  }
}
