-- Add receipt_id field to sales table
-- This will store short 8-character receipt IDs for better user experience

-- Add the receipt_id column
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS receipt_id text;

-- Create a unique index on receipt_id to ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_receipt_id ON public.sales(receipt_id);

-- Add a check constraint to ensure receipt_id is exactly 8 characters
ALTER TABLE public.sales 
ADD CONSTRAINT check_receipt_id_length 
CHECK (receipt_id IS NULL OR length(receipt_id) = 8);

-- Add a check constraint to ensure receipt_id contains only alphanumeric characters
ALTER TABLE public.sales 
ADD CONSTRAINT check_receipt_id_format 
CHECK (receipt_id IS NULL OR receipt_id ~ '^[0-9A-Z]{8}$');
