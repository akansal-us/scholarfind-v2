# ScholarFind — Option B (Ready to deploy when needed)

## What this is
This is the Option B multi-page architecture — prepared and ready but NOT deployed.
Your live site continues to run from the current `index.html` in your main repo.

## When to switch to this
- When you want to add email reminders, essay helper, or application checklist
- When index.html gets too large to manage comfortably
- When you're ready — there's no rush

## What's included
- `index.html` — slimmed-down home page that loads data from JSON
- `pages/checklist.html` — application tracker (skeleton, ready to build out)
- `pages/calendar.html` — deadline calendar export (skeleton, ready to build out)
- `pages/quiz.html` — standalone eligibility quiz (skeleton, ready to build out)
- `data/scholarships.json` — ALL scholarship/internship/university data extracted from current site
- `netlify/functions/` — all secure backend functions
- `index-option-a-backup.html` — your current working site, safe backup

## How to deploy when ready
1. Create a new GitHub repo called `scholarfind-v2`
2. Upload all files from this folder
3. Connect to Netlify same as before
4. Add ANTHROPIC_API_KEY to Netlify environment variables
5. Your live site stays running on the old repo until you're ready to switch

## Cost
Still $0. Same free Netlify + GitHub setup.
