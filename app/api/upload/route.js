import { uploadFile } from "@/app/utils/googleDrive";

export const config = {
  api: { bodyParser: false },
};

export async function POST(req) {
  try {
    const formData = await req.formData(); // Web API

    const files = formData.getAll("file"); // get all uploaded files
    const uploadedUrls = [];

    for (const file of files) {
      // Convert the File object to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileName = `product-${Date.now()}-${file.name}`;
      const result = await uploadFile(buffer, fileName);

      uploadedUrls.push(result.fileId);
    }

    return new Response(JSON.stringify({ uploadedUrls }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
