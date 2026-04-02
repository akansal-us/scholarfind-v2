// ============================================================
// search-scholarships.js — Netlify Function
// Searches the web for scholarships near a ZIP code
// Accepts known titles to avoid returning duplicates
// ============================================================

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { zip, knownTitles = [] } = JSON.parse(event.body || '{}');
  if (!zip) return { statusCode: 400, body: 'ZIP required' };

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return { statusCode: 500, body: 'API key not configured' };

  const knownList = knownTitles.length
    ? '\n\nWe already have these in our verified database — do NOT include them:\n' + knownTitles.slice(0,20).join(', ')
    : '';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: 'You find local scholarships for students. Search the web and return ONLY a valid JSON array of up to 8 results. Each object must have: title, amount, desc, eligibility, deadline, url, confidence (high/medium). Only include scholarships with real verifiable URLs. Prefer .org .edu .gov sources. No markdown, no backticks, just the raw JSON array starting with [',
        messages: [{
          role: 'user',
          content: 'Find real local scholarships for high school and college students near ZIP code ' + zip + ' for 2026. Search for local community foundations, hospitals, corporations, and civic organizations.' + knownList + '\n\nReturn JSON array only.'
        }]
      })
    });

    const data = await response.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    const clean = text.replace(/```json|```/g, '').trim();

    const firstBracket = clean.indexOf('[');
    const lastBracket = clean.lastIndexOf(']');
    let items = [];
    try {
      items = firstBracket !== -1 ? JSON.parse(clean.substring(firstBracket, lastBracket + 1)) : [];
    } catch(e) { items = []; }

    // Filter out items without URLs
    items = items.filter(s => s.url && s.title);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
