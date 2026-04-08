import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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

  // Build message history for context (last 10 messages)
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

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  // Parse JSON response
  try {
    // Strip markdown code blocks if present
    let text = content.text.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    return JSON.parse(text);
  } catch (e) {
    // Fallback: treat full response as message
    console.error('Failed to parse Claude JSON response:', e.message);
    return {
      message: content.text,
      scryfallQuery: null,
      action: 'answer',
      suggestedQuantity: null,
      suggestedQuantityReasoning: null,
    };
  }
}
