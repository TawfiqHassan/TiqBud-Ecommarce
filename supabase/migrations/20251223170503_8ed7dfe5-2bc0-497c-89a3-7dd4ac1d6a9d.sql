-- Update handle_new_user function with input validation (removes security questions)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_full_name text;
  v_phone text;
  v_city text;
  v_username text;
BEGIN
  -- Validate and sanitize inputs with length limits
  v_full_name := TRIM(SUBSTRING(COALESCE(NEW.raw_user_meta_data ->> 'full_name', '') FROM 1 FOR 100));
  v_phone := TRIM(SUBSTRING(COALESCE(NEW.raw_user_meta_data ->> 'phone', '') FROM 1 FOR 20));
  v_city := TRIM(SUBSTRING(COALESCE(NEW.raw_user_meta_data ->> 'city', '') FROM 1 FOR 100));
  v_username := TRIM(SUBSTRING(COALESCE(NEW.raw_user_meta_data ->> 'username', '') FROM 1 FOR 50));
  
  -- Basic XSS prevention - reject if contains script tags or dangerous patterns
  IF v_full_name ~* '<script|javascript:|on\w+=' OR
     v_phone ~* '<script|javascript:|on\w+=' OR
     v_city ~* '<script|javascript:|on\w+=' OR
     v_username ~* '<script|javascript:|on\w+=' THEN
    RAISE EXCEPTION 'Invalid characters detected in user data';
  END IF;
  
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name, 
    phone, 
    city, 
    username,
    security_question,
    security_answer
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NULLIF(v_full_name, ''),
    NULLIF(v_phone, ''),
    NULLIF(v_city, ''),
    NULLIF(v_username, ''),
    NULL,  -- No longer collecting security questions
    NULL   -- No longer collecting security answers
  );
  RETURN NEW;
END;
$$;

-- Add length constraints to profiles table columns
ALTER TABLE public.profiles 
  ALTER COLUMN full_name TYPE varchar(100),
  ALTER COLUMN phone TYPE varchar(20),
  ALTER COLUMN city TYPE varchar(100),
  ALTER COLUMN username TYPE varchar(50),
  ALTER COLUMN security_question TYPE varchar(200),
  ALTER COLUMN security_answer TYPE varchar(200);

-- Add comment explaining security questions are deprecated
COMMENT ON COLUMN public.profiles.security_question IS 'DEPRECATED: Security questions are no longer collected for new users';
COMMENT ON COLUMN public.profiles.security_answer IS 'DEPRECATED: Security answers are no longer collected for new users';