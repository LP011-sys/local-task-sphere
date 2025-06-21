
-- Add translation-related columns to messages table
ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS original_text TEXT,
  ADD COLUMN IF NOT EXISTS translated_text TEXT,
  ADD COLUMN IF NOT EXISTS translated_to TEXT,
  ADD COLUMN IF NOT EXISTS source_language TEXT DEFAULT 'en';

-- Update the content column to be the display text (original or translated)
-- The original_text will store the sender's original message
-- The translated_text will store the translation for the receiver
-- The content column will be used for display purposes

-- Add index for better performance on language queries
CREATE INDEX IF NOT EXISTS idx_messages_translated_to ON public.messages(translated_to);
CREATE INDEX IF NOT EXISTS idx_messages_source_language ON public.messages(source_language);
