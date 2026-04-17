const { Client } = require('pg');

async function fixSchemaPooler() {
  const connectionString = 'postgresql://postgres.yqhdxzihagyxaqiihdzt:@252SuP!@aws-0-us-west-2.pooler.supabase.com:6543/postgres';
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected via POOLER String');
    
    await client.query(`
      ALTER TABLE contracts 
      ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ DEFAULT now(),
      ADD COLUMN IF NOT EXISTS ip_address TEXT,
      ADD COLUMN IF NOT EXISTS user_agent TEXT,
      ADD COLUMN IF NOT EXISTS terms_version TEXT;
    `);
    
    console.log('Schema updated successfully via Pooler String!');
  } catch (err) {
    console.error('Error updating schema:', err);
  } finally {
    await client.end();
  }
}

fixSchemaPooler();
