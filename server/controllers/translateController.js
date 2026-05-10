
const translationService = require('../services/translationService');
const supabase = require('../supabaseClient');

/**
 * Translate endpoint controller
 * Handles translation requests for authenticated users.
 * - Validates input and authentication
 * - Looks up user's preferred language from Supabase
 * - Checks if translation is needed (avoids same-language translation)
 * - Only allows English and Tagalog to be translated
 * - Calls LibreTranslate API for translation
 * - Returns translated or original text with metadata
 *
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 */
const translate = async (req, res) => {
    try {
        const { text, source } = req.body || {};
        if (!text) return res.status(400).json({ error: 'Text is required for translation' });

        // Check that user is authenticated
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No auth token' });
        const [scheme, token] = authHeader.split(' ');
        if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Invalid authorization format' });

        // Ensure user is logged into Supabase
        const { data: userData, error: authError } = await supabase.auth.getUser(token);
        if (authError || !userData || !userData.user) return res.status(401).json({ error: 'Invalid token' });
        const userId = userData.user.id;

        // Look up user's preferred language from Supabase
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('language')
            .eq('id', userId)
            .single();
        if (profileError || !profile) return res.status(400).json({ error: 'User profile not found' });
        const target = profile.language;
        if (!target) return res.status(400).json({ error: 'User preferred language is not set' });

        // Only allow English and Tagalog
        const allowedLanguages = ['en', 'tl'];
        if (!allowedLanguages.includes(target)) {
            return res.status(400).json({ error: 'Translation is only available for English and Tagalog. Please set your language to English or Tagalog in your profile.' });
        }

        // Check if target language is supported
        let supported = [];
        try {
            supported = await translationService.getSupportedLanguages();
        } catch (err) {
            console.error('Failed to fetch supported languages', err);
        }
        const isSupported = supported.some(l => l.code === target || l.language === target || l.name === target);
        if (supported.length > 0 && !isSupported) {
            return res.status(400).json({ error: 'Target language not supported' });
        }

        // Detect source language if not provided
        let detected = source || null;
        try {
            if (!detected) detected = await translationService.detectLanguage(text);
        } catch (err) {
            console.warn('Language detection failed, continuing with auto');
        }
        if (detected && !allowedLanguages.includes(detected)) {
            return res.status(400).json({ error: 'Only English and Tagalog text can be translated at this time.' });
        }
        if (detected && detected === target) {
            return res.json({
                original_text: text,
                translated_text: text,
                source_language: detected,
                target_language: target,
                no_op: true,
                message: 'This post is already in your preferred language.'
            });
        }

        // Translate the text(Main functionality)
        const data = await translationService.translateText(text, target, source || 'auto');
        const translated_text = data && (data.translatedText || data.translated_text || data.result || data.translation || null);
        if (!translated_text) {
            return res.status(502).json({ error: 'Sorry, something went wrong with the translation service.' });
        }
        return res.json({
            original_text: text,
            translated_text,
            source_language: detected,
            target_language: target,
            message: 'Translation successful.'
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { translate };
