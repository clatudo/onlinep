const { Client } = require('pg');

async function multiFix() {
  const configs = [
    // 1. Pooler com User com sufixo
    {
      user: 'postgres.yqhdxzihagyxaqiihdzt',
      host: 'aws-0-us-west-2.pooler.supabase.com',
      database: 'postgres',
      password: '@252SuP!',
      port: 6543,
      ssl: { rejectUnauthorized: false }
    },
    // 2. Pooler com User simples
    {
      user: 'postgres',
      host: 'aws-0-us-west-2.pooler.supabase.com',
      database: 'postgres',
      password: '@252SuP!',
      port: 6543,
      ssl: { rejectUnauthorized: false }
    },
    // 3. Direct com User simples
    {
      user: 'postgres',
      host: 'db.yqhdxzihagyxaqiihdzt.supabase.co',
      database: 'postgres',
      password: '@252SuP!',
      port: 5432,
      ssl: { rejectUnauthorized: false }
    }
  ];

  for (const config of configs) {
    const client = new Client(config);
    try {
      console.log(`Trying connection to ${config.host}:${config.port} as ${config.user}...`);
      await client.connect();
      console.log('Connected!');
      
      await client.query(`
        ALTER TABLE contracts 
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'signed',
        ADD COLUMN IF NOT EXISTS plan_id TEXT,
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
      `);
      
      console.log('SUCCESS: Schema updated.');
      await client.end();
      return; // Exit if success
    } catch (err) {
      console.error(`Failed: ${err.message}`);
      await client.end().catch(() => {});
    }
  }
  console.error('All connection attempts failed.');
}

multiFix();
