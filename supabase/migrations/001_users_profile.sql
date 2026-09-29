-- Migración 001: tabla users_profile
-- Ejecutar en: Supabase Dashboard → SQL Editor

-- 1. Tabla de perfil del usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  service_description TEXT NOT NULL,
  service_promise TEXT,
  social_proof TEXT,
  ideal_client TEXT,
  communication_tone TEXT NOT NULL DEFAULT 'profesional'
    CHECK (communication_tone IN ('profesional', 'cercano', 'directo', 'formal')),
  business_name TEXT,
  logo_url TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS
CREATE POLICY "usuarios ven su propio perfil"
  ON public.users_profile FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "usuarios crean su propio perfil"
  ON public.users_profile FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "usuarios actualizan su propio perfil"
  ON public.users_profile FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 4. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_profile_updated_at
  BEFORE UPDATE ON public.users_profile
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Función para crear el perfil vacío al registrarse
-- (opcional: se puede llamar desde la app también)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- No creamos el perfil automáticamente; el onboarding lo hace.
  -- Esta función está preparada para usarse si se necesita en el futuro.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
