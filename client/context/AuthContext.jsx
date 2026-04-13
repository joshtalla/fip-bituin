import { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

// Shared auth context so any component can read the current signed-in user.
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Stores the active Supabase user object, or null when nobody is signed in.
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Read the current session once when the app loads.
        const session = supabase.auth.session();
        setUser(session?.user ?? null);

        // Keep local state in sync with Supabase when auth status changes.
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        // Remove the listener when the provider unmounts to avoid leaks.
        return () => {
            authListener.unsubscribe();
        };
    }, []);

    // Provide the current user state to every component wrapped by this provider.
    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
}