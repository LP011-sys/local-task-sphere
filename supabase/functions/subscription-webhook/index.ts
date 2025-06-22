
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

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
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2022-11-15'
    })

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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        
        if (session.mode === 'subscription') {
          const userId = session.metadata.user_id
          const planId = session.metadata.plan_id
          
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription)
          
          // Upsert user subscription
          const { error } = await supabaseClient
            .from('user_subscriptions')
            .upsert({
              user_id: userId,
              plan_id: planId,
              stripe_customer_id: session.customer,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            })

          if (error) {
            console.error('Error updating subscription:', error)
            throw error
          }

          console.log(`Subscription created for user ${userId}`)
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        
        // Find user by stripe customer ID
        const { data: userSub } = await supabaseClient
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (userSub) {
          const updateData: any = {
            status: subscription.status,
            updated_at: new Date().toISOString()
          }

          if (subscription.status === 'active') {
            updateData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString()
            updateData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString()
          }

          const { error } = await supabaseClient
            .from('user_subscriptions')
            .update(updateData)
            .eq('stripe_subscription_id', subscription.id)

          if (error) {
            console.error('Error updating subscription:', error)
            throw error
          }

          console.log(`Subscription ${subscription.id} updated to ${subscription.status}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
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
