import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking leads where email is null...");
  const { data: nullEmailLeads, error: err1 } = await supabase.from('leads').select('id, email, phone').is('email', null).limit(3);
  console.log("Null email leads:", nullEmailLeads);
  
  console.log("Checking v_recent_leads view for email column...");
  const { data: viewLeads, error: err2 } = await supabase.from('v_recent_leads').select('id, email, phone').limit(3);
  console.log("v_recent_leads:", viewLeads);
}

run();
