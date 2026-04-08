import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT_TEMPLATE = `You are an expert Magic: The Gathering deck building assistant.
ALWAYS respond in valid JSON with exactly this structure:
{
  "message": "Your conversational response here",
  "scryfallQuery": "valid scryfall search query or null",
  "action": "search | analyze | answer | suggest_quantity",
  "suggestedQuantity": null,
  "suggestedQuantityReasoning": null
}

Scryfall syntax examples:
- Format filter: format:modern, format:commander, format:standard
- Color filter: c:r (red), c:u (blue), c:wub (white/blue/black)
- Type filter: t:creature, t:instant, t:planeswalker
- CMC filter: cmc<=2, cmc=3
- Oracle text: o:"draw a card", o:"enters the battlefield"
- Rarity: r:rare, r:common
- Power/toughness: pow>=4, tou>=4
- Combine: t:creature c:g cmc<=3 format:modern

Current format: {{FORMAT}}
Current deck: {{DECK_SUMMARY}}
User tier: {{TIER}}

Guidelines:
- For card searches, provide a specific scryfallQuery that will find relevant cards
- For deck analysis, examine the deck summary and provide strategic advice
- For premium users: proactively analyze after each card add and suggest improvements
- For free users: focus on the specific question asked
- Always be helpful, specific, and knowledgeable about MTG strategy
- When suggesting cards, explain WHY they fit the deck/format
- Keep responses concise but informative`;

export async function getChatResponse({ message, format, deckSummary, tier = 'free', history = [] }) {
  const systemPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace('{{FORMAT}}', format || 'Standard')
    .replace('{{DECK_SUMMARY}}', deckSummary || 'Empty deck')
    .replace('{{TIER}}', tier);

  const recentHistory = history.slice(-10);
  const messages = [
    ...recentHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    {
      role: 'user',
      content: message,
    },
  ];

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1024,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from OpenAI');

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse OpenAI JSON response:', e.message);
    return {
      message: content,
      scryfallQuery: null,
      action: 'answer',
      suggestedQuantity: null,
      suggestedQuantityReasoning: null,
    };
  }
}
