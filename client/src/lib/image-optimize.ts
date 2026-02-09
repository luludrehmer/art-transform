const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.85;

export interface OptimizedImage {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Resize and compress an image before upload to reduce payload and speed up transformation.
 * Keeps aspect ratio, caps longest side at MAX_DIMENSION, uses JPEG for photos.
 * Returns dataUrl and dimensions for aspect-ratio-aware transformation.
 */
export async function optimizeImageForUpload(file: File): Promise<OptimizedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const mime = file.type.startsWith("image/png") ? "image/png" : "image/jpeg";
      const quality = mime === "image/jpeg" ? JPEG_QUALITY : 0.92;
      const dataUrl = canvas.toDataURL(mime, quality);
      resolve({ dataUrl, width: canvas.width, height: canvas.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };
    img.src = objectUrl;
  });
}
