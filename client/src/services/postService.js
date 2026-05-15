import { fetchJson } from './api'
import { supabase } from './supabaseClient'

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const token = session?.access_token

  if (!token) {
    throw new Error('User is not authenticated')
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

export async function getMyPosts(page = 1, limit = 10) {
  const headers = await getAuthHeaders()
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  return fetchJson(`/api/posts/mine?${params}`, {
    method: 'GET',
    headers,
  })
}