import { supabase } from "./supabaseClient";

const buildUsername = (email, username) => {
  if (username?.trim()) {
    return username.trim();
  }

  const emailPrefix = email.split("@")[0]?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const base = emailPrefix?.slice(0, 12) || "bituin";
  return `${base}${Math.floor(1000 + Math.random() * 9000)}`;
};

export const ensureUserProfile = async ({ authUserId, email, location, language, username }) => {
  const resolvedUsername = buildUsername(email, username);

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (existingProfileError) {
    throw existingProfileError;
  }

  if (existingProfile) {
    const updates = {};

    if (!existingProfile.username) {
      updates.username = resolvedUsername;
    }
    if (location && !existingProfile.country) {
      updates.country = location;
    }
    if (language && !existingProfile.language) {
      updates.language = language;
    }

    if (Object.keys(updates).length === 0) {
      return existingProfile;
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", existingProfile.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return updatedProfile;
  }

  const { data: createdProfile, error: createError } = await supabase
    .from("users")
    .insert({
      auth_user_id: authUserId,
      username: resolvedUsername,
      country: location || null,
      language: language || null,
    })
    .select()
    .single();

  if (createError) {
    throw createError;
  }

  return createdProfile;
};

export const signUp = async ({ email, password, location, language }) => {
  const username = buildUsername(email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        country: location,
        language,
        username,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (data.user && data.session) {
    await ensureUserProfile({
      authUserId: data.user.id,
      email,
      location,
      language,
      username,
    });
  }

  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};
