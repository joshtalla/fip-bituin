require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

const missingCredentialsMessage =
    'Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_KEY, or provide compatible fallback values.';

const createMissingCredentialsProxy = () => {
    const missingCredentialsError = () => new Error(missingCredentialsMessage);
    const handler = {
        get() {
            return new Proxy(function missingSupabaseMethod() {}, handler);
        },
        apply() {
            throw missingCredentialsError();
        },
    };

    return new Proxy(function missingSupabaseClient() {}, handler);
};

const supabase = !supabaseUrl || !supabaseKey
    ? (console.warn(`[supabase] ${missingCredentialsMessage}`), createMissingCredentialsProxy())
    : createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
