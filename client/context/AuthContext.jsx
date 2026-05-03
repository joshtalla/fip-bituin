import { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * AuthContext
 * 
 * Provides user authentication state across the entire app. Each page doesn't need to check if the user is logged in.
 * Any component can read: 'user' (the logged-in user's profile, or null), and 'loading' (whether auth is still checking).
 * 
 * Usage: Wrap the <App /> with <AuthProvider>, then use useContext(AuthContext) in any child component.
 */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // The logged-in user's profile from the database(it is null if the user is not logged/signed in).
    const [user, setUser] = useState(null);

    // Shows whether we're still checking for a saved login when user goes onto website for the first time in a while.
    // Prevents showing the login screen and then quickly switching to the home screen.
    const [loading, setLoading] = useState(true);

    // On page load, check if the user is already logged in.
    // Then listen for any login/logout changes while the page is open.
    useEffect(() => {
        // Check if there's a saved login from a previous session.
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // User is logged in, fetch their profile from the database.
                await fetchProfile(session.user.id, session.user);
            } else {
                // No saved login. Stop loading and show the login screen.
                setLoading(false);
            }
        };

        getInitialSession();

        // Watch/listen for login/logout events (even if they happen in another browser tab).
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Examples: 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'
            console.log("Auth Event:", event);

            if (session) {
                // User logged in, fetch their profile.
                await fetchProfile(session.user.id, session.user);
            } else {
                // User logged out, clear the profile.
                setUser(null);
                setLoading(false);
            }
        });

        // Stop watching for changes when the page closes.
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Load the user's profile data from the Supabase database table called users.
    // Gets called after login to retrieve the full user data (username, avatar, etc.).
    const fetchProfile = async (userId, sessionUser) => {
        try {
            // Ask the database for this user's profile.
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code === 'PGRST116') {
                console.warn("Error fetching profile:", error.message);

                setUser({ 
                    id: userId, 
                    email: sessionUser.email, 
                    isProfileIncomplete: true });
            } else if (error) {
                throw error;
            } else {
                // Save the profile so the app can access it.
                setUser({...data, isProfileIncomplete: false});
            }
        } catch (error) {
            // The database query failed or the profile doesn't exist.
            console.error("Error fetching profile:", error.message);
        } finally {
            // Finish loading, whether it succeeded or failed.
            setLoading(false);
        }
    };

    // Share the user and loading state with all child components.
    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
