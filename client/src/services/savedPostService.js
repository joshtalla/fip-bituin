import { fetchJson } from "./api";
import { supabase } from "./supabaseClient";

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (!token) {
    throw new Error("User is not authenticated");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getSavedPosts() {
  const headers = await getAuthHeaders();

  return fetchJson("/api/profile/saved-posts", {
    method: "GET",
    headers,
  });
}

export async function savePost(postId) {
  const headers = await getAuthHeaders();

  return fetchJson(`/api/posts/${postId}/save`, {
    method: "POST",
    headers,
  });
}

export async function unsavePost(postId) {
  const headers = await getAuthHeaders();

  return fetchJson(`/api/posts/${postId}/save`, {
    method: "DELETE",
    headers,
  });
}