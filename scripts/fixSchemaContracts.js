const { Client } = require('pg');

async function fixSchema() {
  // Configurações extraídas do seu DATABASE_URL
  const client = new Client({
    user: 'postgres.yqhdxzihagyxaqiihdzt',
    host: 'aws-0-us-west-2.pooler.supabase.com',
    database: 'postgres',
    password: '@252SuP!', // Senha pura
    port: 6543,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to DB');
    
    await client.query(`
      ALTER TABLE contracts 
      ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ DEFAULT now(),
      ADD COLUMN IF NOT EXISTS ip_address TEXT,
      ADD COLUMN IF NOT EXISTS user_agent TEXT,
      ADD COLUMN IF NOT EXISTS terms_version TEXT;
    `);
    
    console.log('Schema updated successfully!');
  } catch (err) {
    console.error('Error updating schema:', err);
  } finally {
    await client.end();
  }
}

fixSchema();
