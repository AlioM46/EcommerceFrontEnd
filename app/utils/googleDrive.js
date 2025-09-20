import { google } from "googleapis";
import stream from "stream";

// OAuth credentials
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oauth2Client });

/**
 * Uploads a file buffer or stream to Google Drive, makes it public, and returns URL + ID
 * @param {Buffer|stream.Readable} fileData - file buffer or stream
 * @param {string} fileName - desired file name in Google Drive
 */
export async function uploadFile(fileData, fileName) {
  try {
    let mediaBody;

    if (Buffer.isBuffer(fileData)) {
      mediaBody = new stream.PassThrough();
      mediaBody.end(fileData);
    } else {
      mediaBody = fileData; // already a stream
    }

    // 1️⃣ Upload the file
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: "image/jpeg", // can change dynamically if needed
      },
      media: {
        mimeType: "image/jpeg",
        body: mediaBody,
      },
    });


    const fileId = response.data.id;


    // 2️⃣ Make it public
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // 3️⃣ Return direct URL
    const fileUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    return { fileId, fileUrl };
  } catch (err) {
    console.error("Google Drive upload error:", err.message);
    throw new Error(err.message);
  }
}
