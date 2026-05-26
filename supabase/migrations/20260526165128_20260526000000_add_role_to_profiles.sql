/*
  # Add role column to profiles table

  1. Changes
    - Add `role` column to `profiles` table with enum: 'user', 'admin'
    - Default value: 'user' for all existing and new users
    - Create trigger to sync from user_roles table to profiles.role (for backward compatibility)
    - Create helper function to check admin role directly from profiles
    - Update RLS policies to use profile role

  2. Security
    - Only user can read their own profile
    - Admins can read all profiles
    - Users can update their own profile (username, display_name, etc.) but NOT their role
    - Only admins can update the role column

  3. Notes
    - This migration maintains backward compatibility with the existing user_roles table
    - A trigger automatically syncs roles from user_roles to profiles.role
    - The role column in profiles is now the primary source of truth
    - Existing user_roles table remains for historical purposes
*/

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL DEFAULT 'user';

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create a function to check if a user has admin role (using profiles.role)
CREATE OR REPLACE FUNCTION is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = _user_id AND role = 'admin'
  );
$$;

-- Create trigger to sync role from user_roles to profiles
CREATE OR REPLACE FUNCTION sync_role_to_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET role = NEW.role 
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Check if there are any other roles for this user
    IF NOT EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = OLD.user_id 
      AND role = 'admin'
    ) THEN
      UPDATE profiles 
      SET role = 'user' 
      WHERE id = OLD.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_user_roles_to_profiles ON user_roles;

-- Create trigger
CREATE TRIGGER sync_user_roles_to_profiles
  AFTER INSERT OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_to_profiles();

-- Sync existing admin roles to profiles
UPDATE profiles p
SET role = 'admin'
WHERE EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = p.id AND ur.role = 'admin'
);

-- Enable RLS on profiles (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
  DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Create RLS policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can update own profile (not role)"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      -- Allow update only if role is not being changed, or user is admin
      role = (SELECT role FROM profiles WHERE id = auth.uid())
      OR is_admin(auth.uid())
    )
  );

-- Create policy for insert (typically handled by trigger, but just in case)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'user');
