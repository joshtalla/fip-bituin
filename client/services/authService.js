import { supabase } from "./supabaseClient";

export const signUp = async (email, password, username) => {
    if (!email?.trim() || !password?.trim() || !username?.trim()) {
        throw new Error("All fields are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
    }

    if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) throw error;

    if (data.user) {
        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("id", data.user.id)
            .maybeSingle();

        if (!existingUser) {
            const { error: profileError } = await supabase.from("users").insert({
                id: data.user.id,
                username,
                email,
            });

            if (profileError) throw profileError;
        }
    }

    return data;
};

// Sign-in/log-in an existing user with EMAIL and PASSWORD
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        throw error;
    }

    return data;
}

// Logout the current user.
export const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Logout error:", error.message);
        throw error;
    }
}