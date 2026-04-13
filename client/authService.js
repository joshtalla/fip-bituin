import { supabase } from "./supabaseClient";

// Sign up a new user with EMAIL and PASSWORD
export const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        throw error
    };

    if (data.user) {
        const {error: profileError} = await supabase.from('users').insert({
            id: data.user.id,
            username: username,
            email: email,
        });

        if (profileError) {
            throw profileError;
        }
    }

    return data;
};