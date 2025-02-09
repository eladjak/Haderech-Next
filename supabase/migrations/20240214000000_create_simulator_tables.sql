-- Create simulator_scenarios table
CREATE TABLE simulator_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    category TEXT NOT NULL,
    initial_message TEXT NOT NULL,
    suggested_responses JSONB NOT NULL DEFAULT '[]',
    learning_objectives JSONB NOT NULL DEFAULT '[]',
    success_criteria JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create simulator_sessions table
CREATE TABLE simulator_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scenario_id UUID NOT NULL REFERENCES simulator_scenarios(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'failed')),
    messages JSONB NOT NULL DEFAULT '[]',
    feedback JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create simulator_results table
CREATE TABLE simulator_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES simulator_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scenario_id UUID NOT NULL REFERENCES simulator_scenarios(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    feedback JSONB NOT NULL DEFAULT '[]',
    duration INTEGER NOT NULL, -- in seconds
    details JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create simulator_user_stats table
CREATE TABLE simulator_user_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    average_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    completed_scenarios INTEGER NOT NULL DEFAULT 0,
    time_spent INTEGER NOT NULL DEFAULT 0, -- in seconds
    strongest_category TEXT,
    weakest_category TEXT,
    skills_progress JSONB NOT NULL DEFAULT '{}',
    learning_path JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create simulator_user_settings table
CREATE TABLE simulator_user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    language TEXT NOT NULL DEFAULT 'he',
    feedback_frequency TEXT NOT NULL DEFAULT 'always' CHECK (feedback_frequency IN ('always', 'end', 'never')),
    auto_suggestions BOOLEAN NOT NULL DEFAULT true,
    timer BOOLEAN NOT NULL DEFAULT true,
    feedback_detail TEXT NOT NULL DEFAULT 'basic' CHECK (feedback_detail IN ('basic', 'detailed', 'comprehensive')),
    emotional_tracking BOOLEAN NOT NULL DEFAULT true,
    learning_goals JSONB NOT NULL DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add RLS policies
ALTER TABLE simulator_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_user_settings ENABLE ROW LEVEL SECURITY;

-- Scenarios are readable by all authenticated users
CREATE POLICY "Scenarios are readable by all authenticated users"
    ON simulator_scenarios FOR SELECT
    TO authenticated
    USING (true);

-- Sessions are readable and writable by the owner
CREATE POLICY "Sessions are readable and writable by the owner"
    ON simulator_sessions FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Results are readable by the owner
CREATE POLICY "Results are readable by the owner"
    ON simulator_results FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Stats are readable and writable by the owner
CREATE POLICY "Stats are readable and writable by the owner"
    ON simulator_user_stats FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Settings are readable and writable by the owner
CREATE POLICY "Settings are readable and writable by the owner"
    ON simulator_user_settings FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_simulator_scenarios_updated_at
    BEFORE UPDATE ON simulator_scenarios
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_simulator_sessions_updated_at
    BEFORE UPDATE ON simulator_sessions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_simulator_user_stats_updated_at
    BEFORE UPDATE ON simulator_user_stats
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_simulator_user_settings_updated_at
    BEFORE UPDATE ON simulator_user_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column(); 