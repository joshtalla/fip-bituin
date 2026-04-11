export const mockPrompt = {
  id: "1",
  prompt_text:
    "What's an unspoken rule you feel that Filipinos who were not raised from where you were have a hard time understanding? Explain it.",
  prompt_date: "2026-04-01",
  category: "culture",
};

export const mockPosts = Array.from({ length: 18 }, (_, i) => ({
  id: String(i + 1),
  content:
    "One unspoken rule is the concept of Pagmamano, where you take the back of an elder's hand and touch it to your forehead as a sign of respect.",
  anonymous_name: "SampaguitaBituin42",
  likes_count: Math.floor(Math.random() * 100),
}));
