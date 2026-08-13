import crypto from "crypto";

export interface ImageKitAuthResponse {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

/**
 * Generates authentication parameters for client-side uploads.
 */
export function getImageKitAuth(): ImageKitAuthResponse {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "mock_public_key";
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/mock";

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 1200; // 20 minutes expiration

  // Natively calculate HMAC-SHA1 using ImageKit private key
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  return {
    token,
    expire,
    signature,
    publicKey,
    urlEndpoint,
  };
}

/**
 * Uploads a file (base64 or buffer) to ImageKit from the server.
 */
export async function uploadToImageKit(
  fileContent: string, // Base64 data string (e.g., data:image/png;base64,...)
  fileName: string,
  folder: string = "/hh-goa/generated"
): Promise<{ url: string; fileId: string }> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!privateKey || !urlEndpoint) {
    console.warn("⚠️ Warning: ImageKit credentials missing. Using local mock generator.");
    // Return a mock base64 data url as the uploaded card URL so the app remains runnable
    return {
      url: fileContent,
      fileId: `mock_file_${crypto.randomBytes(8).toString("hex")}`,
    };
  }

  // Basic Auth header for ImageKit: base64(private_key + ":")
  const authHeader = Buffer.from(`${privateKey}:`).toString("base64");

  const formData = new FormData();
  // Strip mime type prefix from base64 if present, or pass it directly
  formData.append("file", fileContent);
  formData.append("fileName", fileName);
  formData.append("useUniqueFileName", "true");
  formData.append("folder", folder);

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ImageKit Upload API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    url: data.url,
    fileId: data.fileId,
  };
}

/**
 * Deletes a file from ImageKit.
 */
export async function deleteFromImageKit(fileId: string): Promise<void> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!privateKey || !urlEndpoint) {
    console.warn("⚠️ Warning: ImageKit credentials missing. Skipping mock deletion.");
    return;
  }

  const authHeader = Buffer.from(`${privateKey}:`).toString("base64");

  const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${authHeader}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errText = await response.text();
    console.error(`ImageKit Delete API error (${response.status}): ${errText}`);
  }
}
