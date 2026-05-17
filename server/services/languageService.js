const LANGUAGE_ALIAS_TO_CODE = new Map([
  ['en', 'en'],
  ['english', 'en'],
  ['fr', 'fr'],
  ['french', 'fr'],
  ['fil', 'tl'],
  ['filipino', 'tl'],
  ['tl', 'tl'],
  ['tagalog', 'tl'],
  ['ceb', 'ceb'],
  ['cebuano', 'ceb'],
  ['ilo', 'ilo'],
  ['ilocano', 'ilo'],
  ['pam', 'pam'],
  ['kapampangan', 'pam'],
  ['war', 'war'],
  ['waray', 'war'],
]);

const normalizeLanguageCode = (language) => {
  if (typeof language !== 'string') {
    return '';
  }

  return LANGUAGE_ALIAS_TO_CODE.get(language.trim().toLowerCase()) || '';
};

module.exports = { normalizeLanguageCode };