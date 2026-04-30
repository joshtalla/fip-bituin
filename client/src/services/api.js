const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const fetchJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const errorMessage = typeof payload === "object" && payload?.error
      ? payload.error
      : "Request failed";
    const error = new Error(errorMessage);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

export { API_BASE_URL };