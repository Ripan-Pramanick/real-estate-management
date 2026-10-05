import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default {
  async fetch(req: Request) {
    // ১. CORS প্রি-ফ্লাইট রিকোয়েস্ট হ্যান্ডেল করা (সবার আগে)
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const { email, password, name, department, role } = await req.json();

      // ২. Service Role Key ব্যবহার করে অ্যাডমিন ক্লায়েন্ট তৈরি করা (যা অটোমেটিক ইনজেক্ট হয়)
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      // ৩. Auth ইউজার তৈরি করা
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, department, role }
      });

      if (error) throw error;

      // ৪. সফল হলে রেসপন্স পাঠানো
      return new Response(JSON.stringify({ user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error: any) {
      // ৫. এরর হলে রেসপন্স পাঠানো
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  }
};