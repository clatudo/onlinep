const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugJoin() {
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      id,
      subscriptions (
        plan_id
      )
    `)
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Result structure:', JSON.stringify(data, null, 2));
  }
}

debugJoin();
