const LIBRE_URL = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com';
const API_KEY = process.env.LIBRETRANSLATE_API_KEY || '';

async function fetchJson(url, opts = {}) {

}

async function getSupportedLanguages() {

}

async function detectLanguage(text) {

}

async function translateText(text, target, source = 'auto') {

}

module.exports = { getSupportedLanguages, detectLanguage, translateText };
