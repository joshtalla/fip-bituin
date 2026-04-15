import { supabase } from "./supabaseClient";

// Sign up a new user with EMAIL and PASSWORD
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    throw error;
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
};