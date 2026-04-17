const { Client } = require('pg');

async function fixSchemaDirect() {
  const client = new Client({
    user: 'postgres',
    host: 'db.yqhdxzihagyxaqiihdzt.supabase.co',
    database: 'postgres',
    password: '@252SuP!', 
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected DIRECTLY to DB');
    
    await client.query(`
      ALTER TABLE contracts 
      ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ DEFAULT now(),
      ADD COLUMN IF NOT EXISTS ip_address TEXT,
      ADD COLUMN IF NOT EXISTS user_agent TEXT,
      ADD COLUMN IF NOT EXISTS terms_version TEXT;
    `);
    
    console.log('Schema updated successfully via Direct Connection!');
  } catch (err) {
    console.error('Error updating schema:', err);
  } finally {
    await client.end();
  }
}

fixSchemaDirect();
