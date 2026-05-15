import { fetchJson } from "./api";
import { supabase } from "./supabaseClient";

const LIKED_POSTS_STORAGE_KEY = "bituin-liked-posts";

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

function readLikedPosts() {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const rawValue = window.localStorage.getItem(LIKED_POSTS_STORAGE_KEY);

    if (!rawValue) {
      return new Set();
    }

    const parsed = JSON.parse(rawValue);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function writeLikedPosts(postIds) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    LIKED_POSTS_STORAGE_KEY,
    JSON.stringify(Array.from(postIds)),
  );
}

function updateStoredLike(postId, liked) {
  const likedPosts = readLikedPosts();
  const normalizedPostId = String(postId);

  if (liked) {
    likedPosts.add(normalizedPostId);
  } else {
    likedPosts.delete(normalizedPostId);
  }

  writeLikedPosts(likedPosts);
}

export function isPostLiked(postId) {
  if (!postId) {
    return false;
  }

  return readLikedPosts().has(String(postId));
}

export async function likePost(postId) {
  const headers = await getAuthHeaders();
  const response = await fetchJson(`/api/posts/${postId}/like`, {
    method: "POST",
    headers,
  });

  updateStoredLike(postId, true);
  return response;
}

export async function unlikePost(postId) {
  const headers = await getAuthHeaders();
  const response = await fetchJson(`/api/posts/${postId}/like`, {
    method: "DELETE",
    headers,
  });

  updateStoredLike(postId, false);
  return response;
}