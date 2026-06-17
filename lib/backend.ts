const DEFAULT_BACKEND_BASE_URL = "http://localhost:8000";

export function backendUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL || DEFAULT_BACKEND_BASE_URL;
  const cleanBase = base.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}
