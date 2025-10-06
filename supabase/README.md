# Supabase Database Files

This folder contains the essential database files for the Parampara Naturals POS system.

## Files Overview

### Core Database Files
- **`schema.sql`** - Main database schema with all tables, relationships, and constraints
- **`seed.sql`** - Sample data for testing and development

### Feature Migration Scripts
- **`add_cash_fields_simple.sql`** - Adds cash payment tracking fields to sales table
  - Adds `cash_received` and `change_given` columns
  - Includes indexes for better performance
  - Safe to run multiple times

- **`add_first_last_name_to_customers_safe.sql`** - Adds separate first/last name fields to customers table
  - Adds `first_name` and `last_name` columns
  - Migrates existing name data
  - Makes last_name optional
  - Safe to run multiple times

## Usage

1. **Initial Setup**: Run `schema.sql` first to create the database structure
2. **Sample Data**: Run `seed.sql` to populate with test data
3. **Feature Updates**: Run the migration scripts as needed for new features

## Notes

- All migration scripts are designed to be safe to run multiple times
- Scripts include proper error handling and constraint management
- Database changes are backward compatible
