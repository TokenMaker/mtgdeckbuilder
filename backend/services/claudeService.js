import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT_TEMPLATE = `You are an expert Magic: The Gathering deck building collaborator.
You help users find cards, build complete decks, analyze strategies, and improve their decks.

ALWAYS respond in valid JSON with exactly this structure:
{
  "message": "Your conversational response — explain what you built, found, or recommend",
  "action": "search | build_deck | analyze | answer",
  "scryfallQuery": "a single scryfall query string, or null",
  "deckList": null or an array of objects like: [{ "name": "Lightning Bolt", "quantity": 4 }, ...]
}

WHEN TO USE deckList:
- User asks to build a deck, generate a deck list, or create a deck
- User asks "give me a deck", "build me a deck", "make a commander deck", etc.
- User asks for a full list of cards for any archetype
- Set action to "build_deck" when returning a deckList

WHEN TO USE scryfallQuery:
- User asks to search for or show specific cards
- Use null when returning a deckList (the cards will be fetched by name)
- Set action to "search" when returning a scryfallQuery

DECK LIST RULES:
- CRITICAL: Only suggest cards that are LEGAL in {{FORMAT}}. Do not include banned or not-legal cards.
- For Commander: provide exactly 99 cards (commander is separate). Include card name and quantity (all 1x for singleton).
- For 60-card formats: provide exactly 60 cards total with appropriate quantities.
- Always include lands (roughly 24 for 60-card, 36-38 for Commander).
- Group logically: creatures, spells, ramp, draw, removal, lands.
- Use real, legal Magic card names only. Verify legality before including.
- Tailor the deck to the format and color identity specified.

SCRYFALL SYNTAX (for scryfallQuery):
- Format: format:modern, format:commander, format:standard
- Color: c:r, c:ub, c:wubg
- Type: t:creature, t:instant, t:land
- CMC: cmc<=2, cmc=3
- Oracle: o:"draw a card", o:"destroy target"
- Combine: t:creature c:g cmc<=3 format:modern
- ALWAYS include format filter in scryfallQuery to match current format

FORMAT LOCK — Current format: {{FORMAT}}
- Only suggest cards with legality status "legal" in {{FORMAT}}
- For Standard: Only cards from the last 2-3 years of sets
- For Modern: Sets from 2003 (8th Edition) onwards, non-banned
- For Pioneer: Sets from Return to Ravnica (2012) onwards, non-banned
- For Commander: Any card legal in Commander, respect commander's color identity
- For Pauper: Commons only
- For Legacy/Vintage: Nearly anything, but respect ban/restriction list

META CONTEXT for {{FORMAT}}:
{{META_CONTEXT}}

Current deck: {{DECK_SUMMARY}}

DECK ARCHETYPES DETECTED:
{{ARCHETYPE_HINTS}}

Be enthusiastic, knowledgeable, and specific. When you build a deck, briefly explain the strategy.
For deck lists, name real cards — no placeholder names. Always double-check format legality.`;

const META_CONTEXT = {
  Standard: 'Top Standard archetypes: Domain Ramp, Esper Midrange, Azorius Soldiers, Mono-Red Aggro, Grixis Midrange.',
  Modern: 'Top Modern archetypes: Murktide Regent (UR Tempo), Amulet Titan, Hammer Time (Affinity), Living End, Scam (BR Midrange), Yawgmoth Combo.',
  Pioneer: 'Top Pioneer archetypes: Rakdos Midrange, Lotus Field Combo, Mono-Green Devotion, Amalia Combo, Azorius Spirits.',
  Legacy: 'Top Legacy archetypes: UR Delver, Reanimator, Death & Taxes, Lands, Storm, Initiative.',
  Vintage: 'Top Vintage archetypes: Blue Tinker, Paradoxical Outcome, Doomsday, Jeskai Control.',
  Commander: 'Popular Commander strategies: Atraxa Superfriends, Krenko Goblins, Rhystic Study Control, Kenrith Combo, Zur Enchantments.',
  Pauper: 'Top Pauper archetypes: Faeries (UB), Mono-Red Burn, Affinity, Tron, Golgari Gardens.',
};

function getArchetypeHints(deckSummary) {
  const lower = (deckSummary || '').toLowerCase();
  const hints = [];

  if (lower.includes('lightning bolt') || lower.includes('goblin') || lower.includes('mono-red')) {
    hints.push('Aggro/Burn elements detected');
  }
  if (lower.includes('brainstorm') || lower.includes('counterspell') || lower.includes('force of will')) {
    hints.push('Blue Control/Tempo elements detected');
  }
  if (lower.includes('sol ring') || lower.includes('ramp') || lower.includes('cultivate')) {
    hints.push('Ramp strategy detected');
  }
  if (lower.includes('tutor') || lower.includes('combo')) {
    hints.push('Combo elements detected');
  }
  if (lower.includes('commander') || lower.includes('legendary')) {
    hints.push('Commander-focused build detected');
  }

  return hints.length > 0 ? hints.join(', ') : 'No specific archetype detected yet';
}

export async function getChatResponse({ message, format, deckSummary, history = [] }) {
  const metaContext = META_CONTEXT[format] || META_CONTEXT.Standard;
  const archetypeHints = getArchetypeHints(deckSummary);

  const systemPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace(/{{FORMAT}}/g, format || 'Standard')
    .replace('{{META_CONTEXT}}', metaContext)
    .replace('{{DECK_SUMMARY}}', deckSummary || 'Empty deck')
    .replace('{{ARCHETYPE_HINTS}}', archetypeHints);

  const recentHistory = history.slice(-10);
  const messages = [
    ...recentHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: message },
  ];

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 4096,
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
      deckList: null,
    };
  }
}
