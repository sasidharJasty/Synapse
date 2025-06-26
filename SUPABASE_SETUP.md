# Supabase Setup Guide for Synapse

This guide will help you set up Supabase for the Synapse AI Academic Assistant app.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `synapse-app` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (this may take a few minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## 3. Set Up Environment Variables

1. Create a `.env` file in your project root
2. Add the following variables:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 4. Database Schema Setup

Run the following SQL commands in your Supabase SQL Editor:

### Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
```

### Create Profiles Table

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  subjects TEXT[],
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Create Tasks Table

```sql
-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  estimated_duration INTEGER, -- in minutes
  due_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

### Create Mood Entries Table

```sql
-- Create mood_entries table
CREATE TABLE mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10) NOT NULL,
  mood_label TEXT CHECK (mood_label IN ('excellent', 'good', 'neutral', 'bad', 'terrible')) NOT NULL,
  notes TEXT,
  activities TEXT[],
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own mood entries" ON mood_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries" ON mood_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries" ON mood_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries" ON mood_entries
  FOR DELETE USING (auth.uid() = user_id);
```

### Create Goals Table

```sql
-- Create goals table
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  target_date TIMESTAMP WITH TIME ZONE,
  progress INTEGER CHECK (progress >= 0 AND progress <= 100) DEFAULT 0,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused')) DEFAULT 'not_started',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);
```

### Create Flashcards Table

```sql
-- Create flashcards table
CREATE TABLE flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  subject TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE,
  review_count INTEGER DEFAULT 0,
  mastery_level INTEGER CHECK (mastery_level >= 0 AND mastery_level <= 5) DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own flashcards" ON flashcards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcards" ON flashcards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcards" ON flashcards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flashcards" ON flashcards
  FOR DELETE USING (auth.uid() = user_id);
```

### Create Study Sessions Table

```sql
-- Create study_sessions table
CREATE TABLE study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT,
  duration INTEGER NOT NULL, -- in minutes
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  focus_score INTEGER CHECK (focus_score >= 1 AND focus_score <= 10),
  productivity_score INTEGER CHECK (productivity_score >= 1 AND productivity_score <= 10),
  notes TEXT,
  activities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own study sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions" ON study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study sessions" ON study_sessions
  FOR DELETE USING (auth.uid() = user_id);
```

### Create Peer Matches Table

```sql
-- Create peer_matches table
CREATE TABLE peer_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  peer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
  study_preferences TEXT,
  availability TEXT,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, peer_user_id, subject)
);

-- Enable RLS
ALTER TABLE peer_matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own peer matches" ON peer_matches
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = peer_user_id);

CREATE POLICY "Users can insert own peer matches" ON peer_matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own peer matches" ON peer_matches
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = peer_user_id);

CREATE POLICY "Users can delete own peer matches" ON peer_matches
  FOR DELETE USING (auth.uid() = user_id);
```

## 5. Set Up Authentication

### Configure Email Auth

1. Go to **Authentication** → **Settings**
2. Configure email templates if desired
3. Set up email confirmation settings

### Configure Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Enable Google provider
3. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. Add authorized redirect URLs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback` (for development)

## 6. Set Up Storage (Optional)

If you want to store user uploads (like lecture notes, images):

1. Go to **Storage** → **Buckets**
2. Create a new bucket called `user-uploads`
3. Set it to private
4. Create storage policies:

```sql
-- Allow users to upload files
CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own files
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 7. Test Your Setup

1. Start your development server: `npm run dev`
2. Try to sign up/sign in
3. Check that data is being saved to your Supabase tables
4. Verify that RLS policies are working correctly

## 8. Production Deployment

When deploying to production:

1. Update your environment variables with production values
2. Add your production domain to Supabase auth settings
3. Configure CORS settings if needed
4. Set up proper backup strategies

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Make sure all tables have RLS enabled and proper policies
2. **Auth Issues**: Check that your environment variables are correct
3. **CORS Errors**: Add your domain to Supabase auth settings
4. **Permission Denied**: Verify that your API keys have the correct permissions

### Database Schema Issues

#### Mood Entries Issues
If you're getting errors with mood tracking, ensure your `mood_entries` table has the correct schema:

```sql
-- Check if mood_entries table exists and has correct columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'mood_entries';

-- If the table is missing or has wrong columns, recreate it:
DROP TABLE IF EXISTS mood_entries;

CREATE TABLE mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10) NOT NULL,
  mood_label TEXT CHECK (mood_label IN ('excellent', 'good', 'neutral', 'bad', 'terrible')) NOT NULL,
  notes TEXT,
  activities TEXT[],
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Goals Issues
If you're getting errors with goals, ensure your `goals` table has the correct schema:

```sql
-- Check if goals table exists and has correct columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'goals';

-- If the table is missing or has wrong columns, recreate it:
DROP TABLE IF EXISTS goals;

CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  target_date TIMESTAMP WITH TIME ZONE,
  progress INTEGER CHECK (progress >= 0 AND progress <= 100) DEFAULT 0,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused')) DEFAULT 'not_started',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tasks Issues
If you're getting errors with tasks, ensure your `tasks` table has the correct schema:

```sql
-- Check if tasks table exists and has correct columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tasks';

-- If the table is missing or has wrong columns, recreate it:
DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  estimated_duration INTEGER, -- in minutes
  due_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Environment Variables Issues

1. **Check your `.env` file**:
   ```bash
   # Make sure these variables are set correctly
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. **Verify your Supabase credentials**:
   - Go to your Supabase dashboard
   - Navigate to Settings → API
   - Copy the Project URL and anon public key
   - Make sure they match your `.env` file

3. **Restart your development server** after updating environment variables:
   ```bash
   npm run dev
   ```

### Authentication Issues

1. **Check if user is authenticated**:
   ```javascript
   // In browser console
   console.log('User:', supabase.auth.getUser());
   console.log('Session:', supabase.auth.getSession());
   ```

2. **Verify RLS policies**:
   ```sql
   -- Check RLS policies for all tables
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

3. **Test authentication manually**:
   ```javascript
   // In browser console
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'test@example.com',
     password: 'password'
   });
   console.log('Auth result:', { data, error });
   ```

### Data Insertion Issues

1. **Check table structure**:
   ```sql
   -- For any table, check its structure
   \d table_name
   
   -- Or use this query
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns 
   WHERE table_name = 'your_table_name'
   ORDER BY ordinal_position;
   ```

2. **Test data insertion manually**:
   ```sql
   -- Test inserting a mood entry
   INSERT INTO mood_entries (user_id, mood_score, mood_label, notes)
   VALUES ('your-user-id', 8, 'good', 'Feeling great today!');
   
   -- Test inserting a goal
   INSERT INTO goals (user_id, title, description, status)
   VALUES ('your-user-id', 'Test Goal', 'Test Description', 'not_started');
   ```

3. **Check for constraint violations**:
   ```sql
   -- Check what constraints exist on a table
   SELECT conname, contype, pg_get_constraintdef(oid) 
   FROM pg_constraint 
   WHERE conrelid = 'your_table_name'::regclass;
   ```

### Debugging Steps

1. **Enable browser console logging**:
   - Open browser developer tools
   - Check the Console tab for error messages
   - Look for Supabase-related errors

2. **Check network requests**:
   - Open browser developer tools
   - Go to Network tab
   - Look for failed requests to Supabase
   - Check request/response details

3. **Verify Supabase connection**:
   ```javascript
   // In browser console
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Supabase client:', supabase);
   
   // Test a simple query
   const { data, error } = await supabase
     .from('profiles')
     .select('*')
     .limit(1);
   console.log('Test query result:', { data, error });
   ```

### Common Error Messages and Solutions

1. **"relation does not exist"**:
   - The table doesn't exist in your database
   - Run the CREATE TABLE statements from the setup guide

2. **"permission denied"**:
   - RLS policies are blocking the operation
   - Check that the user is authenticated
   - Verify RLS policies are correct

3. **"column does not exist"**:
   - The table schema doesn't match what the code expects
   - Check the table structure and update it if needed

4. **"invalid input syntax"**:
   - Data type mismatch
   - Check that you're sending the correct data types

5. **"duplicate key value violates unique constraint"**:
   - Trying to insert a record with a duplicate unique key
   - Check your unique constraints

### Getting Help

If you're still having issues:

1. **Check the Supabase documentation**: https://supabase.com/docs
2. **Visit the Supabase community**: https://github.com/supabase/supabase/discussions
3. **Review the Row Level Security guide**: https://supabase.com/docs/guides/auth/row-level-security
4. **Check the app's console logs** for detailed error messages
5. **Verify your database schema** matches the expected structure

## Security Best Practices

1. **Never expose service role keys** in client-side code
2. **Use RLS policies** to secure all data
3. **Validate input** on both client and server
4. **Use HTTPS** in production
5. **Regularly audit** your security policies
6. **Monitor** your application for suspicious activity

## Support

If you encounter issues:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Visit the [Supabase community](https://github.com/supabase/supabase/discussions)
3. Review the [Row Level Security guide](https://supabase.com/docs/guides/auth/row-level-security) 