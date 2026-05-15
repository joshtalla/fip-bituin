import { supabase } from './supabaseClient'

/**
 * profileService
 *
 * Thin wrapper around the Supabase users table for profile fields that the
 * authenticated user is allowed to edit on themselves. Mirrors the existing
 * authService.js pattern (client-side Supabase calls, no Express endpoint).
 *
 * The users table stores location in the `country` column (confirmed by the
 * authService.ensureUserProfile insert path and postService.resolveUserProfile
 * read path), and rows are keyed against Supabase Auth via `auth_user_id`.
 */

/**
 * The locations the team currently supports. Mirrors the dropdown options on
 * the Signup page so the two screens stay in lockstep. Exposed here so callers
 * can validate before round-tripping to Supabase and so the controlled list
 * has one well-named home.
 */
export const APPROVED_LOCATIONS = [
    'Australia',
    'Canada',
    'Philippines',
    'Saudi Arabia',
    'United States',
    'United Kingdom',
]

const resolveAuthUser = async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
        throw error
    }
    if (!data?.user) {
        throw new Error('Not authenticated')
    }
    return data.user
}

/**
 * Fetch the authenticated user's stored location (users.country).
 *
 * Returns null if the profile row exists but the country column is empty,
 * which lets the page treat "no current value" as a distinct UI state.
 *
 * @returns {Promise<string | null>}
 */
export const getCurrentLocation = async () => {
    const authUser = await resolveAuthUser()

    const { data, error } = await supabase
        .from('users')
        .select('country')
        .eq('auth_user_id', authUser.id)
        .maybeSingle()

    if (error) {
        throw error
    }

    return data?.country ?? null
}

/**
 * Persist a new location to users.country for the authenticated user.
 *
 * Validates that the value is a non-empty string drawn from the controlled
 * list. Returns the persisted value so the caller can update local state
 * without re-fetching.
 *
 * @param {string} country
 * @returns {Promise<string>} the value that was persisted
 */
export const updateLocation = async (country) => {
    const trimmed = typeof country === 'string' ? country.trim() : ''
    if (!trimmed) {
        throw new Error('Location is required')
    }
    if (!APPROVED_LOCATIONS.includes(trimmed)) {
        throw new Error('Please choose a location from the list')
    }

    const authUser = await resolveAuthUser()

    const { data, error } = await supabase
        .from('users')
        .update({ country: trimmed })
        .eq('auth_user_id', authUser.id)
        .select('country')
        .single()

    if (error) {
        throw error
    }

    return data.country
}
