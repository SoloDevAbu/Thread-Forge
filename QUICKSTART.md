# Quick Start Guide

Get your Content Transformation SaaS up and running in 5 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] OpenAI API key obtained

## Step 1: Install Dependencies (1 minute)

```bash
npm install
```

## Step 2: Set Up Environment Variables (1 minute)

Your `.env.local` file should already have Supabase credentials. Add your OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## Step 3: Set Up Database (2 minutes)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Open `scripts/migrate.ts` in this project
4. Copy all the SQL code (it's in the `migration` constant)
5. Paste into Supabase SQL Editor
6. Click **Run**

You should see "Success" messages for all operations.

## Step 4: Configure Authentication (1 minute)

In Supabase Dashboard:

1. Go to **Authentication > Providers**
2. Verify **Email** is enabled (should be by default)
3. Optionally enable **Google OAuth**:
   - Add your Google OAuth credentials
   - Set redirect URL: `http://localhost:3000/auth/callback`

## Step 5: Start the App (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Verify Everything Works

### Test 1: Sign Up

1. Click "Generate" button without being logged in
2. Sign up with email/password
3. You should be redirected to the main page

### Test 2: Generate Content

1. Paste some text in the content area
2. Select platforms (Twitter, LinkedIn, Reddit)
3. Choose tones for each platform
4. Click "Generate Viral Posts"
5. Wait for AI-generated content to appear

### Test 3: View History

1. Hover over the far-left edge of the screen
2. Sidebar should slide out showing your generation history
3. Click on a previous generation to view it again

## Common Issues

### "Unauthorized" Error

**Problem**: Can't generate content
**Solution**: Make sure you're signed in. Click "Generate" to open the auth dialog.

### "Failed to parse file" Error

**Problem**: File upload not working
**Solution**: PDF parsing requires additional setup. Use text input for now.

### Build Fails

**Problem**: TypeScript or build errors
**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Database Errors

**Problem**: "relation does not exist" errors
**Solution**: Run the migration SQL from `scripts/migrate.ts` in Supabase SQL Editor.

### OpenAI Errors

**Problem**: Generation fails or times out
**Solution**:
- Verify your OpenAI API key is valid
- Check you have credits available
- Try with shorter content

## Next Steps

Once everything is working:

1. **Customize Prompts**: Edit `/app/api/generate/route.ts` to adjust AI prompts
2. **Add More Platforms**: Extend the PLATFORMS constant in `/lib/constants.ts`
3. **Improve File Parsing**: Add better PDF parsing or support more formats
4. **Deploy**: Push to GitHub and deploy on Vercel

## Need Help?

- Check `README.md` for detailed documentation
- Review `DATABASE_SETUP.md` for database issues
- Check browser console for client-side errors
- Check terminal for server-side errors

## What You Built

You now have a fully functional SaaS application with:

- User authentication (email + Google OAuth)
- AI-powered content generation
- File upload support
- Multi-platform optimization
- Generation history
- Beautiful, responsive UI
- Production-ready code

Start transforming content into viral posts!
