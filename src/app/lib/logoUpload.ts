export const LOGO_ACCEPT = "image/png,image/jpeg,image/webp";
export function validateLogo(file: { size: number; type: string }) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    return "Elige una imagen PNG, JPEG o WebP.";
  }
  if (!file.size || file.size > 2 * 1024 * 1024) {
    return "El logo debe pesar entre 1 byte y 2 MB.";
  }
  return null;
}

export function requestHeaders(body?: BodyInit | null, headers?: HeadersInit) {
  const result = new Headers(headers);
  if (body && !(body instanceof FormData) && !result.has("Content-Type")) {
    result.set("Content-Type", "application/json");
  }
  return result;
}

export function logoFormData(file: File) {
  const body = new FormData();
  body.append("file", file);
  return body;
}
