
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get pending notifications that are due
    const { data: pendingNotifications, error: fetchError } = await supabaseClient
      .from('notification_queue')
      .select(`
        *,
        app_users!inner(
          email,
          notification_tokens,
          email_notifications_enabled,
          push_notifications_enabled
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(50)

    if (fetchError) {
      throw new Error(`Failed to fetch notifications: ${fetchError.message}`)
    }

    console.log(`Processing ${pendingNotifications?.length || 0} notifications`)

    for (const notification of pendingNotifications || []) {
      try {
        const user = notification.app_users
        const shouldSendEmail = notification.type === 'email' || notification.type === 'both'
        const shouldSendPush = notification.type === 'push' || notification.type === 'both'

        // Send email notification
        if (shouldSendEmail && user.email_notifications_enabled && user.email) {
          const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email-notification`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: user.email,
              subject: notification.title,
              html: `
                <h2>${notification.title}</h2>
                <p>${notification.content}</p>
                <br>
                <p>Best regards,<br>TaskApp Team</p>
              `,
              text: `${notification.title}\n\n${notification.content}\n\nBest regards,\nTaskApp Team`,
            }),
          })

          if (!emailResponse.ok) {
            console.error(`Failed to send email for notification ${notification.id}`)
          }
        }

        // Send push notification
        if (shouldSendPush && user.push_notifications_enabled && user.notification_tokens && user.notification_tokens.length > 0) {
          const pushResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tokens: user.notification_tokens,
              title: notification.title,
              body: notification.content,
              data: notification.data,
            }),
          })

          if (!pushResponse.ok) {
            console.error(`Failed to send push notification for notification ${notification.id}`)
          }
        }

        // Mark notification as sent
        await supabaseClient
          .from('notification_queue')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString() 
          })
          .eq('id', notification.id)

      } catch (notificationError) {
        console.error(`Error processing notification ${notification.id}:`, notificationError)
        
        // Mark as failed
        await supabaseClient
          .from('notification_queue')
          .update({ status: 'failed' })
          .eq('id', notification.id)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: pendingNotifications?.length || 0 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Process notifications error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
