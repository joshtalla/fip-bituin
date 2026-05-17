const LIBRE_URL = process.env.LIBRETRANSLATE_URL || 'http://127.0.0.1:5000';
const API_KEY = process.env.LIBRETRANSLATE_API_KEY || '';


async function fetchJson(url, opts = {}) {
    /**
     * Performs an HTTP request to the given URL with the provided options,
     * and returns the parsed JSON response. Throws an error if the response
     * is not OK (status not in the 200-299 range).
     *
     * @param {string} url - The URL to send the request to.
     * @param {object} [opts={}] - Optional fetch options (method, headers, body, etc).
     * 
     * @returns {Promise<any>} - The parsed JSON response from the server.
     */
      try {
          const res = await fetch(url, opts);
          if (!res.ok) {
              const errorText = await res.text();

              if (res.status === 400 && errorText.includes('Visit https://portal.libretranslate.com to get an API key')) {
                  throw new Error(
                      'LibreTranslate rejected this request because the public hosted API requires a paid key. ' +
                      'Run the self-hosted instance at ' + LIBRE_URL + ' or set LIBRETRANSLATE_URL to your own deployment.'
                  );
              }

              throw new Error(`Fetch failed: ${res.status} ${res.statusText} - ${errorText}`);
          }

          return res.json();
      } catch (error) {
          if (error instanceof TypeError) {
              throw new Error(
                  'Unable to reach LibreTranslate at ' + LIBRE_URL + '. ' +
                  'Start the self-hosted service with "npm run translate" or set LIBRETRANSLATE_URL to a reachable instance.'
              );
          }

          throw error;
      }
}


async function getSupportedLanguages() {
    /**
     * Fetches the list of supported languages from the LibreTranslate API.
     * Returns an array of language objects, each with a code and name.
     * Throws an error if the API call fails.
     *
     * @returns {Promise<Array<{code: string, name: string}>>}
     */

    const url = `${LIBRE_URL}/languages`;

    // If an API key is set, include it in the request body (LibreTranslate supports this for some endpoints)
    const opts = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    // Fetch the supported languages from the LibreTranslate API using custom helper function
    return await fetchJson(url, opts);
}


async function detectLanguage(text) {
    /**
     * Detects the language of the given text using the LibreTranslate API.
     * Returns the detected language code (e.g., 'en', 'es', 'fr').
     * Throws an error if the API call fails or detection is not possible.
     *
     * @param {string} text - The text whose language should be detected.
     * 
     * @returns {Promise<string|null>} - The detected language code, or null if not detected.
     */
    
    const url = `${LIBRE_URL}/detect`;
    const body = { q: text };

    // Optionally include API key if set
    if (API_KEY) {
        body.api_key = API_KEY;
    }
    const opts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };

    // Call the LibreTranslate API to detect language
    const result = await fetchJson(url, opts);

    // LibreTranslate returns an array of detections [{language: 'xx', confidence: ...}]
    if (Array.isArray(result) && result.length > 0) {
        return result[0].language;
    }

    return null;
}


async function translateText(text, target, source = 'auto') {
  /**
   * Translates the given text from the source language to the target language using the LibreTranslate API.
   * Returns the translation result object from the API, which typically includes the translated text.
   * Throws an error if the API call fails.
   *
   * @param {string} text - The text to translate.
   * @param {string} target - The target language code (e.g., 'en', 'es').
   * @param {string} [source='auto'] - The source language code, or 'auto' to detect automatically.
   * 
   * @returns {Promise<Object>} - The translation result object from the API.
   */

    const url = `${LIBRE_URL}/translate`;
    const body = {
        q: text,
        source: source,
        target: target,
        format: 'text'
    };

    // Optionally include API key if set
    if (API_KEY) {
        body.api_key = API_KEY;
    }
    
    const opts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };
    
    // Call the LibreTranslate API to translate the text using custom helper function
    return await fetchJson(url, opts);
}

module.exports = { getSupportedLanguages, detectLanguage, translateText };
