
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
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    const body = await req.text()
    const stripe = new (await import('https://esm.sh/stripe@12.0.0')).default(
      Deno.env.get('STRIPE_SECRET_KEY') || '',
      { apiVersion: '2022-11-15' }
    )

    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Webhook signature verification failed', { status: 400 })
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      
      if (session.metadata?.type === 'verification') {
        const userId = session.metadata.user_id
        
        if (userId) {
          // Initialize Supabase client
          const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
          )

          // Mark user as verified
          const { error } = await supabaseClient
            .from('app_users')
            .update({ is_verified: true })
            .eq('id', userId)

          if (error) {
            console.error('Error updating user verification:', error)
            throw error
          }

          console.log(`User ${userId} marked as verified`)
        }
      }
    }

    return new Response('Webhook handled successfully', { 
      headers: corsHeaders,
      status: 200 
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
