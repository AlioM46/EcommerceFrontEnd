export async function getImageSrc(ImgUrl) {
  // if (!ImgUrl || ImgUrl.length === 0) return "";

return "";
  
  // // Already a full URL
  // if (ImgUrl.startsWith("http") || ImgUrl.startsWith("https")) {
  //   return ImgUrl;
  // }
  
  // // Otherwise, use your backend to get temporary download URL
  // try {
  //   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storage/temporary-url`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ key: ImgUrl }),
  //   });   

  //   if (!res.ok) throw new Error("Failed to fetch image URL");
    
  //   const data = await res.json();
    

  //   return data?.url || "";
  // } catch (err) {
  //   console.error("Error fetching image URL:", err);
  //   return "";
  // }
}
