-- Add columns for news articles to the existing table
ALTER TABLE public."Motolab 09/24"
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'NOTICIA';

-- Enable RLS (already should be but ensuring)
ALTER TABLE public."Motolab 09/24" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (news should be publicly readable)
CREATE POLICY "News articles are publicly readable"
ON public."Motolab 09/24"
FOR SELECT
USING (true);