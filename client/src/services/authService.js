import { supabase } from "./supabaseClient";

const FILIPINO_AMERICAN_PREFIXES = [
  "Manila",
  "Mabuhay",
  "Harana",
  "Sampaguita",
  "Jeepney",
  "Bituin",
  "Tagpuan",
  "Barkada",
  "HaloHalo",
  "Kundiman",
];

const FILIPINO_AMERICAN_SUFFIXES = [
  "Dreamer",
  "Voyager",
  "Storyteller",
  "Sunrise",
  "Bridge",
  "Rhythm",
  "Lantern",
  "Skylark",
  "Trail",
  "Wave",
];

const pickRandom = (values) => values[Math.floor(Math.random() * values.length)];

const buildUsername = (username) => {
  if (username?.trim()) {
    return username.trim();
  }

  const prefix = pickRandom(FILIPINO_AMERICAN_PREFIXES);
  const suffix = pickRandom(FILIPINO_AMERICAN_SUFFIXES);
  return `${prefix}${suffix}${Math.floor(1000 + Math.random() * 9000)}`;
};

export const ensureUserProfile = async ({ authUserId, location, language, username }) => {
  const resolvedUsername = buildUsername(username);

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
  const username = buildUsername();
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
