
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { referrerId, referredId, amount } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get user details
    const { data: referrer } = await supabaseClient
      .from('app_users')
      .select('email, full_name')
      .eq('id', referrerId)
      .single()

    const { data: referred } = await supabaseClient
      .from('app_users')
      .select('email, full_name')
      .eq('id', referredId)
      .single()

    if (!referrer || !referred) {
      throw new Error('User not found')
    }

    // In a real implementation, you would send emails here
    // For now, we'll just log the notification
    console.log(`Referral notification:`)
    console.log(`Referrer: ${referrer.email} earned €${amount}`)
    console.log(`Referred: ${referred.email} earned €${amount}`)

    // You could integrate with email services like:
    // - Resend
    // - SendGrid
    // - Amazon SES
    // - Mailgun

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
