-- Migración 002: tablas principales del modelo de datos
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Requiere: 001_users_profile.sql ejecutada previamente

-- ============================================================
-- 1. BUSINESSES — negocios encontrados en búsqueda
-- ============================================================
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT,
  website TEXT,
  category TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT businesses_user_place_unique UNIQUE (user_id, place_id)
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "businesses_select_own"
  ON public.businesses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "businesses_insert_own"
  ON public.businesses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "businesses_update_own"
  ON public.businesses FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "businesses_delete_own"
  ON public.businesses FOR DELETE USING (user_id = auth.uid());

CREATE OR REPLACE TRIGGER businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 2. SCORES — puntuación calculada por negocio
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  breakdown JSONB NOT NULL DEFAULT '[]',
  -- breakdown: [{signal: string, points: number, source: string, measured_at: string}]
  pagespeed_data JSONB,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scores_select_own"
  ON public.scores FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "scores_insert_own"
  ON public.scores FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "scores_update_own"
  ON public.scores FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "scores_delete_own"
  ON public.scores FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 3. SIGNAL_WEIGHTS — pesos personalizados por usuario
-- ============================================================
-- signal_key valores válidos: no_website | slow_mobile | no_https |
--   not_mobile_friendly | no_booking_or_whatsapp | low_rating | unanswered_reviews
CREATE TABLE IF NOT EXISTS public.signal_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_key TEXT NOT NULL,
  weight NUMERIC NOT NULL CHECK (weight >= 0 AND weight <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT signal_weights_user_key_unique UNIQUE (user_id, signal_key)
);

ALTER TABLE public.signal_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signal_weights_select_own"
  ON public.signal_weights FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "signal_weights_insert_own"
  ON public.signal_weights FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "signal_weights_update_own"
  ON public.signal_weights FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "signal_weights_delete_own"
  ON public.signal_weights FOR DELETE USING (user_id = auth.uid());

CREATE OR REPLACE TRIGGER signal_weights_updated_at
  BEFORE UPDATE ON public.signal_weights
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 4. PROSPECTS — pipeline kanban
-- ============================================================
-- status valores válidos: nuevo | contactado | respondio | reunion | ganado | perdido
CREATE TABLE IF NOT EXISTS public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'nuevo'
    CHECK (status IN ('nuevo', 'contactado', 'respondio', 'reunion', 'ganado', 'perdido')),
  notes TEXT,
  next_contact_at TIMESTAMPTZ,
  contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT prospects_user_business_unique UNIQUE (user_id, business_id)
);

ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prospects_select_own"
  ON public.prospects FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "prospects_insert_own"
  ON public.prospects FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "prospects_update_own"
  ON public.prospects FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "prospects_delete_own"
  ON public.prospects FOR DELETE USING (user_id = auth.uid());

CREATE OR REPLACE TRIGGER prospects_updated_at
  BEFORE UPDATE ON public.prospects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 5. AUDITS — auditorías generadas en PDF
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  score_id UUID REFERENCES public.scores(id) ON DELETE SET NULL,
  pdf_url TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audits_select_own"
  ON public.audits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "audits_insert_own"
  ON public.audits FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "audits_update_own"
  ON public.audits FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "audits_delete_own"
  ON public.audits FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 6. MESSAGES — mensajes generados por canal
-- ============================================================
-- channel valores válidos: whatsapp | llamada | email
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'llamada', 'email')),
  content TEXT NOT NULL,
  variant INTEGER NOT NULL DEFAULT 1 CHECK (variant >= 1 AND variant <= 3),
  is_followup BOOLEAN NOT NULL DEFAULT FALSE,
  followup_day INTEGER CHECK (followup_day IN (3, 7)),
  copied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_own"
  ON public.messages FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "messages_insert_own"
  ON public.messages FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "messages_update_own"
  ON public.messages FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "messages_delete_own"
  ON public.messages FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 7. USAGE_LOGS — registro de uso y coste estimado de API
-- ============================================================
-- action valores válidos: search | audit | message | pagespeed
-- INSERT solo via service role (admin.ts) — sin política INSERT para usuarios
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('search', 'audit', 'message', 'pagespeed')),
  metadata JSONB NOT NULL DEFAULT '{}',
  estimated_cost_usd NUMERIC(10, 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_logs_select_own"
  ON public.usage_logs FOR SELECT USING (user_id = auth.uid());
-- Sin política INSERT/UPDATE/DELETE para usuarios: solo service role puede escribir

-- ============================================================
-- 8. SUBSCRIPTIONS — suscripciones Stripe por usuario
-- ============================================================
-- plan valores válidos: free | pro | agency
-- status valores válidos: active | canceled | past_due | trialing
-- INSERT/UPDATE solo via service role (webhooks Stripe) — sin políticas de escritura para usuarios
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT subscriptions_user_unique UNIQUE (user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
-- Sin política INSERT/UPDATE/DELETE para usuarios: solo service role puede escribir

CREATE OR REPLACE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 9. STRIPE_EVENTS — idempotencia de webhooks Stripe
-- ============================================================
-- PK = Stripe event id (evt_...) — previene doble procesado
-- Sin políticas de usuario: acceso exclusivo via service role (admin.ts)
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
-- Sin políticas: solo service role (admin.ts) puede leer/escribir

-- ============================================================
-- 10. ADMIN_USERS — usuarios con rol administrador
-- ============================================================
-- Sin políticas de usuario: acceso exclusivo via service role (admin.ts)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- Sin políticas: solo service role (admin.ts) puede leer/escribir

-- ============================================================
-- VERIFICACIÓN MANUAL DE RLS
-- ============================================================
-- Para verificar que RLS funciona correctamente:
-- 1. Crear dos usuarios A y B usando magic link en la app
-- 2. Loguearse como usuario A e insertar un business:
--    INSERT INTO businesses (user_id, place_id, name) VALUES (auth.uid(), 'test_place', 'Test');
-- 3. Loguearse como usuario B y ejecutar:
--    SELECT * FROM businesses;
-- 4. Resultado esperado: 0 filas (usuario B no ve datos de A)
-- 5. Repetir para prospects, scores, audits, messages
