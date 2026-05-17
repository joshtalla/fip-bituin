const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { supabase } from "./supabaseClient";
import { normalizeLanguageCode } from "../utils/language";

export const fetchJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const errorMessage = typeof payload === "object"
      ? payload?.error || payload?.message || "Request failed"
      : "Request failed";
    const error = new Error(errorMessage);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

export { API_BASE_URL };

/**
 * Translate post content to the user's main language using backend API.
 * @param {Object} params - Parameters for translation.
 * @param {string} params.text - The text to translate.
 * @param {string} [params.sourceLanguage] - The source content language.
 * 
 * @returns {Promise<object>} The translation payload.
 */
export async function translatePost({ text, sourceLanguage }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Your session expired. Please sign in again.");
  }

  return fetchJson("/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      text,
      sourceLanguage: normalizeLanguageCode(sourceLanguage) || undefined,
    }),
  });
}