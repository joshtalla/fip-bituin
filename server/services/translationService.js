const LIBRE_URL = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com';
const API_KEY = process.env.LIBRETRANSLATE_API_KEY || '';

async function fetchJson(url, opts = {}) {
  /**
   * Performs an HTTP request to the given URL with the provided options,
   * and returns the parsed JSON response. Throws an error if the response
   * is not OK (status not in the 200-299 range).
   */
    const res = await fetch(url, opts);
    if (!res.ok) {
        // If the response is not successful, throw an error with status code, status text, and error text
        const errorText = await res.text();
        throw new Error(`Fetch failed: ${res.status} ${res.statusText} - ${errorText}`);
    }
    return res.json();
}

async function getSupportedLanguages() {

}

async function detectLanguage(text) {

}

async function translateText(text, target, source = 'auto') {

}

module.exports = { getSupportedLanguages, detectLanguage, translateText };
