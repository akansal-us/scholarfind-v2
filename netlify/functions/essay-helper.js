// ============================================================
// essay-helper.js — Netlify Function
// Suggests essay angles for a specific scholarship
// Called from: pages/checklist.html
// ============================================================

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { scholarshipTitle, scholarshipDesc, studentInterests } = JSON.parse(event.body || '{}');
  if (!scholarshipTitle) return { statusCode: 400, body: 'Scholarship title required' };

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return { statusCode: 500, body: 'API key not configured' };

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
        max_tokens: 800,
        system: 'You help high school students write scholarship essays. Give 3 specific essay angle suggestions tailored to the scholarship. Each suggestion should be 2-3 sentences. Return as JSON array: [{angle, description, openingLine}]',
        messages: [{
          role: 'user',
          content: `Scholarship: ${scholarshipTitle}\nDescription: ${scholarshipDesc}\nStudent interests: ${studentInterests || 'not specified'}\n\nSuggest 3 essay angles.`
        }]
      })
    });

    const data = await response.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    const clean = text.replace(/```json|```/g, '').trim();
    let suggestions = [];
    try { suggestions = JSON.parse(clean); } catch(e) { suggestions = []; }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suggestions })
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
