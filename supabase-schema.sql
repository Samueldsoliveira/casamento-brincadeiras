-- ============================================================
-- Schema Supabase — Casamento Samuel & Margerie (Brincadeiras)
-- Execute este SQL no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de convidados
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Checklist concluídos por convidado
CREATE TABLE IF NOT EXISTS checklist_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guest_id, item_key)
);

-- 3. Submissões de fotos/vídeos
--    challenge_key = NULL → Cápsula do Tempo (post livre)
--    challenge_key = 'primeira_danca' etc → Desafio das Fotos
CREATE TABLE IF NOT EXISTS photo_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  challenge_key TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Likes nas submissões
CREATE TABLE IF NOT EXISTS submission_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES photo_submissions(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, guest_id)
);

-- 5. Resultado do quiz Match
CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  samuel_pct INTEGER NOT NULL,
  margerie_pct INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guest_id)
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública de todas as tabelas
CREATE POLICY "public_read_guests" ON guests FOR SELECT USING (true);
CREATE POLICY "public_read_checklist" ON checklist_completions FOR SELECT USING (true);
CREATE POLICY "public_read_submissions" ON photo_submissions FOR SELECT USING (true);
CREATE POLICY "public_read_likes" ON submission_likes FOR SELECT USING (true);
CREATE POLICY "public_read_match" ON match_results FOR SELECT USING (true);

-- Permitir inserção pública (sem auth)
CREATE POLICY "public_insert_guests" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_checklist" ON checklist_completions FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_submissions" ON photo_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_likes" ON submission_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_match" ON match_results FOR INSERT WITH CHECK (true);

-- Permitir deleção pública (checklist toggle e like toggle)
CREATE POLICY "public_delete_checklist" ON checklist_completions FOR DELETE USING (true);
CREATE POLICY "public_delete_likes" ON submission_likes FOR DELETE USING (true);

-- Upsert para match_results
CREATE POLICY "public_update_match" ON match_results FOR UPDATE USING (true);

-- ============================================================
-- Storage bucket: wedding-media
-- ============================================================
-- No painel do Supabase:
-- 1. Vá em Storage → Create bucket
-- 2. Nome: wedding-media
-- 3. Marque "Public bucket" (permitir leitura pública)
-- 4. Em Policies, adicione uma policy de INSERT para "anon" (sem auth)

-- Ou execute:
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-media', 'wedding-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'wedding-media');

CREATE POLICY "public_read_storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'wedding-media');
