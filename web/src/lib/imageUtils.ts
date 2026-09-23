/**
 * Utilities for client-side image compression to prevent localStorage QuotaExceededError.
 */

export async function compressDataUrl(
  dataUrl: string,
  maxWidth = 1400,
  maxHeight = 900,
  quality = 0.78
): Promise<string> {
  // If not a data URL (e.g. http:// or https://), return as-is
  if (!dataUrl.startsWith("data:image")) {
    return dataUrl;
  }

  // SVG images do not need canvas rasterization
  if (dataUrl.startsWith("data:image/svg+xml")) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (!width || !height) {
        resolve(dataUrl);
        return;
      }

      // Calculate scaled dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressed = canvas.toDataURL("image/jpeg", quality);
        // If compressed is smaller, return compressed, else return original
        if (compressed.length < dataUrl.length) {
          resolve(compressed);
        } else {
          resolve(dataUrl);
        }
      } catch {
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

export async function compressImageFile(
  file: File,
  maxWidth = 1400,
  maxHeight = 900,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG, read as text/dataURL directly
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const rawDataUrl = reader.result as string;
      try {
        const compressed = await compressDataUrl(rawDataUrl, maxWidth, maxHeight, quality);
        resolve(compressed);
      } catch {
        resolve(rawDataUrl);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
