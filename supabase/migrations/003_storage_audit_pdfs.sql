-- Bucket privado para PDFs de auditoría
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audit-pdfs',
  'audit-pdfs',
  false,
  10485760, -- 10 MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Política: usuarios autenticados pueden subir PDFs a su propio prefijo
CREATE POLICY "Users can upload their own audit PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audit-pdfs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: usuarios autenticados pueden leer sus propios PDFs
CREATE POLICY "Users can read their own audit PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audit-pdfs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: usuarios autenticados pueden eliminar sus propios PDFs
CREATE POLICY "Users can delete their own audit PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audit-pdfs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
