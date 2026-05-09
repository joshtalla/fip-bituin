const translationService = require('../services/translationService');
const supabase = require('../supabaseClient');

const translate = async (req, res) => {
    try {
        const { text, source } = req.body || {};

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'No auth token' });
        }

        const [scheme, token] = authHeader.split(' ');

        if (scheme !== 'Bearer' || !token) {
            return res.status(401).json({ error: 'Invalid authorization format' });
        }

        const { data: userData, error: authError } = await supabase.auth.getUser(token);

        if (authError || !userData || !userData.user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const auth_user_id = userData.user.id;

        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('language')
            .eq('id', auth_user_id)
            .single();

        if (profileError || !profile) {
            return res.status(400).json({ error: 'User profile not found' });
        }

        const target = profile.language;

        if (!target) {
            return res.status(400).json({ error: 'User preferred language not set' });
        }

        // Validate target against provider-supported languages
        let supported = [];

        try {
            supported = await translationService.getSupportedLanguages();
        } catch (err) {
            console.error('Failed to fetch supported languages', err);
        }

        const isSupported = supported.some((l) => {
            // LibreTranslate languages objects often have `code` and `name`.
            return l.code === target || l.language === target || l.name === target;
        });

        if (supported.length > 0 && !isSupported) {
            return res.status(400).json({ error: 'Target language not supported' });
        }

        // Detect source language if not provided
        let detected = source || null;

        try {
            if (!detected) {
                detected = await translationService.detectLanguage(text);
            }
        } catch (err) {
            console.warn('Language detection failed, continuing with auto');
        }

        if (detected && detected === target) {
            return res.json({
                original_text: text,
                translated_text: text,
                source_language: detected,
                target_language: target,
                no_op: true
            });
        }

        const data = await translationService.translateText(text, target, source || 'auto');

        // normalize translated text
        const translated_text = data && (data.translatedText || data.translated_text || data.result || data.translation || null);

        if (!translated_text) {
            return res.status(502).json({ error: 'Translation provider returned unexpected response' });
        }

        return res.json({ original_text: text, translated_text, source_language: detected, target_language: target });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { translate };
