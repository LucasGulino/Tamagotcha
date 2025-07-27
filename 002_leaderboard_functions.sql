-- Function to calculate user score for a given week
CREATE OR REPLACE FUNCTION calculate_user_weekly_score(
    user_id_param TEXT,
    week_param TEXT,
    region_param TEXT DEFAULT 'global'
)
RETURNS INTEGER AS $$
DECLARE
    total_score INTEGER := 0;
    week_start DATE;
    week_end DATE;
BEGIN
    -- Calculate week boundaries from week string (format: "2024-W01")
    week_start := (week_param || '-1')::DATE;
    week_end := week_start + INTERVAL '6 days';
    
    -- Calculate score based on reactions received
    -- LIKE = 1 point, LOL = 2 points, FACEPALM = 3 points
    SELECT COALESCE(SUM(
        CASE 
            WHEN r.type = 'LIKE' THEN 1
            WHEN r.type = 'LOL' THEN 2
            WHEN r.type = 'FACEPALM' THEN 3
            ELSE 0
        END
    ), 0) INTO total_score
    FROM reactions r
    JOIN posts p ON r.post_id = p.id
    WHERE p.author_id = user_id_param
    AND p.region = region_param
    AND r.created_at >= week_start
    AND r.created_at < week_end + INTERVAL '1 day';
    
    RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update leaderboard for a specific week
CREATE OR REPLACE FUNCTION update_weekly_leaderboard(
    week_param TEXT,
    region_param TEXT DEFAULT 'global'
)
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
    calculated_score INTEGER;
BEGIN
    -- Loop through all users who posted in the given week and region
    FOR user_record IN 
        SELECT DISTINCT p.author_id as user_id
        FROM posts p
        WHERE p.region = region_param
        AND p.created_at >= (week_param || '-1')::DATE
        AND p.created_at < (week_param || '-1')::DATE + INTERVAL '7 days'
    LOOP
        -- Calculate score for this user
        calculated_score := calculate_user_weekly_score(
            user_record.user_id, 
            week_param, 
            region_param
        );
        
        -- Update or insert leaderboard entry
        INSERT INTO leaderboard_entries (user_id, week, score, region)
        VALUES (user_record.user_id, week_param, calculated_score, region_param)
        ON CONFLICT (user_id, week, region)
        DO UPDATE SET 
            score = calculated_score,
            updated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get current week string
CREATE OR REPLACE FUNCTION get_current_week()
RETURNS TEXT AS $$
BEGIN
    RETURN TO_CHAR(CURRENT_DATE, 'IYYY-"W"IW');
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update leaderboard when reactions are added
CREATE OR REPLACE FUNCTION trigger_update_leaderboard()
RETURNS TRIGGER AS $$
DECLARE
    current_week TEXT;
    post_region TEXT;
    post_author_id TEXT;
BEGIN
    -- Get the current week
    current_week := get_current_week();
    
    -- Get post details
    SELECT p.region, p.author_id INTO post_region, post_author_id
    FROM posts p
    WHERE p.id = COALESCE(NEW.post_id, OLD.post_id);
    
    -- Update leaderboard for the post author
    PERFORM update_weekly_leaderboard(current_week, post_region);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update leaderboard on reaction changes
CREATE TRIGGER update_leaderboard_on_reaction
    AFTER INSERT OR UPDATE OR DELETE ON reactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_leaderboard();

-- Function to get top users for leaderboard display
CREATE OR REPLACE FUNCTION get_leaderboard(
    week_param TEXT DEFAULT NULL,
    region_param TEXT DEFAULT 'global',
    limit_param INTEGER DEFAULT 10
)
RETURNS TABLE (
    rank INTEGER,
    user_id TEXT,
    username TEXT,
    avatar TEXT,
    score INTEGER,
    week TEXT
) AS $$
DECLARE
    target_week TEXT;
BEGIN
    -- Use current week if no week specified
    target_week := COALESCE(week_param, get_current_week());
    
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY le.score DESC, le.updated_at ASC)::INTEGER as rank,
        u.id as user_id,
        u.username,
        u.avatar,
        le.score,
        le.week
    FROM leaderboard_entries le
    JOIN users u ON le.user_id = u.id
    WHERE le.week = target_week
    AND le.region = region_param
    AND le.score > 0
    ORDER BY le.score DESC, le.updated_at ASC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

