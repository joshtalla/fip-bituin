import { supabase } from "./supabaseClient";
import { normalizeLanguageCode } from "../utils/language";

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
  const normalizedLanguage = normalizeLanguageCode(language);

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
    const existingLanguageCode = normalizeLanguageCode(existingProfile.language);

    if (!existingProfile.username) {
      updates.username = resolvedUsername;
    }
    if (location && !existingProfile.country) {
      updates.country = location;
    }
    if (existingLanguageCode && existingLanguageCode !== existingProfile.language) {
      updates.language = existingLanguageCode;
    } else if (normalizedLanguage && !existingLanguageCode) {
      updates.language = normalizedLanguage;
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
      language: normalizedLanguage || null,
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
  const normalizedLanguage = normalizeLanguageCode(language);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        country: location,
        language: normalizedLanguage || null,
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
      language: normalizedLanguage,
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

export const updateUserLanguage = async ({ authUserId, language }) => {
  if (!authUserId) {
    throw new Error("Authenticated user is required");
  }

  const normalizedLanguage = normalizeLanguageCode(language);

  if (!normalizedLanguage) {
    throw new Error("Choose a valid language");
  }

  const { data, error } = await supabase
    .from("users")
    .update({ language: normalizedLanguage })
    .eq("auth_user_id", authUserId)
    .select("id, username, country, language, auth_user_id")
    .single();

  if (error) {
    throw error;
  }

  return data;
};
