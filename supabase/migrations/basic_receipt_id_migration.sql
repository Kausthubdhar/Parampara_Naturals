-- Basic migration to add receipt_id field
-- This is the simplest version that should work on all PostgreSQL versions

-- Step 1: Add the receipt_id column
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS receipt_id text;

-- Step 2: Create a function to generate receipt IDs
CREATE OR REPLACE FUNCTION generate_receipt_id()
RETURNS text AS $$
DECLARE
    chars text := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    result text := '';
    i integer;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Populate receipt_id for existing sales
DO $$
DECLARE
    sale_record RECORD;
    new_receipt_id text;
BEGIN
    FOR sale_record IN 
        SELECT id, user_id 
        FROM public.sales 
        WHERE receipt_id IS NULL 
        ORDER BY created_at ASC
    LOOP
        -- Generate a receipt ID
        new_receipt_id := generate_receipt_id();
        
        -- Update the sale with the new receipt ID
        UPDATE public.sales 
        SET receipt_id = new_receipt_id 
        WHERE id = sale_record.id;
    END LOOP;
END $$;

-- Step 4: Verify the migration
SELECT 
    COUNT(*) as total_sales,
    COUNT(receipt_id) as sales_with_receipt_id,
    COUNT(*) - COUNT(receipt_id) as sales_without_receipt_id
FROM public.sales;
