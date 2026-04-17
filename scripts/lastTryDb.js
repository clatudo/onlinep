const { Client } = require('pg');

async function fixSchemaLastTry() {
  const hosts = [
    'aws-0-us-west-2.pooler.supabase.com',
    'yqhdxzihagyxaqiihdzt.supabase.co'
  ];

  for (const host of hosts) {
    const isPooler = host.includes('pooler');
    const client = new Client({
      user: isPooler ? 'postgres.yqhdxzihagyxaqiihdzt' : 'postgres',
      host: host,
      database: 'postgres',
      password: '@252SuP!', 
      port: isPooler ? 6543 : 5432,
      ssl: { rejectUnauthorized: false }
    });

    try {
      console.log(`Trying ${host}:${isPooler ? 6543 : 5432}...`);
      await client.connect();
      console.log('Connected!');
      await client.query(`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'signed', ADD COLUMN IF NOT EXISTS plan_id TEXT, ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);`);
      console.log('SUCCESS!');
      await client.end();
      return;
    } catch (err) {
      console.error(`Host ${host} failed: ${err.message}`);
      await client.end().catch(() => {});
    }
  }
}

fixSchemaLastTry();
