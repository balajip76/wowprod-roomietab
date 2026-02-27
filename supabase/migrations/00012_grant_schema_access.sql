-- Grant schema access to Supabase roles so PostgREST can serve the roomietab schema
GRANT USAGE ON SCHEMA roomietab TO anon;
GRANT USAGE ON SCHEMA roomietab TO authenticated;
GRANT USAGE ON SCHEMA roomietab TO service_role;

GRANT SELECT ON ALL TABLES IN SCHEMA roomietab TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA roomietab TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA roomietab TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA roomietab GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA roomietab GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA roomietab GRANT ALL ON TABLES TO service_role;

-- Expose roomietab schema to PostgREST
ALTER ROLE authenticator SET pgrst.db_schemas TO 'public, roomietab';
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
