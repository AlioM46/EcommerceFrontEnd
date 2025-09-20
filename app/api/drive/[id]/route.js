export async function GET(req, { params }) {
  const { id } = params;

  // Generate a proper Google Drive download URL
  const url = `https://drive.google.com/uc?export=download&id=${id}`;

  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });

  if (!res.ok) {
    return new Response("Failed to fetch image", { status: res.status });
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = await res.arrayBuffer();

  return new Response(buffer, {
    headers: { "Content-Type": contentType },
  });
}
