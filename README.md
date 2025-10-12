# Content Transformation SaaS Platform

A production-ready SaaS application that transforms long-form content into viral, platform-optimized social media posts for Twitter/X, LinkedIn, and Reddit.

## Features

- **Multi-Format Input**: Support for text, PDFs, Excel files, CSV, and Google Sheets links
- **Platform-Specific Optimization**: Generates content tailored for Twitter/X, LinkedIn, and Reddit
- **Tone Customization**: Choose from Educational, Professional, Funny, Inspirational, Controversial, and Casual tones
- **AI-Powered Generation**: Uses OpenAI GPT-4 for intelligent content transformation
- **Auto-Generated Hashtags**: Creates relevant, trending hashtags for each platform
- **Generation History**: Searchable sidebar with complete generation history
- **Authentication**: Secure auth with Google OAuth and email/password via Supabase
- **Copy-to-Clipboard**: One-click copying of generated posts
- **Responsive Design**: Beautiful, modern UI that works on all devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **Authentication**: Supabase Auth (Google OAuth + Email/Password)
- **AI Integration**: Vercel AI SDK with OpenAI GPT-4
- **Database**: Supabase PostgreSQL with Row Level Security
- **Deployment**: Optimized for Vercel

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project
- OpenAI API key

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd project
npm install
```

### 2. Environment Variables

The project includes a `.env` file with Supabase credentials. You need to add your OpenAI API key:

```bash
# .env.local (create this file)
NEXT_PUBLIC_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
OPENAI_API_KEY=<your-openai-api-key>
```

### 3. Database Setup

The database schema needs to be applied to your Supabase project. You have two options:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to SQL Editor
3. Copy the contents from `scripts/migrate.ts` (the SQL migration)
4. Execute the SQL to create all tables, policies, and functions

#### Option B: Manual Table Creation

The schema includes:
- `profiles` - User profiles extending auth.users
- `generations` - Content generation requests
- `generated_posts` - Platform-specific generated posts
- `user_preferences` - User default settings

All tables have Row Level Security (RLS) enabled with appropriate policies.

### 4. Configure Supabase Authentication

1. In your Supabase Dashboard, go to Authentication > Providers
2. Enable Email provider (enabled by default)
3. Enable Google OAuth:
   - Add your Google OAuth credentials
   - Set redirect URL to: `http://localhost:3000/auth/callback` (development)
   - For production: `https://yourdomain.com/auth/callback`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
project/
├── app/
│   ├── api/
│   │   └── generate/          # Content generation API endpoint
│   ├── auth/
│   │   └── callback/          # OAuth callback handler
│   ├── page.tsx               # Main landing page
│   └── globals.css            # Global styles
├── components/
│   ├── auth-dialog.tsx        # Authentication modal
│   ├── content-input.tsx      # Content input form
│   ├── post-preview.tsx       # Generated post cards
│   └── history-sidebar.tsx    # Generation history sidebar
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser Supabase client
│   │   ├── server.ts          # Server Supabase client
│   │   └── middleware.ts      # Auth middleware
│   ├── types/
│   │   └── database.ts        # TypeScript types
│   ├── constants.ts           # App constants
│   └── file-parser.ts         # File processing utilities
└── scripts/
    └── migrate.ts             # Database migration SQL
```

## Key Features Explained

### Content Generation Flow

1. User inputs content or uploads a file
2. Selects target platforms (Twitter, LinkedIn, Reddit)
3. Chooses tone for each platform
4. Clicks "Generate Viral Posts"
5. AI generates platform-optimized content with hashtags
6. Results are saved to history and displayed in preview cards

### File Processing

Supports parsing of:
- PDF documents
- Excel spreadsheets (.xlsx, .xls)
- CSV files
- Direct text input

### Platform Optimization

Each platform has specific characteristics:
- **Twitter/X**: 280 character limit, concise and punchy
- **LinkedIn**: 3000 character limit, professional and insightful
- **Reddit**: 40000 character limit, conversational and authentic

### Security

- Row Level Security (RLS) on all database tables
- Users can only access their own data
- Secure authentication via Supabase
- Environment variables for sensitive keys

## Database Schema

See `scripts/migrate.ts` for the complete schema with detailed comments. Key tables:

- **profiles**: User information
- **generations**: Source content and metadata
- **generated_posts**: Platform-specific outputs
- **user_preferences**: User settings

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
4. Deploy

### Configure Supabase for Production

1. Update OAuth redirect URLs in Supabase dashboard
2. Add production domain to allowed URLs
3. Ensure RLS policies are properly configured

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck

# Lint code
npm run lint
```

## Environment Variables Reference

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (Required)
OPENAI_API_KEY=your_openai_api_key
```

## Troubleshooting

### Authentication Issues
- Verify Supabase URL and keys are correct
- Check OAuth redirect URLs match your domain
- Ensure email confirmation is disabled (or configured) in Supabase

### Generation Fails
- Verify OpenAI API key is valid and has credits
- Check browser console for specific error messages
- Ensure database tables are created with proper RLS policies

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors with `npm run typecheck`
- Verify all environment variables are set

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
