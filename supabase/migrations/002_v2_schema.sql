ALTER TABLE decks ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'draw')),
  opponent_archetype TEXT,
  format TEXT,
  notes TEXT,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS trending_decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  format TEXT NOT NULL,
  archetype TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  mainboard JSONB NOT NULL DEFAULT '[]',
  sideboard JSONB NOT NULL DEFAULT '[]',
  color_identity TEXT[] DEFAULT '{}',
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_usage ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'matches' AND policyname = 'Own matches'
  ) THEN
    CREATE POLICY "Own matches" ON matches FOR ALL USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'chat_usage' AND policyname = 'Own usage'
  ) THEN
    CREATE POLICY "Own usage" ON chat_usage FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Helper function to increment chat usage atomically
CREATE OR REPLACE FUNCTION increment_chat_usage(p_user_id UUID, p_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO chat_usage (user_id, date, count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET count = chat_usage.count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
