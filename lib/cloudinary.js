export async function uploadImage(file) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary configuration missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || "Image upload failed");
  }

  const data = await response.json();
  return data.secure_url;
}

export function isCloudinaryUrl(url) {
  return typeof url === "string" && /res\.cloudinary\.com/i.test(url);
}

export function optimizeCloudinaryUrl(url, transforms = "f_auto,q_auto,dpr_auto,c_limit,w_1600") {
  if (!isCloudinaryUrl(url) || typeof url !== "string") return url;
  if (url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/${transforms}/`);
  }
  return url;
}
