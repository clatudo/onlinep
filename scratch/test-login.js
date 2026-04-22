const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

async function test() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Testing auth with standard headers...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com', // Using a dummy to see the error message
    password: 'wrongpassword'
  });

  console.log("Result:", { error: error ? error.message : null });
}

test();
