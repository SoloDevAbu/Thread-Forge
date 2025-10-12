# Database Setup Guide

This guide will help you set up the Supabase database for the Content Transformation SaaS platform.

## Quick Setup

The easiest way to set up your database is through the Supabase Dashboard:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy and paste the SQL migration from `scripts/migrate.ts`
6. Click **Run** to execute

## What Gets Created

### Tables

1. **profiles**
   - Extends Supabase auth.users
   - Stores user profile information
   - Automatically populated when users sign up

2. **generations**
   - Stores original content and metadata
   - Links to user who created it
   - Tracks file uploads and content types

3. **generated_posts**
   - Platform-specific generated content
   - Linked to parent generation
   - Includes hashtags and character counts

4. **user_preferences**
   - User's default platform and tone selections
   - One record per user

### Security Features

All tables have **Row Level Security (RLS)** enabled with policies that ensure:

- Users can only read their own data
- Users can only create records for themselves
- Users can only update/delete their own records
- Authentication is required for all operations

### Functions & Triggers

**handle_new_user()**
- Automatically creates a profile when a user signs up
- Triggered on INSERT to auth.users table
- Copies email and metadata to profiles table

## Verification

After running the migration, verify your setup:

### Check Tables

Run this query in SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- generated_posts
- generations
- profiles
- user_preferences

### Check RLS Policies

Run this query:

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Each table should have policies for SELECT, INSERT, UPDATE, and (where appropriate) DELETE.

### Test Authentication Flow

1. Sign up a new user in your application
2. Check the profiles table - a new record should appear automatically
3. Try creating a generation - it should be saved to the database

## Troubleshooting

### Migration Fails with "relation already exists"

If tables already exist, you can either:

**Option 1: Drop and recreate** (WARNING: Deletes all data)

```sql
DROP TABLE IF EXISTS generated_posts CASCADE;
DROP TABLE IF EXISTS generations CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
```

Then run the migration again.

**Option 2: Skip table creation**

Comment out the CREATE TABLE statements for existing tables and only run the policy creation parts.

### RLS Policy Errors

If you get "new row violates row-level security policy" errors:

1. Check that you're authenticated (user session exists)
2. Verify the policy conditions match your use case
3. Check that foreign key relationships are correct

### Trigger Not Working

If profiles aren't being created automatically:

1. Verify the trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

2. Check function exists:
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

3. Try creating a user and check for errors in Supabase logs

## Manual Testing

After setup, you can manually test the database:

### Insert Test Profile

```sql
-- Get your user ID from auth.users
SELECT id, email FROM auth.users;

-- Insert test data (replace with your user ID)
INSERT INTO generations (user_id, original_content, content_type, platforms)
VALUES ('your-user-id-here', 'Test content', 'text', ARRAY['twitter']);

-- Verify it was created
SELECT * FROM generations WHERE user_id = 'your-user-id-here';
```

### Test RLS Policies

```sql
-- This should work (returns your own data)
SELECT * FROM profiles WHERE id = auth.uid();

-- This should return empty (can't see other users' data)
SELECT * FROM profiles WHERE id != auth.uid();
```

## Database Schema Diagram

```
auth.users (Supabase managed)
    |
    | (trigger: on_auth_user_created)
    v
profiles
    |
    +-- generations
    |       |
    |       +-- generated_posts
    |
    +-- user_preferences
```

## Next Steps

After setting up the database:

1. Configure authentication providers in Supabase dashboard
2. Add your OpenAI API key to environment variables
3. Test the complete flow: signup → generate content → view history

## Support

If you encounter issues:

1. Check Supabase logs in Dashboard > Logs
2. Verify all environment variables are set correctly
3. Ensure you're using the correct Supabase project
4. Review RLS policies for your specific use case

For more help, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
