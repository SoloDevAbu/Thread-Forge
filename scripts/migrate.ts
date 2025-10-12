import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const migration = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_content text NOT NULL,
  content_type text NOT NULL DEFAULT 'text',
  file_url text,
  file_name text,
  platforms text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS generations_user_id_idx ON generations(user_id);
CREATE INDEX IF NOT EXISTS generations_created_at_idx ON generations(created_at DESC);

DROP POLICY IF EXISTS "Users can read own generations" ON generations;
CREATE POLICY "Users can read own generations"
  ON generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own generations" ON generations;
CREATE POLICY "Users can insert own generations"
  ON generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own generations" ON generations;
CREATE POLICY "Users can update own generations"
  ON generations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own generations" ON generations;
CREATE POLICY "Users can delete own generations"
  ON generations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create generated_posts table
CREATE TABLE IF NOT EXISTS generated_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id uuid NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
  platform text NOT NULL,
  tone text NOT NULL,
  content text NOT NULL,
  hashtags text[] DEFAULT '{}',
  character_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE generated_posts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS generated_posts_generation_id_idx ON generated_posts(generation_id);

DROP POLICY IF EXISTS "Users can read own generated posts" ON generated_posts;
CREATE POLICY "Users can read own generated posts"
  ON generated_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM generations
      WHERE generations.id = generated_posts.generation_id
      AND generations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own generated posts" ON generated_posts;
CREATE POLICY "Users can insert own generated posts"
  ON generated_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM generations
      WHERE generations.id = generated_posts.generation_id
      AND generations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own generated posts" ON generated_posts;
CREATE POLICY "Users can update own generated posts"
  ON generated_posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM generations
      WHERE generations.id = generated_posts.generation_id
      AND generations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM generations
      WHERE generations.id = generated_posts.generation_id
      AND generations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own generated posts" ON generated_posts;
CREATE POLICY "Users can delete own generated posts"
  ON generated_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM generations
      WHERE generations.id = generated_posts.generation_id
      AND generations.user_id = auth.uid()
    )
  );

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  default_platforms text[] DEFAULT '{}',
  default_tones jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences(user_id);

DROP POLICY IF EXISTS "Users can read own preferences" ON user_preferences;
CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;
CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
`

console.log('Running migration...')
console.log('Note: This requires SERVICE_ROLE_KEY for DDL operations')
console.log('Migration SQL prepared but requires manual execution via Supabase Dashboard')
console.log('Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql')
