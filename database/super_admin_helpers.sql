-- Helper SQL functions for super admin management

-- 1. Create super admin from existing profile by email
CREATE OR REPLACE FUNCTION create_super_admin_by_email(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    profile_record RECORD;
    result_message TEXT;
BEGIN
    -- Find profile by email
    SELECT id, first_name, last_name, email, prn
    INTO profile_record
    FROM profiles
    WHERE email = user_email;
    
    -- Check if profile exists
    IF NOT FOUND THEN
        RETURN 'Error: No profile found with email ' || user_email;
    END IF;
    
    -- Check if already super admin
    IF EXISTS (SELECT 1 FROM super_admins WHERE profile_id = profile_record.id) THEN
        RETURN 'Error: User is already a super admin';
    END IF;
    
    -- Insert into super_admins (handle NULL values)
    INSERT INTO super_admins (profile_id, first_name, last_name, email, prn, permissions)
    VALUES (
        profile_record.id,
        COALESCE(profile_record.first_name, ''),
        COALESCE(profile_record.last_name, ''),
        COALESCE(profile_record.email, ''),
        COALESCE(profile_record.prn, ''),
        '{"all_apps": true}'::jsonb
    );
    
    RETURN 'Success: ' || user_email || ' is now a super admin';
END;
$$;

-- 2. Remove super admin by email
CREATE OR REPLACE FUNCTION remove_super_admin_by_email(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    profile_id_var UUID;
BEGIN
    -- Find profile ID by email
    SELECT id INTO profile_id_var
    FROM profiles
    WHERE email = user_email;
    
    -- Check if profile exists
    IF NOT FOUND THEN
        RETURN 'Error: No profile found with email ' || user_email;
    END IF;
    
    -- Remove from super_admins
    DELETE FROM super_admins WHERE profile_id = profile_id_var;
    
    IF FOUND THEN
        RETURN 'Success: Removed super admin privileges from ' || user_email;
    ELSE
        RETURN 'Error: User was not a super admin';
    END IF;
END;
$$;

-- 3. List all super admins
CREATE OR REPLACE FUNCTION list_super_admins()
RETURNS TABLE (
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    prn TEXT,
    created_at TIMESTAMPTZ,
    is_active BOOLEAN,
    permissions JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.email,
        sa.first_name,
        sa.last_name,
        sa.prn,
        sa.created_at,
        sa.is_active,
        sa.permissions
    FROM super_admins sa
    ORDER BY sa.created_at DESC;
END;
$$;

-- Usage examples:
-- SELECT create_super_admin_by_email('admin@mitwpu.edu.in');
-- SELECT remove_super_admin_by_email('admin@mitwpu.edu.in');
-- SELECT * FROM list_super_admins();
