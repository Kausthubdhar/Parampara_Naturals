# Database Migration Instructions

## Step 1: Run the Migration in Supabase

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/complete_receipt_id_migration.sql`
4. Click "Run" to execute the migration

## Step 2: Verify the Migration

After running the migration, you should see:
- All existing sales now have a `receipt_id` field
- New sales will automatically get short receipt IDs
- The receipt IDs will be 8 characters long (e.g., "A7B9C2D4")

## Step 3: Test the Application

1. Create a new sale in your application
2. Check that the receipt shows a short ID like "A7B9C2D4" instead of the long UUID
3. Verify that existing sales now show short IDs

## Troubleshooting

If you still see long IDs:
1. Check that the migration ran successfully
2. Clear your browser cache
3. Restart your development server
4. Check the browser console for any errors

## What the Migration Does

1. **Adds `receipt_id` column** to the sales table
2. **Generates short IDs** for all existing sales
3. **Creates a trigger** to auto-generate IDs for new sales
4. **Ensures uniqueness** within each user's sales
5. **Validates format** (8 alphanumeric characters)
