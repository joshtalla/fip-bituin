const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        'Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_KEY, or provide compatible fallback values.'
    );
}

const supabase = createClient(
    supabaseUrl,
    supabaseKey
);

module.exports = supabase;
