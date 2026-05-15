import { useState, useEffect } from 'react';
import { AuthContext } from './auth-context';
import { ensureUserProfile } from '../services/authService';
import { supabase } from '../services/supabaseClient';

const AUTH_BOOTSTRAP_TIMEOUT_MS = 10000;

const withTimeout = async (promise, timeoutMs, label) => Promise.race([
    promise,
    new Promise((_, reject) => {
        window.setTimeout(() => {
            reject(new Error(`${label} timed out`));
        }, timeoutMs);
    }),
]);

/**
 * AuthContext
 * 
 * Provides user authentication state across the entire app. Each unique page doesn't need to check if the user is logged in.
 * Any component can read: 'user' (the logged-in user's profile, or null), and 'loading' (whether auth is still checking).
 * 
 * Usage: Wrap the <App /> with <AuthProvider>, then use useContext(AuthContext) in any child component.
 */

export const AuthProvider = ({ children }) => {
    // The logged-in user's profile from the database(it is null if the user is not logged/signed in).
    const [user, setUser] = useState(null);

    // Shows whether we're still checking for a saved login when user goes onto website for the first time in a while.
    // Prevents showing the login screen and then quickly switching to the home screen.
    const [loading, setLoading] = useState(true);

    // On page load, check if the user is already logged in.
    // Then listen for any login/logout changes while the page is open.
    useEffect(() => {
        let cancelled = false;

        const clearAuthState = () => {
            if (cancelled) {
                return;
            }

            setUser(null);
            setLoading(false);
        };

        // Check if there's a saved login from a previous session.
        const getInitialSession = async () => {
            try {
                const {
                    data: { session },
                    error,
                } = await withTimeout(
                    supabase.auth.getSession(),
                    AUTH_BOOTSTRAP_TIMEOUT_MS,
                    'Auth session restore',
                );

                if (error) {
                    throw error;
                }

                if (session) {
                    // User is logged in, fetch their profile from the database.
                    await withTimeout(
                        fetchProfile(session.user),
                        AUTH_BOOTSTRAP_TIMEOUT_MS,
                        'User profile restore',
                    );
                    return;
                }

                // No saved login. Stop loading and show the login screen.
                clearAuthState();
            } catch (error) {
                // A stale or corrupted persisted session should not block the app forever.
                console.error("Error restoring auth session:", error.message);
                clearAuthState();

                try {
                    await supabase.auth.signOut({ scope: "local" });
                } catch (signOutError) {
                    console.error("Error clearing local auth session:", signOutError.message);
                }
            }
        };

        getInitialSession();

        // Watch/listen for login/logout events (even if they happen in another browser tab).
        const handleAuthSession = async (session) => {
            try {
                if (session) {
                    await fetchProfile(session.user);
                    return;
                }

                clearAuthState();
            } catch (error) {
                console.error("Error handling auth state change:", error.message);
                clearAuthState();
            }
        };

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            // Examples: 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'
            console.log("Auth Event:", event);

            if (event === 'INITIAL_SESSION') {
                return;
            }

            // Avoid awaiting Supabase work inside the auth callback itself.
            window.setTimeout(() => {
                void handleAuthSession(session);
            }, 0);
        });

        // Stop watching for changes when the page closes.
        return () => {
            cancelled = true;
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Load the user's profile data from the Supabase database table called users.
    // Gets called after login to retrieve the full user data (username, avatar, etc.).
    const fetchProfile = async (sessionUser) => {
        try {
            // Ask the database for this user's profile.
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('auth_user_id', sessionUser.id)
                .maybeSingle();

            if (error) {
                throw error;
            }

            if (!data || !data.username) {
                const createdProfile = await ensureUserProfile({
                    authUserId: sessionUser.id,
                    email: sessionUser.email,
                    location: sessionUser.user_metadata?.country,
                    language: sessionUser.user_metadata?.language,
                    username: sessionUser.user_metadata?.username,
                });

                setUser({
                    ...createdProfile,
                    authUserId: sessionUser.id,
                    email: sessionUser.email,
                    isProfileIncomplete: false,
                });
            } else {
                // Save the profile so the app can access it.
                setUser({
                    ...data,
                    authUserId: sessionUser.id,
                    email: sessionUser.email,
                    isProfileIncomplete: false,
                });
            }
        } catch (error) {
            // The database query failed or the profile doesn't exist.
            console.error("Error fetching profile:", error.message);
            setUser({
                authUserId: sessionUser.id,
                email: sessionUser.email,
                isProfileIncomplete: true,
            });
        } finally {
            // Finish loading, whether it succeeded or failed.
            setLoading(false);
        }
    };

    // Share the user and loading state with all child components.
    return (
        <AuthContext.Provider value={{ user, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}