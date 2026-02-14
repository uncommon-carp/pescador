-- ─── Admin helper: check if current user is a system admin ──────────────
CREATE OR REPLACE FUNCTION is_system_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT (raw_app_meta_data->>'is_admin')::boolean
     FROM auth.users
     WHERE id = auth.uid()),
    false
  );
$$;

-- ─── Admin metrics ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_get_metrics()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT is_system_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT count(*) FROM auth.users),
    'total_organizations', (SELECT count(*) FROM public.organizations),
    'recent_signups', (SELECT count(*) FROM auth.users WHERE created_at > now() - interval '7 days'),
    'active_subscriptions', (SELECT count(*) FROM public.organizations WHERE subscription_status IN ('active', 'trialing'))
  ) INTO result;

  RETURN result;
END;
$$;

-- ─── Admin: list users with pagination + search ────────────────────────
CREATE OR REPLACE FUNCTION admin_list_users(
  search_query TEXT DEFAULT '',
  page_number INT DEFAULT 1,
  page_size INT DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSON;
  offset_val INT;
BEGIN
  IF NOT is_system_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  offset_val := (page_number - 1) * page_size;

  SELECT json_agg(row_to_json(t))
  FROM (
    SELECT
      u.id,
      u.email,
      u.created_at,
      u.last_sign_in_at,
      (SELECT count(*) FROM public.organization_members om WHERE om.user_id = u.id) AS org_count
    FROM auth.users u
    WHERE (search_query = '' OR u.email ILIKE '%' || search_query || '%')
    ORDER BY u.created_at DESC
    LIMIT page_size
    OFFSET offset_val
  ) t
  INTO result;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- ─── Admin: count users (for pagination) ───────────────────────────────
CREATE OR REPLACE FUNCTION admin_count_users(
  search_query TEXT DEFAULT ''
)
RETURNS INT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  total INT;
BEGIN
  IF NOT is_system_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT count(*)
  FROM auth.users u
  WHERE (search_query = '' OR u.email ILIKE '%' || search_query || '%')
  INTO total;

  RETURN total;
END;
$$;

-- ─── Admin: list organizations with pagination + search ────────────────
CREATE OR REPLACE FUNCTION admin_list_organizations(
  search_query TEXT DEFAULT '',
  page_number INT DEFAULT 1,
  page_size INT DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSON;
  offset_val INT;
BEGIN
  IF NOT is_system_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  offset_val := (page_number - 1) * page_size;

  SELECT json_agg(row_to_json(t))
  FROM (
    SELECT
      o.id,
      o.name,
      o.slug,
      o.subscription_status,
      o.created_at,
      (SELECT u.email FROM auth.users u WHERE u.id = o.owner_id) AS owner_email,
      (SELECT count(*) FROM public.organization_members om WHERE om.organization_id = o.id) AS member_count
    FROM public.organizations o
    WHERE (search_query = '' OR o.name ILIKE '%' || search_query || '%')
    ORDER BY o.created_at DESC
    LIMIT page_size
    OFFSET offset_val
  ) t
  INTO result;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- ─── Admin: count organizations (for pagination) ───────────────────────
CREATE OR REPLACE FUNCTION admin_count_organizations(
  search_query TEXT DEFAULT ''
)
RETURNS INT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  total INT;
BEGIN
  IF NOT is_system_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT count(*)
  FROM public.organizations o
  WHERE (search_query = '' OR o.name ILIKE '%' || search_query || '%')
  INTO total;

  RETURN total;
END;
$$;
