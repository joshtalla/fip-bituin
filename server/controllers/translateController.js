const translationService = require('../services/translationService');
const supabase = require('../supabaseClient');


/**
 * Translate endpoint controller
 * Handles translation requests for authenticated users.
 * - Validates input and authentication
 * - Looks up user's preferred language from Supabase
 * - Checks if translation is needed (avoids same-language translation)
 * - Calls LibreTranslate API for translation
 * - Returns translated or original text with metadata
 *
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 */
const translate = async (req, res) => {
    try {
        // Extract text to translate and optional source language from request body
        const { text, source } = req.body || {};

        // Check if text is provided in the request
        if (!text) {
            // If not, return a 400 Bad Request error
            return res.status(400).json({ error: 'Text is required' });
        }

        // Get the Authorization header from the request
        const authHeader = req.headers.authorization;

        // Check if the Authorization header is present
        if (!authHeader) {
            // If not, return a 401 Unauthorized error
            return res.status(401).json({ error: 'No auth token' });
        }

        // Split the Authorization header into scheme and token
        const [scheme, token] = authHeader.split(' ');

        // Check if the scheme is 'Bearer' and token exists
        if (scheme !== 'Bearer' || !token) {
            // If not, return a 401 Unauthorized error
            return res.status(401).json({ error: 'Invalid authorization format' });
        }

        // Use Supabase to validate the user's token and get user data
        const { data: userData, error: authError } = await supabase.auth.getUser(token);

        // Check if user is authenticated and user data is valid
        if (authError || !userData || !userData.user) {
            // If not, return a 401 Unauthorized error
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get the authenticated user's ID
        const auth_user_id = userData.user.id;

        // Query Supabase for the user's profile and preferred language
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('language')
            .eq('id', auth_user_id)
            .single();

        // Check if the user's profile was found and contains a language
        if (profileError || !profile) {
            // If not, return a 400 Bad Request error
            return res.status(400).json({ error: 'User profile not found' });
        }

        // Get the user's preferred language
        const target = profile.language;

        // Check if the preferred language is set
        if (!target) {
            // If not, return a 400 Bad Request error
            return res.status(400).json({ error: 'User preferred language not set' });
        }

        // Validate that the target language is supported by the translation provider
        let supported = [];

        try {
            // Fetch supported languages from LibreTranslate
            supported = await translationService.getSupportedLanguages();
        } catch (err) {
            // Log error but continue (may result in later error if unsupported)
            console.error('Failed to fetch supported languages', err);
        }

        // Check if the user's preferred language is in the supported list
        const isSupported = supported.some((l) => {
            // LibreTranslate languages objects often have `code` and `name`.
            return l.code === target || l.language === target || l.name === target;
        });

        if (supported.length > 0 && !isSupported) {
            // If not supported, return a 400 Bad Request error
            return res.status(400).json({ error: 'Target language not supported' });
        }

        // Detect the source language if not provided
        let detected = source || null;

        try {
            // If source language is not provided, use LibreTranslate to detect it
            if (!detected) {
                detected = await translationService.detectLanguage(text);
            }
        } catch (err) {
            // If detection fails, log a warning and continue with 'auto'
            console.warn('Language detection failed, continuing with auto');
        }

        // If the detected source language matches the target, skip translation
        if (detected && detected === target) {
            // Return the original text and indicate no translation was needed
            return res.json({
                original_text: text,
                translated_text: text,
                source_language: detected,
                target_language: target,
                no_op: true
            });
        }

        // Call the translation service to translate the text
        const data = await translationService.translateText(text, target, source || 'auto');

        // Normalize the translated text from the provider's response
        const translated_text = data && (data.translatedText || data.translated_text || data.result || data.translation || null);

        // Check if translation was successful
        if (!translated_text) {
            // If not, return a 502 Bad Gateway error
            return res.status(502).json({ error: 'Translation provider returned unexpected response' });
        }

        // Return the translated text and metadata
        return res.json({ original_text: text, translated_text, source_language: detected, target_language: target });
    } catch (err) {
        // Catch any unexpected errors and return a 500 Internal Server Error
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { translate };
