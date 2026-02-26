const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSecurityAccess() {
    // 1. Login as Security
    const email = 'security@test.com'; // Adjust to whatever the security email is, or we'll just query without auth to get the schema error
    console.log("We need to know the Security user email to test login. Since we don't have it, let's just use the anon key.");

    // Actually, we can fetch all Panic Logs as Admin (service role if we have it, else we just explain)
    console.log(`Checking panic_logs table using anon key...`);
    const { data: anonData, error: anonError } = await supabase.from('panic_logs').select('id').limit(1);
    console.log('Anon panic_logs Result:', anonData ? anonData.length + ' rows' : 'Error: ' + anonError.message);
}

checkSecurityAccess();
