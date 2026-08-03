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


-- 14. Create Budgets Table
CREATE TABLE public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  limit_amount NUMERIC(15, 2) NOT NULL,
  spent_amount NUMERIC(15, 2) DEFAULT 0,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budgets" 
ON public.budgets FOR ALL 
USING (auth.uid() = user_id);


-- 15. Create Goals Table
CREATE TABLE public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL,
  saved_amount NUMERIC(15, 2) DEFAULT 0,
  target_date DATE,
  icon_name TEXT DEFAULT 'Target',
  color_theme TEXT DEFAULT 'blue',
  status TEXT DEFAULT 'In Progress',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals" 
ON public.goals FOR ALL 
USING (auth.uid() = user_id);


-- 16. Create Recurring Payments Table
CREATE TABLE public.recurring_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  due_date INTEGER NOT NULL, -- Day of the month
  category TEXT NOT NULL,
  frequency TEXT DEFAULT 'Monthly',
  is_urgent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recurring_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recurring payments" 
ON public.recurring_payments FOR ALL 
USING (auth.uid() = user_id);


-- 17. Create Notifications Table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT DEFAULT 'information',
  related_module TEXT,
  related_record_id UUID,
  priority TEXT DEFAULT 'low',
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  action_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications" 
ON public.notifications FOR ALL 
USING (auth.uid() = user_id);

-- 17a. Create Notification Triggers

-- Transaction Trigger
CREATE OR REPLACE FUNCTION public.handle_new_transaction()
RETURNS trigger AS $$
BEGIN
  IF NEW.type = 'expense' THEN
    INSERT INTO public.notifications (user_id, title, description, category, type, related_module, related_record_id, priority, action_url)
    VALUES (
      NEW.user_id,
      'Transaction Added',
      'Expense of ₹' || NEW.amount || ' added under ' || NEW.category || '.',
      'transactions',
      'information',
      'transactions',
      NEW.id,
      'low',
      '/transactions'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_transaction_created ON public.transactions;
CREATE TRIGGER on_transaction_created
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_transaction();


-- Budget Trigger
CREATE OR REPLACE FUNCTION public.handle_budget_update()
RETURNS trigger AS $$
DECLARE
  old_pct numeric;
  new_pct numeric;
BEGIN
  IF NEW.limit_amount > 0 THEN
    old_pct := (OLD.spent_amount / OLD.limit_amount) * 100;
    new_pct := (NEW.spent_amount / NEW.limit_amount) * 100;

    -- Check for exceeding 100%
    IF new_pct >= 100 AND old_pct < 100 THEN
      INSERT INTO public.notifications (user_id, title, description, category, type, related_module, related_record_id, priority, action_url)
      VALUES (NEW.user_id, 'Budget Exceeded', 'You have exceeded your ' || COALESCE(NEW.name, NEW.category) || ' budget.', 'budgets', 'critical', 'budgets', NEW.id, 'high', '/budgets');
    -- Check for reaching 75%
    ELSIF new_pct >= 75 AND old_pct < 75 THEN
      INSERT INTO public.notifications (user_id, title, description, category, type, related_module, related_record_id, priority, action_url)
      VALUES (NEW.user_id, 'Budget Alert', 'Your ' || COALESCE(NEW.name, NEW.category) || ' budget has reached 75%.', 'budgets', 'warning', 'budgets', NEW.id, 'medium', '/budgets');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_budget_updated ON public.budgets;
CREATE TRIGGER on_budget_updated
  AFTER UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_budget_update();


-- Goals Trigger
CREATE OR REPLACE FUNCTION public.handle_goal_update()
RETURNS trigger AS $$
DECLARE
  old_pct numeric;
  new_pct numeric;
BEGIN
  IF NEW.target_amount > 0 THEN
    old_pct := (OLD.saved_amount / OLD.target_amount) * 100;
    new_pct := (NEW.saved_amount / NEW.target_amount) * 100;

    -- Check for completion
    IF new_pct >= 100 AND old_pct < 100 THEN
      INSERT INTO public.notifications (user_id, title, description, category, type, related_module, related_record_id, priority, action_url)
      VALUES (NEW.user_id, 'Goal Completed', 'You have successfully completed your ' || NEW.name || ' goal.', 'goals', 'achievement', 'goals', NEW.id, 'medium', '/goals');
    -- Check for 50%
    ELSIF new_pct >= 50 AND old_pct < 50 THEN
      INSERT INTO public.notifications (user_id, title, description, category, type, related_module, related_record_id, priority, action_url)
      VALUES (NEW.user_id, 'Goal Milestone', 'Congratulations! Your ' || NEW.name || ' goal is halfway complete.', 'goals', 'success', 'goals', NEW.id, 'low', '/goals');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_goal_updated ON public.goals;
CREATE TRIGGER on_goal_updated
  AFTER UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_goal_update();


-- 18. Enable Realtime for all new tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'budgets') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'goals') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'recurring_payments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.recurring_payments;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;


-- 19. Alter Budgets Table for Dynamic Module Requirements
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS alert_threshold INTEGER DEFAULT 75,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS color TEXT;


-- 20. Alter Goals and Transactions for Dynamic Goals Module
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS monthly_contribution NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL;


-- 21. Alter Recurring Payments for Dynamic Module Requirements
ALTER TABLE public.recurring_payments 
ADD COLUMN IF NOT EXISTS auto_pay BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS merchant TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS reminder_days INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS next_due_date DATE,
ADD COLUMN IF NOT EXISTS color_theme TEXT;
