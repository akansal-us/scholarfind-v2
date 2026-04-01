// ============================================================
// submit-scholarship.js — Netlify Function
// Accepts community scholarship submissions
// Stores in a simple JSON review queue (or Supabase when ready)
// ============================================================

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const submission = JSON.parse(event.body || '{}');
  const { title, amount, deadline, url, submitterEmail, district } = submission;

  if (!title || !url) return { statusCode: 400, body: 'Title and URL required' };

  // For now: send to a notification email so you can review manually
  // Later: store in Supabase submissions table
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'your@email.com';

  try {
    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'ScholarFind <submissions@scholarfind.org>',
          to: [ADMIN_EMAIL],
          subject: `New scholarship submission: ${title}`,
          html: `
            <h2>New Scholarship Submission</h2>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Amount:</strong> ${amount || 'Not specified'}</p>
            <p><strong>Deadline:</strong> ${deadline || 'Not specified'}</p>
            <p><strong>URL:</strong> <a href="${url}">${url}</a></p>
            <p><strong>District:</strong> ${district || 'Not specified'}</p>
            <p><strong>Submitted by:</strong> ${submitterEmail || 'Anonymous'}</p>
          `
        })
      });
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ received: true, message: 'Thank you! We will review and add it within 48 hours.' })
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
