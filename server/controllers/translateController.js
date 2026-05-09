const translationService = require('../services/translationService');
const supabase = require('../supabaseClient');

const translate = async (req, res) => {
    try {
        const { text, source } = req.body || {};

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // For minimal version, it uses a hardcoded target = English for the language
        const target = 'en';

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
