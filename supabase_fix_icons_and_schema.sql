-- =============================================================================
-- DALE! TEPIDO (CLICKAPP) — FIX DE ÍCONOS, COLUMNAS DE CONFIGURACIÓN Y STORAGE
-- Proyecto Nuevo Supabase: odmwquntubniqbvkecna.supabase.co
-- Fecha: 20 de Noviembre de 2026
-- =============================================================================
-- Script 100% idempotente. Ejecutar en el SQL Editor de Supabase.
-- Resuelve:
--   1. Columnas faltantes en company_settings (emoji, branding, redes, banners, pagos).
--   2. Columna rubro en categories.
--   3. Normalización de íconos/emojis por defecto en filas vacías.
--   4. Creación de bucket público 'store-assets' en Supabase Storage + políticas RLS.
--   5. Recarga inmediata del caché de esquema de PostgREST.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. COMPLETAR COLUMNAS EN public.company_settings
-- -----------------------------------------------------------------------------
ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '🏪',
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS direccion TEXT,
  ADD COLUMN IF NOT EXISTS horario TEXT,
  ADD COLUMN IF NOT EXISTS h1 TEXT,
  ADD COLUMN IF NOT EXISTS h2 TEXT,
  ADD COLUMN IF NOT EXISTS "desc" TEXT,
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS font TEXT,
  ADD COLUMN IF NOT EXISTS font_body TEXT,
  ADD COLUMN IF NOT EXISTS bg TEXT,
  ADD COLUMN IF NOT EXISTS qr_code TEXT,
  ADD COLUMN IF NOT EXISTS subrubro TEXT,
  ADD COLUMN IF NOT EXISTS banner_mode TEXT DEFAULT 'double',
  ADD COLUMN IF NOT EXISTS banner1_bg TEXT DEFAULT '#1C1C1E',
  ADD COLUMN IF NOT EXISTS banner1_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS banner2_bg TEXT DEFAULT '#1C1C1E',
  ADD COLUMN IF NOT EXISTS banner2_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS pay_cash BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS pay_transfer BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS pay_agreement BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS gerente_nombre TEXT,
  ADD COLUMN IF NOT EXISTS gerente_email TEXT,
  ADD COLUMN IF NOT EXISTS gerente_frecuencia TEXT,
  ADD COLUMN IF NOT EXISTS social_web TEXT,
  ADD COLUMN IF NOT EXISTS social_ig TEXT,
  ADD COLUMN IF NOT EXISTS social_fb TEXT,
  ADD COLUMN IF NOT EXISTS social_x TEXT,
  ADD COLUMN IF NOT EXISTS social_ml TEXT,
  ADD COLUMN IF NOT EXISTS social_tn TEXT,
  ADD COLUMN IF NOT EXISTS social_maps TEXT,
  ADD COLUMN IF NOT EXISTS socials JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS design_settings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS night_guard_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS latest_invoice_url TEXT,
  ADD COLUMN IF NOT EXISTS latest_invoice_date TIMESTAMPTZ;

-- -----------------------------------------------------------------------------
-- 2. COMPLETAR COLUMNAS EN public.categories
-- -----------------------------------------------------------------------------
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS rubro TEXT;

-- -----------------------------------------------------------------------------
-- 3. NORMALIZAR EMOJIS / ÍCONOS NULOS O VACÍOS
-- -----------------------------------------------------------------------------
UPDATE public.company_settings
SET emoji = '🏪'
WHERE emoji IS NULL OR TRIM(emoji) = '';

UPDATE public.categories
SET emoji = '📦'
WHERE emoji IS NULL OR TRIM(emoji) = '';

UPDATE public.products
SET emoji = '🏷️'
WHERE emoji IS NULL OR TRIM(emoji) = '';

-- -----------------------------------------------------------------------------
-- 4. BUCKET DE STORAGE PÚBLICO ('store-assets') + POLÍTICAS RLS
-- -----------------------------------------------------------------------------
-- Permite subir logos, íconos de tiendas, banners y fotos de productos en
-- Supabase Storage con lectura pública garantizada.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-assets',
  'store-assets',
  TRUE,
  5242880, -- 5 MB máx por archivo
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif', 'image/x-icon']
)
ON CONFLICT (id) DO UPDATE
SET
  public = TRUE,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Lectura pública de todos los íconos/logos/imágenes en 'store-assets'
DROP POLICY IF EXISTS "store_assets_public_read" ON storage.objects;
CREATE POLICY "store_assets_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'store-assets');

-- Subida permitida para comercios autenticados, rol anon (gestión dashboard) y backend
DROP POLICY IF EXISTS "store_assets_insert" ON storage.objects;
CREATE POLICY "store_assets_insert"
  ON storage.objects FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (bucket_id = 'store-assets');

-- Actualización / reemplazo de logos e íconos
DROP POLICY IF EXISTS "store_assets_update" ON storage.objects;
CREATE POLICY "store_assets_update"
  ON storage.objects FOR UPDATE
  TO anon, authenticated, service_role
  USING (bucket_id = 'store-assets')
  WITH CHECK (bucket_id = 'store-assets');

-- Eliminación restringida a autenticados y backend
DROP POLICY IF EXISTS "store_assets_delete" ON storage.objects;
CREATE POLICY "store_assets_delete"
  ON storage.objects FOR DELETE
  TO authenticated, service_role
  USING (bucket_id = 'store-assets');

-- -----------------------------------------------------------------------------
-- 5. RECARGAR CACHÉ DE POSTGREST
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
