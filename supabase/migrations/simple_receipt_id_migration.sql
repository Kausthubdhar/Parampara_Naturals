-- Simple migration to add receipt_id field
-- This version is more compatible with different PostgreSQL versions

-- Step 1: Add the receipt_id column
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS receipt_id text;

-- Step 2: Create a unique index on receipt_id
DROP INDEX IF EXISTS idx_sales_receipt_id;
CREATE UNIQUE INDEX idx_sales_receipt_id ON public.sales(receipt_id);

-- Step 3: Create a function to generate receipt IDs
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

-- Step 4: Populate receipt_id for existing sales
DO $$
DECLARE
    sale_record RECORD;
    new_receipt_id text;
    is_unique boolean;
    attempts integer;
BEGIN
    FOR sale_record IN 
        SELECT id, user_id 
        FROM public.sales 
        WHERE receipt_id IS NULL 
        ORDER BY created_at ASC
    LOOP
        attempts := 0;
        is_unique := false;
        
        -- Try to generate a unique receipt ID
        WHILE NOT is_unique AND attempts < 10 LOOP
            new_receipt_id := generate_receipt_id();
            
            -- Check if this receipt ID already exists for this user
            SELECT NOT EXISTS(
                SELECT 1 FROM public.sales 
                WHERE receipt_id = new_receipt_id 
                AND user_id = sale_record.user_id
            ) INTO is_unique;
            
            attempts := attempts + 1;
        END LOOP;
        
        -- Update the sale with the new receipt ID
        IF is_unique THEN
            UPDATE public.sales 
            SET receipt_id = new_receipt_id 
            WHERE id = sale_record.id;
        ELSE
            -- If we can't generate a unique ID, use a fallback with timestamp
            UPDATE public.sales 
            SET receipt_id = substr(replace(sale_record.id::text, '-', ''), 1, 8)
            WHERE id = sale_record.id;
        END IF;
    END LOOP;
END $$;

-- Step 5: Create a trigger to automatically generate receipt_id for new sales
CREATE OR REPLACE FUNCTION auto_generate_receipt_id()
RETURNS trigger AS $$
DECLARE
    new_receipt_id text;
    is_unique boolean;
    attempts integer;
BEGIN
    -- Only generate if receipt_id is not provided
    IF NEW.receipt_id IS NULL THEN
        attempts := 0;
        is_unique := false;
        
        -- Try to generate a unique receipt ID
        WHILE NOT is_unique AND attempts < 10 LOOP
            new_receipt_id := generate_receipt_id();
            
            -- Check if this receipt ID already exists for this user
            SELECT NOT EXISTS(
                SELECT 1 FROM public.sales 
                WHERE receipt_id = new_receipt_id 
                AND user_id = NEW.user_id
            ) INTO is_unique;
            
            attempts := attempts + 1;
        END LOOP;
        
        -- Set the receipt ID
        IF is_unique THEN
            NEW.receipt_id := new_receipt_id;
        ELSE
            -- Fallback: use first 8 characters of the UUID
            NEW.receipt_id := substr(replace(NEW.id::text, '-', ''), 1, 8);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_receipt_id ON public.sales;
CREATE TRIGGER trigger_auto_generate_receipt_id
    BEFORE INSERT ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_receipt_id();

-- Step 6: Verify the migration
SELECT 
    COUNT(*) as total_sales,
    COUNT(receipt_id) as sales_with_receipt_id,
    COUNT(*) - COUNT(receipt_id) as sales_without_receipt_id
FROM public.sales;
