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

-- 8. Create Transactions Table
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'refund')),
  category TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  merchant TEXT NOT NULL,
  method TEXT NOT NULL,
  notes TEXT,
  tags TEXT[],
  receipt_url TEXT,
  location TEXT,
  status TEXT DEFAULT 'Completed',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 9. Enable RLS for Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies for Transactions
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" 
ON public.transactions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" 
ON public.transactions FOR DELETE 
USING (auth.uid() = user_id);

-- 11. Enable Realtime for Transactions
-- Note: 'supabase_realtime' publication might need to be created if it doesn't exist, but typically it does.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- If publication doesn't exist, we skip or you can create it.
    NULL;
END $$;

-- 12. Create Storage Bucket for Receipts
-- (This requires the storage schema which might not be dumpable in plain sql if we don't have it initialized, 
-- but we will assume it's standard Supabase setup)
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false) ON CONFLICT DO NOTHING;

-- 13. RLS for Storage Bucket (Assuming storage.objects table exists)
DO $$
BEGIN
  CREATE POLICY "Users can upload their own receipts" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'receipts' AND auth.uid() = owner);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can view their own receipts" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'receipts' AND auth.uid() = owner);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
