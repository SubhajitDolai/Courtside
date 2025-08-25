-- Simple and Secure RLS Policies for Super Admins Table
-- Run these commands in your Supabase SQL Editor

-- 1. Enable RLS on super_admins table
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- 2. Allow authenticated users to read super_admins (for checking if they are super admin)
-- This covers both the useSuperAdmin hook AND admin management in one policy
CREATE POLICY "Allow authenticated users to read super_admins"
ON super_admins
FOR SELECT
TO authenticated
USING (true);

-- 3. No direct INSERT/UPDATE/DELETE through Supabase client
-- All modifications must go through SQL functions for security
CREATE POLICY "No direct modifications"
ON super_admins
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No direct updates"
ON super_admins
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No direct deletes"
ON super_admins
FOR DELETE
TO authenticated
USING (false);

-- 4. Grant necessary permissions for SQL functions to work
-- These allow the helper functions to bypass RLS when needed
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON super_admins TO postgres;

-- Note: The SQL helper functions will work because they run with elevated privileges
-- Users can only read the table, all modifications must go through functions
