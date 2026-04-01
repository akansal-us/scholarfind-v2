// ============================================================
// email-signup.js — Netlify Function
// Handles email reminder signups from the Saved tab
// Sends a welcome email via Resend and notifies admin
// ============================================================

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { email, prefs } = JSON.parse(event.body || '{}');
  if (!email) return { statusCode: 400, body: 'Email required' };

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  if (!RESEND_API_KEY) return { statusCode: 500, body: 'Email service not configured' };

  const prefList = [
    prefs.deadlines && '7-day deadline reminders',
    prefs.digest && 'Monthly new scholarships digest',
    prefs.newScholarships && 'New scholarship alerts',
  ].filter(Boolean).join(', ') || 'General updates';

  try {
    // Send welcome email to user
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'ScholarFind <onboarding@resend.dev>',
        to: [email],
        subject: "You're signed up for ScholarFind reminders!",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#0d1b2a">
            <div style="background:#0d1b2a;padding:1.5rem;border-radius:12px 12px 0 0">
              <h1 style="color:#f5c842;font-size:1.5rem;margin:0">ScholarFind</h1>
              <p style="color:#94a3b8;margin:0.3rem 0 0;font-size:0.85rem">Chester County, PA</p>
            </div>
            <div style="background:#f8fafc;padding:1.5rem;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
              <h2 style="color:#0d1b2a">You're all set!</h2>
              <p>Thanks for signing up. You'll receive:</p>
              <ul style="color:#4a5568;line-height:2">
                ${prefs.deadlines ? '<li>⏰ Reminders 7 days before scholarship deadlines</li>' : ''}
                ${prefs.digest ? '<li>📋 A monthly digest of new scholarships</li>' : ''}
                ${prefs.newScholarships ? '<li>🔔 Alerts when new scholarships are added</li>' : ''}
              </ul>
              <p style="margin-top:1.5rem">
                <a href="https://phoenixville-scholars.netlify.app" style="background:#1a9e8f;color:white;padding:0.75rem 1.5rem;border-radius:50px;text-decoration:none;font-weight:600">Browse Scholarships →</a>
              </p>
              <p style="margin-top:1.5rem;font-size:0.78rem;color:#94a3b8">ScholarFind is a free community resource for Chester County students. No ads, no spam.</p>
            </div>
          </div>
        `
      })
    });

    // Notify admin of new signup
    if (ADMIN_EMAIL) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'ScholarFind <onboarding@resend.dev>',
          to: [ADMIN_EMAIL],
          subject: `New email signup: ${email}`,
          html: `
            <p><strong>New signup:</strong> ${email}</p>
            <p><strong>Preferences:</strong> ${prefList}</p>
            <p><strong>District:</strong> ${prefs.district || 'not selected'}</p>
            <p><strong>Saved items:</strong> ${prefs.savedItems?.length || 0} scholarships</p>
          `
        })
      });
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
