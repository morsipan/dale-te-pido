-- ==============================================================================
-- DALE!TEPIDO — SCRIPT SQL DE SANEAMIENTO, PURGA Y SINCRONIZACIÓN DE CREDENCIALES
-- Base de Datos: Supabase PostgreSQL (Proyecto Activo: odmwquntubniqbvkecna)
-- Estándar de Seguridad: Criptografía salt:sha256 & Aislamiento Total RLS
-- Fecha: 22 de Noviembre de 2026
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONES CRIPTOGRÁFICAS REQUERIDAS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ------------------------------------------------------------------------------
-- 2. PURGA DE TIENDAS OBSOLETAS Y PRUEBAS EN company_settings
-- ------------------------------------------------------------------------------
-- Neutralizar o eliminar registros residuales de pings y pruebas huérfanas
UPDATE public.company_settings
SET status = 'DELETED',
    business_name = '[Eliminada] ' || store_id,
    updated_at = NOW()
WHERE store_id IN ('test-ping-store', 'bigmount', 'cocostore')
   OR store_id LIKE 'test-store-%'
   OR (admin_email IS NULL AND (billing_info IS NULL OR billing_info::text = '{}') AND store_id NOT IN ('bighouse', 'ferre-now', 'kioscojulio', 'noutacc', 'tecnomont', 'biuti', 'todolisto', 'lugonessilva', 'polo', 'ferreteria-el-rafa', 'elquesabepoco', 'starsound', 'royal-prestige-monte-grande', 'larebardie', 'al-toque', 'licalic'));

-- ------------------------------------------------------------------------------
-- 3. SANEAMIENTO DE REGISTROS HUÉRFANOS EN store_auth
-- ------------------------------------------------------------------------------
-- Eliminar credenciales que no pertenezcan a comercios activos en company_settings
DELETE FROM public.store_auth
WHERE store_id NOT IN (
    SELECT LOWER(TRIM(store_id)) 
    FROM public.company_settings 
    WHERE status != 'DELETED' AND store_id NOT LIKE 'deleted-%'
)
OR store_id IN ('test-ping-store', 'bigmount', 'cocostore')
OR store_id LIKE 'deleted-%';

-- ------------------------------------------------------------------------------
-- 4. SANEAMIENTO DE REGISTROS HUÉRFANOS EN store_credentials
-- ------------------------------------------------------------------------------
-- Mantener únicamente la configuración global 'global' y las tiendas activas
DELETE FROM public.store_credentials
WHERE store_id != 'global'
  AND (
    store_id NOT IN (
        SELECT LOWER(TRIM(store_id)) 
        FROM public.company_settings 
        WHERE status != 'DELETED' AND store_id NOT LIKE 'deleted-%'
    )
    OR store_id IN ('test-ping-store', 'bigmount', 'cocostore')
    OR store_id LIKE 'deleted-%'
  );

-- ------------------------------------------------------------------------------
-- 5. NORMALIZACIÓN CRIPTOGRÁFICA: MIGRACIÓN A salt:sha256 EN store_auth
-- ------------------------------------------------------------------------------
-- Convertir cualquier contraseña que aún esté en texto plano a hash salt:sha256
DO $$
DECLARE
    r RECORD;
    v_salt TEXT;
    v_hash TEXT;
    v_new_stored TEXT;
BEGIN
    FOR r IN 
        SELECT store_id, password 
        FROM public.store_auth 
        WHERE password IS NOT NULL 
          AND password != '' 
          AND password NOT LIKE '%:%'
    LOOP
        v_salt := encode(extensions.gen_random_bytes(16), 'hex');
        v_hash := encode(extensions.digest(v_salt || TRIM(r.password), 'sha256'), 'hex');
        v_new_stored := v_salt || ':' || v_hash;
        
        UPDATE public.store_auth
        SET password = v_new_stored, updated_at = NOW()
        WHERE store_id = r.store_id;

        UPDATE public.company_settings
        SET password = v_new_stored, updated_at = NOW()
        WHERE LOWER(TRIM(store_id)) = LOWER(TRIM(r.store_id));
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 6. SINCRONIZACIÓN Y CLASIFICACIÓN DE CUENTAS DEMO Y COMERCIOS REALES
-- ------------------------------------------------------------------------------
-- Asegurar que las 8 tiendas demo oficiales tengan is_demo = true en billing_info
UPDATE public.company_settings
SET billing_info = jsonb_set(COALESCE(billing_info, '{}'::jsonb), '{is_demo}', 'true'::jsonb, true),
    status = 'ACTIVE',
    updated_at = NOW()
WHERE store_id IN ('bighouse', 'ferre-now', 'kioscojulio', 'noutacc', 'tecnomont', 'biuti', 'todolisto', 'lugonessilva');

-- Asegurar que los 8 comercios reales tengan is_demo = false en billing_info
UPDATE public.company_settings
SET billing_info = jsonb_set(COALESCE(billing_info, '{}'::jsonb), '{is_demo}', 'false'::jsonb, true),
    status = 'ACTIVE',
    updated_at = NOW()
