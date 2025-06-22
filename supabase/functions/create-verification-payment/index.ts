
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
    const { user_id } = await req.json()

    if (!user_id) {
      throw new Error('Missing user_id')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Check if user is already verified
    const { data: user, error: userError } = await supabaseClient
      .from('app_users')
      .select('is_verified')
      .eq('id', user_id)
      .single()

    if (userError) {
      throw new Error(`Failed to fetch user: ${userError.message}`)
    }

    if (user?.is_verified) {
      throw new Error('User is already verified')
    }

    // Create Stripe checkout session
    const stripe = new (await import('https://esm.sh/stripe@12.0.0')).default(
      Deno.env.get('STRIPE_SECRET_KEY') || '',
      { apiVersion: '2022-11-15' }
    )

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Provider Verification Badge',
              description: 'Get verified as a trusted provider',
            },
            unit_amount: 399, // €3.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/profile-settings?verified=success`,
      cancel_url: `${req.headers.get('origin')}/profile-settings?verified=cancelled`,
      metadata: {
        user_id: user_id,
        type: 'verification'
      }
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error creating verification payment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
