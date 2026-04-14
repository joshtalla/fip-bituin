import { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

// Shared auth context so any component can read the current signed-in user.
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Stores the active Supabase user object, or null when nobody is signed in.
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Read the current session once when the app loads.
        const getIntialSession = async () => {
            const { data: session } = await supabase.auth.getSession();

            if(session) {
                await fetchUserProfile(session.user);
            } else {
                setLoading(false);
            }
        };

        getIntialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", event, session);

            if (session) {
                await fetchUserProfile(session.user.id);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

            return () => {
                authListener.subscription.unsubscribe();
            };
    }, []);

    const fetchUserProfile = async (userId) => {
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
            console.error("Error fetching user profile:", error);
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