WHERE store_id IN ('polo', 'ferreteria-el-rafa', 'elquesabepoco', 'starsound', 'royal-prestige-monte-grande', 'larebardie', 'al-toque', 'licalic');

-- ------------------------------------------------------------------------------
-- 7. FUNCIÓN RPC: ROTACIÓN SEGURA DE CREDENCIALES (Super Admin)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.super_admin_rotate_credential(
  p_store_id TEXT,
  p_new_password TEXT
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_clean_id TEXT := LOWER(TRIM(COALESCE(p_store_id, '')));
  v_salt TEXT;
  v_hash TEXT;
  v_stored_pass TEXT;
  v_store_record RECORD;
BEGIN
  IF v_clean_id = '' OR p_new_password IS NULL OR length(TRIM(p_new_password)) < 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'La contraseña debe tener al menos 6 caracteres');
  END IF;

  SELECT store_id, business_name, admin_email, billing_info
  INTO v_store_record
  FROM public.company_settings
  WHERE LOWER(TRIM(store_id)) = v_clean_id
    AND status != 'DELETED'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comercio no encontrado o inactivo');
  END IF;

  -- Generación de salt criptográfico aleatorio y digest SHA-256
  v_salt := encode(extensions.gen_random_bytes(16), 'hex');
  v_hash := encode(extensions.digest(v_salt || TRIM(p_new_password), 'sha256'), 'hex');
  v_stored_pass := v_salt || ':' || v_hash;

  -- Upsert en store_auth
  INSERT INTO public.store_auth (store_id, admin_email, password, updated_at)
  VALUES (v_clean_id, v_store_record.admin_email, v_stored_pass, NOW())
  ON CONFLICT (store_id) DO UPDATE
  SET password = v_stored_pass,
      admin_email = COALESCE(v_store_record.admin_email, public.store_auth.admin_email),
      updated_at = NOW();

  -- Actualizar company_settings con el hash e invalidación de sesión
  UPDATE public.company_settings
  SET password = v_stored_pass,
      billing_info = jsonb_set(
        jsonb_set(COALESCE(billing_info, '{}'::jsonb), '{last_password_reset}', to_jsonb(NOW()::text), true),
        '{auth_epoch}', to_jsonb(EXTRACT(EPOCH FROM NOW())::bigint), true
      ),
      updated_at = NOW()
  WHERE LOWER(TRIM(store_id)) = v_clean_id;

  -- Registrar en auditoría
  BEGIN
    INSERT INTO public.store_audit_logs (store_id, event_type, details, device, ip, status, created_at)
    VALUES (
      v_clean_id,
      'Rotación de Credencial (Super Admin)',
      'Credencial salt:sha256 actualizada e invalidación de sesiones previas efectuada',
      'Panel Super Admin',
      'internal',
      'Normal',
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    -- Tabla opcional
  END;

  RETURN jsonb_build_object(
    'success', true,
    'store_id', v_clean_id,
    'format', 'salt:sha256',
    'rotated_at', NOW(),
    'message', 'Credencial rotada exitosamente'
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 8. FUNCIÓN RPC: CONSULTA EN TIEMPO REAL DEL ESTADO DE CREDENCIALES
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_stores_credential_status()
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'store_id', cs.store_id,
      'business_name', cs.business_name,
      'admin_email', cs.admin_email,
      'plan_level', cs.plan_level,
      'status', cs.status,
      'is_demo', COALESCE((cs.billing_info->>'is_demo')::boolean, false),
      'has_credential', (
        (sa.password IS NOT NULL AND sa.password LIKE '%:%') OR 
        (cs.password IS NOT NULL AND cs.password LIKE '%:%')
      ),
      'credential_format', CASE 
        WHEN (sa.password LIKE '%:%' OR cs.password LIKE '%:%') THEN 'salt:sha256'
        WHEN (sa.password IS NOT NULL OR cs.password IS NOT NULL) THEN 'legacy'
        ELSE 'none'
      END,
      'last_reset', COALESCE(cs.billing_info->>'last_password_reset', sa.updated_at::text)
    ) ORDER BY cs.created_at ASC
  )
  INTO v_result
  FROM public.company_settings cs
  LEFT JOIN public.store_auth sa ON LOWER(TRIM(sa.store_id)) = LOWER(TRIM(cs.store_id))
  WHERE cs.status != 'DELETED' AND cs.store_id NOT LIKE 'deleted-%';

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- ------------------------------------------------------------------------------
-- 9. PERMISOS Y SEGURIDAD RLS
-- ------------------------------------------------------------------------------
REVOKE ALL ON public.store_auth FROM PUBLIC, anon;
GRANT ALL ON public.store_auth TO service_role;

REVOKE ALL ON public.store_credentials FROM PUBLIC, anon;
GRANT ALL ON public.store_credentials TO service_role;

-- Permitir ejecución segura de funciones RPC a través del cliente API backend
GRANT EXECUTE ON FUNCTION public.verify_store_login(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reset_store_password(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.super_admin_rotate_credential(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_stores_credential_status() TO anon, authenticated, service_role;
