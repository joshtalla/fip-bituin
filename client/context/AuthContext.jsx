import { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

// Shared auth context so any component can read the current signed-in user.
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Stores the active Supabase user object, or null when nobody is signed in.
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check for an active session immediately when the app loads
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                await fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        };

        getInitialSession();

        // 2. Set up the listener to watch for future changes (Login/Logout)
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth Event:", event);

            if (session) {
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        // Cleanup: Stop listening if the component is destroyed
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // 3. Helper function to fetch your custom user profile from the users table
    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                throw error;
            }

            setUser(data);
        } catch (error) {
            console.error("Error fetching profile:", error.message);
        } finally {
            setLoading(false);
        }
    };

    // Provide the current user state to every component wrapped by this provider.
    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

