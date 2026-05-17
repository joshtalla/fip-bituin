export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "tl", label: "Tagalog" },
];

const LANGUAGE_LABEL_BY_CODE = new Map(
  LANGUAGE_OPTIONS.map((option) => [option.value, option.label]),
);

const LANGUAGE_ALIAS_TO_CODE = new Map([
  ["en", "en"],
  ["english", "en"],
  ["fr", "fr"],
  ["french", "fr"],
  ["fil", "tl"],
  ["filipino", "tl"],
  ["tl", "tl"],
  ["tagalog", "tl"],
  ["ceb", "ceb"],
  ["cebuano", "ceb"],
  ["ilo", "ilo"],
  ["ilocano", "ilo"],
  ["pam", "pam"],
  ["kapampangan", "pam"],
  ["war", "war"],
  ["waray", "war"],
]);

export function normalizeLanguageCode(language) {
  if (typeof language !== "string") {
    return "";
  }

  return LANGUAGE_ALIAS_TO_CODE.get(language.trim().toLowerCase()) || "";
}

export function getLanguageLabel(language) {
  const normalizedCode = normalizeLanguageCode(language);

  if (normalizedCode && LANGUAGE_LABEL_BY_CODE.has(normalizedCode)) {
    return LANGUAGE_LABEL_BY_CODE.get(normalizedCode);
  }

  return typeof language === "string" ? language.trim() : "";
}