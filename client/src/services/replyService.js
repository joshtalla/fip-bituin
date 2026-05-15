import { fetchJson } from './api'
import { supabase } from './supabaseClient'

async function getAuthHeaders() {
    const {
        data: { session },
    } = await supabase.auth.getSession()

    const token = session?.access_token

    if (!token) {
        throw new Error('Your session expired. Please sign in again.')
    }

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getMyReplies(sort = 'desc') {
    const headers = await getAuthHeaders()

    return fetchJson(`/api/users/me/replies?sort=${sort}`, {
        headers,
    })
}