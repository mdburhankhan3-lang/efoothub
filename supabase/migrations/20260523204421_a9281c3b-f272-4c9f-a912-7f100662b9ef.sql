
-- Create public bucket for listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Listing images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload own listing images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own listing images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listing-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own listing images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
