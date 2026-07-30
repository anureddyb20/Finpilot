-- Supabase Schema for FinPilot

-- 1. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  profile_photo TEXT,
  country TEXT,
  currency TEXT DEFAULT 'USD',
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Settings Table
CREATE TABLE public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notifications BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT false,
  preferred_currency TEXT DEFAULT 'USD',
  language TEXT DEFAULT 'en',
  UNIQUE(user_id)
);

-- 3. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 5. Create RLS Policies for Settings
CREATE POLICY "Users can view own settings" 
ON public.settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" 
ON public.settings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" 
ON public.settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 6. Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, country, currency, language, theme)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'country',
    COALESCE(new.raw_user_meta_data->>'currency', 'USD'),
    COALESCE(new.raw_user_meta_data->>'language', 'en'),
    COALESCE(new.raw_user_meta_data->>'theme', 'light')
  );
  
  INSERT INTO public.settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger to call the function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
