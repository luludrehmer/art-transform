const MAX_DIMENSION = 2048;
const MAX_DIMENSION_MULTI = 1280; // Smaller for multi-photo to keep payload reasonable
const JPEG_QUALITY = 0.85;
const JPEG_QUALITY_MULTI = 0.75;

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
/**
 * @param isMultiPhoto When true, uses smaller dimensions and higher compression
 *   to keep the total payload reasonable for multi-photo requests.
 */
export async function optimizeImageForUpload(file: File, isMultiPhoto = false): Promise<OptimizedImage> {
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

      const maxDim = isMultiPhoto ? MAX_DIMENSION_MULTI : MAX_DIMENSION;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Always use JPEG for multi-photo to save space
      const mime = isMultiPhoto ? "image/jpeg" : (file.type.startsWith("image/png") ? "image/png" : "image/jpeg");
      const quality = isMultiPhoto ? JPEG_QUALITY_MULTI : (mime === "image/jpeg" ? JPEG_QUALITY : 0.92);
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
