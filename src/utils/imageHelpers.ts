export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Gagal membaca file gambar."));
      }
    };
    reader.onerror = () => reject(new Error("Terjadi kesalahan saat membaca file."));
    reader.readAsDataURL(file);
  });
}

export function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal memuat gambar."));
    img.src = src;
  });
}

/**
 * Compress/resize large images so they stay sharp for 1600x900 cards
 * while staying comfortably below Vercel's 4.5MB serverless payload limit.
 */
export async function prepareImageForUpload(
  dataUrl: string,
  maxDimension = 1400,
  quality = 0.92
): Promise<{ dataUrl: string; mimeType: string }> {
  const img = await loadHtmlImage(dataUrl);
  const { width, height } = img;

  let targetW = width;
  let targetH = height;

  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      targetW = maxDimension;
      targetH = Math.round((height / width) * maxDimension);
    } else {
      targetH = maxDimension;
      targetW = Math.round((width / height) * maxDimension);
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { dataUrl, mimeType: "image/jpeg" };
  }
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // Preserve PNG transparency if it looks like a logo or PNG input under reasonable size
  const isPng = dataUrl.startsWith("data:image/png");
  const mimeType = isPng ? "image/png" : "image/jpeg";
  const output = isPng
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL("image/jpeg", quality);

  return { dataUrl: output, mimeType };
}

export function sanitizeFilenameSegment(text: string, fallback: string): string {
  const cleaned = text
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  return cleaned || fallback;
}
