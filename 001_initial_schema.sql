-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE reaction_type AS ENUM ('LIKE', 'LOL', 'FACEPALM');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    world_id TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    avatar TEXT,
    region TEXT DEFAULT 'global',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    content TEXT NOT NULL,
    image_url TEXT,
    region TEXT DEFAULT 'global',
    is_boosted BOOLEAN DEFAULT FALSE,
    boosted_until TIMESTAMPTZ,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reactions table
CREATE TABLE reactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type reaction_type NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Payments table
CREATE TABLE payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'WLD',
    status payment_status DEFAULT 'PENDING',
    worldcoin_tx_hash TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard entries table
CREATE TABLE leaderboard_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    week TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    region TEXT DEFAULT 'global',
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week, region)
);

-- Create indexes for better performance
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_boosted ON posts(is_boosted, boosted_until);
CREATE INDEX idx_posts_region ON posts(region);
CREATE INDEX idx_reactions_post_id ON reactions(post_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_leaderboard_week_region ON leaderboard_entries(week, region, score DESC);
CREATE INDEX idx_payments_status ON payments(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id);

-- RLS Policies for posts table
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid()::text = author_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid()::text = author_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid()::text = author_id);

-- RLS Policies for reactions table
CREATE POLICY "Anyone can view reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Users can create reactions" ON reactions FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own reactions" ON reactions FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own reactions" ON reactions FOR DELETE USING (auth.uid()::text = user_id);

-- RLS Policies for payments table
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can create own payments" ON payments FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Service role can update payments" ON payments FOR UPDATE USING (auth.role() = 'service_role');

-- RLS Policies for leaderboard_entries table
CREATE POLICY "Anyone can view leaderboard" ON leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Service role can manage leaderboard" ON leaderboard_entries FOR ALL USING (auth.role() = 'service_role');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaderboard_entries_updated_at BEFORE UPDATE ON leaderboard_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

