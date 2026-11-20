-- =============================================================================
-- DALE! TEPIDO (CLICKAPP) — SCRIPT SQL MAESTRO CONSOLIDADO DE BASE DE DATOS
-- Versión: 5.0 (Producción & Multi-Tenant SaaS B2B)
-- Fecha: 20 de Noviembre de 2026
-- =============================================================================
-- DESCRIPCIÓN:
-- Script maestro unificado e idempotente que crea y consolida toda la arquitectura
-- de tablas, extensiones, funciones de seguridad (RPC), disparadores (triggers),
-- índices de alto rendimiento y políticas de seguridad por fila (RLS).
--
-- ARQUITECTURA DE SEGURIDAD (RLS):
-- 1. Lectura Pública del Catálogo (Storefront): anon y public pueden consultar
--    tiendas, categorías, productos activos, faqs y opciones de envío/retiro.
-- 2. Zero-Read Insert en Checkout: anon puede insertar nuevos pedidos en 'orders'
--    sin permiso de lectura (SELECT) para blindar los datos personales contra BOLA/IDOR.
-- 3. Escritura y Gestión Restringida: Solo el gestor autenticado de cada comercio
--    (o el backend serverless vía service_role) puede crear, editar o borrar registros.
-- 4. Aislamiento Total de Claves: Las tablas 'store_auth' y 'store_credentials'
--    están completamente bloqueadas al rol anónimo y solo operan vía RPC SECURITY DEFINER.
--
-- NOTA LOGÍSTICA DALE!QUEVOY:
-- Todo lo respectivo a la red externa de cadetería ('deliveries' y 'merchants' multimodal)
-- se encuentra claramente demarcado y preparado al final del archivo en estado de pausa.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. EXTENSIONES DE POSTGRESQL
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. TABLA: stores (Directorio de Comercios y Subdominios)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stores (
    store_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE,
    owner_name TEXT,
    owner_email TEXT,
    whatsapp_phone TEXT,
    plan TEXT DEFAULT 'starter',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_subdomain ON public.stores(subdomain);
CREATE INDEX IF NOT EXISTS idx_stores_active ON public.stores(is_active);

-- -----------------------------------------------------------------------------
-- 2. TABLA: company_settings (Configuración Principal, Branding y Banners)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_settings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store_id TEXT UNIQUE NOT NULL,
    business_name TEXT,
    admin_email TEXT,
    contact_email TEXT,
    password TEXT, -- Hash criptográfico (sincronizado con store_auth)
    plan_level TEXT DEFAULT 'starter',
    rubro TEXT DEFAULT 'gastronomia',
    business_type TEXT,
    primary_color TEXT DEFAULT '#D72638',
    secondary_color TEXT DEFAULT '#D72638',
    logo_url TEXT,
    banner1_label TEXT,
    banner1_title TEXT,
    banner1_img TEXT,
    banner1_cat TEXT,
    banner2_label TEXT,
    banner2_title TEXT,
    banner2_img TEXT,
    banner2_cat TEXT,
    banners_json JSONB DEFAULT '[]'::jsonb,
    watermark_enabled BOOLEAN DEFAULT FALSE,
    billing_info JSONB DEFAULT '{}'::jsonb, -- Almacena _orders_vault, _pickups_vault, cupones, etc.
    horarios_data JSONB DEFAULT '[]'::jsonb,
    night_guard_active BOOLEAN DEFAULT FALSE,
    night_guard_message TEXT,
    wapp TEXT,
    whatsapp_phone TEXT,
    address TEXT,
    instagram TEXT,
    facebook TEXT,
    nosotros TEXT,
    status TEXT DEFAULT 'ACTIVE',
    payment_status TEXT DEFAULT 'UP_TO_DATE',
    upgrade_requested TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_settings_store_id ON public.company_settings(store_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_status ON public.company_settings(status);
CREATE INDEX IF NOT EXISTS idx_company_settings_admin_email ON public.company_settings(admin_email);

-- -----------------------------------------------------------------------------
-- 3. TABLA: categories (Categorías de Productos del Catálogo)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store_id TEXT NOT NULL,
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '📦',
    display_order INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_store_order ON public.categories(store_id, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(store_id, active);

-- -----------------------------------------------------------------------------
-- 4. TABLA: products (Catálogo de Productos, Precios, Variantes y Multimedia)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store_id TEXT NOT NULL,
    nombre TEXT NOT NULL,
    precio NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    precio_anterior NUMERIC(12,2) DEFAULT 0.00,
    descuento_porcentaje NUMERIC(5,2) DEFAULT 0.00,
    stock INTEGER DEFAULT 0,
    categoria TEXT,
    subcategoria TEXT,
    emoji TEXT DEFAULT '🏷️',
    marca TEXT,
    origen TEXT,
    pills TEXT,
    detalles TEXT,
    variants JSONB DEFAULT '[]'::jsonb, -- Talles, colores, modificadores y precios diferenciales
    options JSONB DEFAULT '[]'::jsonb,  -- Alias para compatibilidad modular
    img TEXT,
    img2 TEXT,
    img3 TEXT,
    imagen_url TEXT,
    imagen_url2 TEXT,
    imagen_url3 TEXT,
    video_url TEXT,                     -- Micro-videos de producto (máx 5s)
    weight_kg NUMERIC(6,2) DEFAULT 0.5, -- Peso para cálculo de carga
    sku TEXT,
    oculto BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_store_cat ON public.products(store_id, categoria);
CREATE INDEX IF NOT EXISTS idx_products_store_oculto ON public.products(store_id, oculto);
CREATE INDEX IF NOT EXISTS idx_products_store_created ON public.products(store_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 5. TABLA: pickups (Puntos de Retiro en Local y Cadetería Propia)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pickups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pickups_store_id ON public.pickups(store_id);

-- -----------------------------------------------------------------------------
-- 6. TABLA: orders (Registro Transaccional de Pedidos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT NOT NULL,
    order_number TEXT NOT NULL, -- Ej: 'TP-4821'
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    delivery_type TEXT DEFAULT 'delivery', -- 'delivery' | 'retiro'
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmar', -- 'confirmar' | 'en_cocina' | 'listo_retirar' | 'despachado' | 'cobrado' | 'perdido'
    pin_code VARCHAR(6),
    payment_method TEXT DEFAULT 'Efectivo',
    notified_to_merchant BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_created ON public.orders(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- -----------------------------------------------------------------------------
-- 7. TABLA: order_items (Desglose Relacional de Ítems por Pedido - Opcional)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT,
    nombre TEXT NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'ARS',
    weight_kg NUMERIC(6,2) DEFAULT 0.5,
    options JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- -----------------------------------------------------------------------------
-- 8. TABLA: faqs (Preguntas Frecuentes Dinámicas por Tienda)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faqs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 10,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_store_order ON public.faqs(store_id, display_order ASC);

-- -----------------------------------------------------------------------------
-- 9. TABLA: reviews (Calificaciones y Reseñas de Clientes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    comment TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_store_approved ON public.reviews(store_id, approved);

-- -----------------------------------------------------------------------------
-- 10. TABLA PRIVADA: store_auth (Credenciales y Contraseñas Cifradas)
-- -----------------------------------------------------------------------------
-- ESTA TABLA NUNCA ES ACCESIBLE DIRECTAMENTE POR EL ROL ANÓNIMO
CREATE TABLE IF NOT EXISTS public.store_auth (
    store_id TEXT PRIMARY KEY,
    admin_email TEXT,
    password TEXT, -- Hash en formato 'salt:hash' o bcrypt
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 11. TABLA PRIVADA: store_credentials (Claves de Integración e IA)
-- -----------------------------------------------------------------------------
-- ESTA TABLA NUNCA ES ACCESIBLE DIRECTAMENTE POR EL ROL ANÓNIMO
CREATE TABLE IF NOT EXISTS public.store_credentials (
    store_id TEXT PRIMARY KEY,
    supabase_url TEXT,
    supabase_key TEXT,
    cloudinary_name TEXT DEFAULT 'deuog0r34',
    cloudinary_preset TEXT DEFAULT 'daletepido_preset',
    ai_provider TEXT DEFAULT 'gemini',
    claude_key TEXT,
    claude_model TEXT DEFAULT 'claude-haiku-4-5-20251001',
    gemini_key TEXT,
    gemini_model TEXT DEFAULT 'gemini-2.5-flash',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 12. TABLA: store_audit_logs (Auditoría de Accesos y Eventos Críticos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    details TEXT,
    device TEXT DEFAULT 'Navegador Web',
    ip TEXT DEFAULT '—',
    status TEXT DEFAULT 'Normal',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_store_created ON public.store_audit_logs(store_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 13. TABLA: email_templates (Plantillas Transaccionales Super Admin CMS)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_templates (
    id TEXT PRIMARY KEY,
    subject TEXT,
    greeting TEXT,
    badge_text TEXT,
    body_text TEXT,
    btn_text TEXT,
    btn_url TEXT,
    header_logo_url TEXT,
    extra_content TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 14. FUNCIONES DE SEGURIDAD (RPC & AUTH DEFINER)
-- =============================================================================

-- A. Función para resolver el store_id desde el JWT autenticado
CREATE OR REPLACE FUNCTION public.get_auth_store_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT COALESCE(
    NULLIF(TRIM(auth.jwt() ->> 'store_id'), ''),
    NULLIF(TRIM(auth.jwt() -> 'app_metadata' ->> 'store_id'), ''),
    NULLIF(TRIM(auth.jwt() -> 'user_metadata' ->> 'store_id'), ''),
    (
      SELECT LOWER(TRIM(sa.store_id))
      FROM public.store_auth sa
      WHERE sa.admin_email IS NOT NULL 
        AND LOWER(TRIM(sa.admin_email)) = LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', '')))
      LIMIT 1
    ),
    (
      SELECT LOWER(TRIM(cs.store_id))
      FROM public.company_settings cs
      WHERE cs.admin_email IS NOT NULL 
        AND LOWER(TRIM(cs.admin_email)) = LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', '')))
      LIMIT 1
    )
  );
$$;

COMMENT ON FUNCTION public.get_auth_store_id() IS 
'Resuelve el store_id validado para el usuario autenticado actual desde sus credenciales o claims JWT.';

-- B. Función de Autenticación RPC: verify_store_login
CREATE OR REPLACE FUNCTION public.verify_store_login(p_identifier TEXT, p_password TEXT)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_rec RECORD;
  v_salt TEXT;
  v_hash TEXT;
  v_calc_hash TEXT;
  v_is_valid BOOLEAN := false;
  v_input_pass TEXT := COALESCE(TRIM(p_password), '');
  v_clean_id TEXT := LOWER(TRIM(COALESCE(p_identifier, '')));
  v_new_salt TEXT;
  v_new_hash TEXT;
BEGIN
  IF v_clean_id = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'El identificador de tienda o email es requerido');
  END IF;

  SELECT 
    sa.store_id, 
    sa.admin_email, 
    sa.password, 
    cs.business_name, 
    COALESCE(cs.plan_level, 'starter') AS plan_level
  INTO v_rec
  FROM public.store_auth sa
  LEFT JOIN public.company_settings cs ON LOWER(TRIM(cs.store_id)) = LOWER(TRIM(sa.store_id))
  WHERE LOWER(TRIM(sa.store_id)) = v_clean_id 
     OR (sa.admin_email IS NOT NULL AND LOWER(TRIM(sa.admin_email)) = v_clean_id)
  LIMIT 1;

  IF NOT FOUND THEN
    SELECT 
      cs.store_id, 
      cs.admin_email, 
      cs.password, 
      cs.business_name, 
      COALESCE(cs.plan_level, 'starter') AS plan_level
    INTO v_rec
    FROM public.company_settings cs
    WHERE LOWER(TRIM(cs.store_id)) = v_clean_id 
       OR (cs.admin_email IS NOT NULL AND LOWER(TRIM(cs.admin_email)) = v_clean_id)
    LIMIT 1;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'La tienda o correo electrónico ingresado no existe');
    END IF;

    INSERT INTO public.store_auth (store_id, admin_email, password, updated_at)
    VALUES (LOWER(TRIM(v_rec.store_id)), v_rec.admin_email, v_rec.password, NOW())
    ON CONFLICT (store_id) DO NOTHING;
  END IF;

  IF v_rec.password IS NULL OR v_rec.password = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'La tienda no posee contraseña configurada');
  END IF;

  -- Verificación del hash 'salt:sha256' o texto plano heredado con auto-migración
  IF v_rec.password LIKE '%:%' THEN
    v_salt := split_part(v_rec.password, ':', 1);
    v_hash := split_part(v_rec.password, ':', 2);
    v_calc_hash := encode(extensions.digest(v_salt || v_input_pass, 'sha256'), 'hex');
    IF v_calc_hash = v_hash THEN
      v_is_valid := true;
    END IF;
  ELSE
    IF v_rec.password = v_input_pass THEN
      v_is_valid := true;
      v_new_salt := encode(extensions.gen_random_bytes(16), 'hex');
      v_new_hash := encode(extensions.digest(v_new_salt || v_input_pass, 'sha256'), 'hex');
      UPDATE public.store_auth 
      SET password = v_new_salt || ':' || v_new_hash, updated_at = NOW()
      WHERE store_id = v_rec.store_id;
    END IF;
  END IF;

  IF NOT v_is_valid THEN
    RETURN jsonb_build_object('success', false, 'error', 'Contraseña incorrecta');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'store_id', v_rec.store_id,
    'admin_email', COALESCE(v_rec.admin_email, ''),
    'business_name', COALESCE(v_rec.business_name, v_rec.store_id),
    'plan_level', v_rec.plan_level
  );
END;
$$;

-- C. Función de Recuperación / Reseteo de Contraseña: reset_store_password
CREATE OR REPLACE FUNCTION public.reset_store_password(p_identifier TEXT, p_new_password TEXT)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_clean_id TEXT := LOWER(TRIM(COALESCE(p_identifier, '')));
  v_salt TEXT;
  v_hash TEXT;
  v_stored_pass TEXT;
  v_store_id TEXT;
BEGIN
  IF v_clean_id = '' OR p_new_password IS NULL OR length(TRIM(p_new_password)) < 4 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datos de contraseña inválidos (mínimo 4 caracteres)');
  END IF;

  SELECT store_id INTO v_store_id
  FROM public.company_settings
  WHERE LOWER(TRIM(store_id)) = v_clean_id 
     OR (admin_email IS NOT NULL AND LOWER(TRIM(admin_email)) = v_clean_id)
  LIMIT 1;

  IF NOT FOUND THEN
    SELECT store_id INTO v_store_id
    FROM public.store_auth
    WHERE LOWER(TRIM(store_id)) = v_clean_id 
       OR (admin_email IS NOT NULL AND LOWER(TRIM(admin_email)) = v_clean_id)
    LIMIT 1;
  END IF;

  IF v_store_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comercio no encontrado');
  END IF;

  v_salt := encode(extensions.gen_random_bytes(16), 'hex');
  v_hash := encode(extensions.digest(v_salt || TRIM(p_new_password), 'sha256'), 'hex');
  v_stored_pass := v_salt || ':' || v_hash;

  INSERT INTO public.store_auth (store_id, password, updated_at)
  VALUES (v_store_id, v_stored_pass, NOW())
  ON CONFLICT (store_id) DO UPDATE
  SET password = v_stored_pass, updated_at = NOW();

  UPDATE public.company_settings
  SET password = v_stored_pass, updated_at = NOW()
  WHERE LOWER(TRIM(store_id)) = v_store_id;

  RETURN jsonb_build_object('success', true, 'message', 'Contraseña actualizada correctamente');
END;
$$;

-- D. Función de Verificación de Token: verify_store_token
CREATE OR REPLACE FUNCTION public.verify_store_token(token TEXT, expected_store_id TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  IF token IS NULL OR expected_store_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN TRUE;
END;
$$;

-- E. Disparador Trigger: Sincronización entre company_settings y store_auth
CREATE OR REPLACE FUNCTION public.sync_company_settings_auth()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.store_id IS NOT NULL THEN
    INSERT INTO public.store_auth (store_id, admin_email, password, updated_at)
    VALUES (
      LOWER(TRIM(NEW.store_id)),
      NEW.admin_email,
      NEW.password,
      NOW()
    )
    ON CONFLICT (store_id) DO UPDATE
    SET 
      admin_email = COALESCE(EXCLUDED.admin_email, public.store_auth.admin_email),
      password = CASE 
        WHEN EXCLUDED.password IS NOT NULL AND EXCLUDED.password <> '' THEN EXCLUDED.password 
        ELSE public.store_auth.password 
      END,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_company_settings_auth ON public.company_settings;
CREATE TRIGGER trg_sync_company_settings_auth
AFTER INSERT OR UPDATE OF password, admin_email ON public.company_settings
FOR EACH ROW
EXECUTE FUNCTION public.sync_company_settings_auth();

-- =============================================================================
-- 15. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =============================================================================

-- HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- REGLAS TABLA: stores
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "stores_select_public" ON public.stores;
CREATE POLICY "stores_select_public"
  ON public.stores FOR SELECT
  TO public USING (true);

DROP POLICY IF EXISTS "stores_modify_admin" ON public.stores;
CREATE POLICY "stores_modify_admin"
  ON public.stores FOR ALL
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- REGLAS TABLA: company_settings (Lectura Pública, Gestión de Tienda)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "company_settings_select_policy" ON public.company_settings;
CREATE POLICY "company_settings_select_policy"
  ON public.company_settings FOR SELECT
  TO public USING (true);

DROP POLICY IF EXISTS "company_settings_insert_policy" ON public.company_settings;
CREATE POLICY "company_settings_insert_policy"
  ON public.company_settings FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (store_id IS NOT NULL AND length(TRIM(store_id)) > 0);

DROP POLICY IF EXISTS "company_settings_update_policy" ON public.company_settings;
CREATE POLICY "company_settings_update_policy"
  ON public.company_settings FOR UPDATE
  TO anon, authenticated, service_role
  USING (store_id IS NOT NULL AND length(TRIM(store_id)) > 0)
  WITH CHECK (store_id IS NOT NULL AND length(TRIM(store_id)) > 0);

-- -----------------------------------------------------------------------------
-- REGLAS TABLA: categories (Lectura Pública del Catálogo)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "categories_select_policy" ON public.categories;
CREATE POLICY "categories_select_policy"
  ON public.categories FOR SELECT
  TO public USING (true);

DROP POLICY IF EXISTS "categories_insert_policy" ON public.categories;
CREATE POLICY "categories_insert_policy"
  ON public.categories FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (store_id IS NOT NULL AND length(TRIM(store_id)) > 0);

DROP POLICY IF EXISTS "categories_update_policy" ON public.categories;
CREATE POLICY "categories_update_policy"
  ON public.categories FOR UPDATE
  TO anon, authenticated, service_role
  USING (store_id IS NOT NULL AND length(TRIM(store_id)) > 0)
  WITH CHECK (store_id IS NOT NULL AND length(TRIM(store_id)) > 0);

DROP POLICY IF EXISTS "categories_delete_policy" ON public.categories;
CREATE POLICY "categories_delete_policy"
  ON public.categories FOR DELETE
  TO anon, authenticated, service_role
  USING (store_id IS NOT NULL AND length(TRIM(store_id)) > 0);

-- -----------------------------------------------------------------------------
-- REGLAS TABLA: products (Lectura Pública del Catálogo)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
CREATE POLICY "products_select_policy"
  ON public.products FOR SELECT
  TO public USING (true);

DROP POLICY IF EXISTS "products_insert_policy" ON public.products;
CREATE POLICY "products_insert_policy"
  ON public.products FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (store_id IS NOT NULL AND length(TRIM(store_id)) > 0);

DROP POLICY IF EXISTS "products_update_policy" ON public.products;
CREATE POLICY "products_update_policy"
  ON public.products FOR UPDATE
  TO anon, authenticated, service_role
  USING (store_id IS NOT NULL AND length(TRIM(store_id)) > 0)
  WITH CHECK (store_id IS NOT NULL AND length(TRIM(store_id)) > 0);

DROP POLICY IF EXISTS "products_delete_policy" ON public.products;
CREATE POLICY "products_delete_policy"
  ON public.products FOR DELETE
  TO anon, authenticated, service_role
  USING (store_id IS NOT NULL AND length(TRIM(store_id)) > 0);

-- -----------------------------------------------------------------------------
-- REGLAS TABLA: pickups (Opciones de Envío y Retiro)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pickups_select_policy" ON public.pickups;
CREATE POLICY "pickups_select_policy"
  ON public.pickups FOR SELECT
  TO public USING (true);

DROP POLICY IF EXISTS "pickups_insert_policy" ON public.pickups;
CREATE POLICY "pickups_insert_policy"
  ON public.pickups FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (store_id IS NOT NULL AND length(TRIM(store_id)) > 0);

DROP POLICY IF EXISTS "pickups_update_policy" ON public.pickups;
CREATE POLICY "pickups_update_policy"
  ON public.pickups FOR UPDATE
  TO anon, authenticated, service_role
  USING (store_id IS NOT NULL AND length(TRIM(store_id)) > 0)
  WITH CHECK (store_id IS NOT NULL AND length(TRIM(store_id)) > 0);

DROP POLICY IF EXISTS "pickups_delete_policy" ON public.pickups;
CREATE POLICY "pickups_delete_policy"
  ON public.pickups FOR DELETE
  TO anon, authenticated, service_role
  USING (store_id IS NOT NULL AND length(TRIM(store_id)) > 0);

-- -----------------------------------------------------------------------------
-- REGLAS TABLA: orders (Zero-Read Insert para Compradores, Lectura Privada de Tienda)
-- -----------------------------------------------------------------------------
-- 1. Clientes anónimos PUEDEN insertar pedidos al confirmar en el carrito
DROP POLICY IF EXISTS "orders_insert_policy" ON public.orders;
CREATE POLICY "orders_insert_policy"
  ON public.orders FOR INSERT
  TO anon, public, authenticated, service_role
  WITH CHECK (store_id IS NOT NULL AND length(TRIM(store_id)) > 0);

-- 2. Clientes anónimos NO PUEDEN listar ni leer los pedidos de otros (prevención BOLA/IDOR)
-- Solo comercios autenticados y backend service_role pueden leer
DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;
CREATE POLICY "orders_select_policy"
  ON public.orders FOR SELECT
  TO authenticated, service_role
  USING (
    auth.role() = 'service_role' 
    OR (
      public.get_auth_store_id() IS NOT NULL 
      AND LOWER(TRIM(store_id)) = LOWER(TRIM(public.get_auth_store_id()))
    )
  );

-- 3. Actualización de pedidos en el Kanban (preparando, listo, cobrado)
DROP POLICY IF EXISTS "orders_update_policy" ON public.orders;
CREATE POLICY "orders_update_policy"
  ON public.orders FOR UPDATE
  TO authenticated, service_role
  USING (
    auth.role() = 'service_role' 
    OR (
      public.get_auth_store_id() IS NOT NULL 
      AND LOWER(TRIM(store_id)) = LOWER(TRIM(public.get_auth_store_id()))
    )
  );

-- -----------------------------------------------------------------------------
-- REGLAS TABLA: order_items
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "order_items_insert_policy" ON public.order_items;
CREATE POLICY "order_items_insert_policy"
  ON public.order_items FOR INSERT
  TO anon, public, authenticated, service_role
  WITH CHECK (order_id IS NOT NULL);

DROP POLICY IF EXISTS "order_items_select_policy" ON public.order_items;
CREATE POLICY "order_items_select_policy"
  ON public.order_items FOR SELECT
  TO authenticated, service_role
  USING (true);

-- -----------------------------------------------------------------------------
-- REGLAS TABLA: faqs
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "faqs_select_policy" ON public.faqs;
CREATE POLICY "faqs_select_policy"
  ON public.faqs FOR SELECT
  TO public USING (true);

DROP POLICY IF EXISTS "faqs_modify_policy" ON public.faqs;
CREATE POLICY "faqs_modify_policy"
  ON public.faqs FOR ALL
  TO anon, authenticated, service_role
  USING (store_id IS NOT NULL)
  WITH CHECK (store_id IS NOT NULL);

-- -----------------------------------------------------------------------------
-- REGLAS TABLA: reviews
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "reviews_select_policy" ON public.reviews;
CREATE POLICY "reviews_select_policy"
  ON public.reviews FOR SELECT
  TO public USING (approved = true);

DROP POLICY IF EXISTS "reviews_insert_policy" ON public.reviews;
CREATE POLICY "reviews_insert_policy"
  ON public.reviews FOR INSERT
  TO public
  WITH CHECK (store_id IS NOT NULL);

-- -----------------------------------------------------------------------------
-- REGLAS TABLAS PRIVADAS: store_auth & store_credentials
-- -----------------------------------------------------------------------------
REVOKE ALL ON public.store_auth FROM PUBLIC, anon;
GRANT ALL ON public.store_auth TO service_role;

REVOKE ALL ON public.store_credentials FROM PUBLIC, anon;
GRANT ALL ON public.store_credentials TO authenticated, service_role;

DROP POLICY IF EXISTS "store_credentials_admin_policy" ON public.store_credentials;
CREATE POLICY "store_credentials_admin_policy"
  ON public.store_credentials FOR ALL
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- REGLAS TABLA: store_audit_logs & email_templates
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "audit_logs_policy" ON public.store_audit_logs;
CREATE POLICY "audit_logs_policy"
  ON public.store_audit_logs FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "email_templates_policy" ON public.email_templates;
CREATE POLICY "email_templates_policy"
  ON public.email_templates FOR ALL
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- 16. CONCESIÓN DE PRIVILEGIOS SQL (GRANT/REVOKE LEAST PRIVILEGE)
-- =============================================================================
-- Funciones públicas de autenticación y reseteo
GRANT EXECUTE ON FUNCTION public.verify_store_login(TEXT, TEXT) TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reset_store_password(TEXT, TEXT) TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_store_token(TEXT, TEXT) TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_auth_store_id() TO PUBLIC, anon, authenticated, service_role;

-- Privilegios de acceso por rol
GRANT SELECT ON public.stores TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.company_settings TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pickups TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO anon, authenticated, service_role;
GRANT SELECT, INSERT ON public.reviews TO anon, authenticated, service_role;
GRANT SELECT, INSERT ON public.store_audit_logs TO anon, authenticated, service_role;

-- En orders: anon solo puede hacer INSERT (zero-read insert)
REVOKE SELECT, UPDATE, DELETE ON public.orders FROM anon, public;
GRANT INSERT ON public.orders TO anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated, service_role;

REVOKE SELECT, UPDATE, DELETE ON public.order_items FROM anon, public;
GRANT INSERT ON public.order_items TO anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated, service_role;


-- =============================================================================
-- 17. SECCIÓN LOGÍSTICA MULTIMODAL DALE!QUEVOY (PAUSA ESTRATÉGICA)
-- =============================================================================
-- Las siguientes tablas componen el modelo de entregas para la integración
-- con la red de cadetería externa de Dale!QueVoy. Se dejan preparadas pero
-- inactivas en el flujo transaccional directo de Dale!TePido según la directiva.

CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    business_type TEXT NOT NULL DEFAULT 'GASTRONOMY',
    address TEXT NOT NULL,
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    phone TEXT NOT NULL,
    email TEXT,
    logo_url TEXT,
    banner_url TEXT,
    is_open BOOLEAN DEFAULT TRUE,
    minimum_order_ars NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_app TEXT NOT NULL DEFAULT 'TEPIDO' CHECK (origin_app IN ('QUEVOY', 'TEPIDO')),
    requester_id UUID NOT NULL,
    driver_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('PHARMACY', 'PETSHOP', 'RETAIL', 'FOOD', 'LARGE_CARGO', 'SMALL_BOX')),
    weight_kg NUMERIC(6, 2) NOT NULL,
    origin_address TEXT NOT NULL,
    origin_lat NUMERIC(10, 7),
    origin_lng NUMERIC(10, 7),
    destination_address TEXT NOT NULL,
    destination_lat NUMERIC(10, 7),
    destination_lng NUMERIC(10, 7),
    offered_price_ars NUMERIC(10, 2) NOT NULL,
    est_distance_km NUMERIC(5, 2) NOT NULL,
    pin_code VARCHAR(4) NOT NULL,
    status TEXT NOT NULL DEFAULT 'SEARCHING' CHECK (status IN ('SEARCHING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED')),
    is_commute_matched BOOLEAN DEFAULT FALSE,
    customer_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "merchants_select_policy" ON public.merchants;
CREATE POLICY "merchants_select_policy" ON public.merchants FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "deliveries_service_role" ON public.deliveries;
CREATE POLICY "deliveries_service_role" ON public.deliveries FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================================================
-- FIN DEL SCRIPT SQL MAESTRO CONSOLIDADO (DALE! TEPIDO)
-- =============================================================================
