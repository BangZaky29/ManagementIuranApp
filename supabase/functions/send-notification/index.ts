import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('SERVICE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')
        const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

        const body = await req.json()
        const { user_ids, title, message, data, channelId } = body

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return new Response(JSON.stringify({ error: 'user_ids array is required' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            })
        }

        // 1. Ambil token
        const { data: userTokens, error: tokenError } = await supabase
            .from('user_tokens')
            .select('expo_push_token, user_id')
            .in('user_id', user_ids)

        if (tokenError) throw tokenError

        if (!userTokens || userTokens.length === 0) {
            return new Response(JSON.stringify({ message: 'No push tokens found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        const uniqueTokens = [...new Set(userTokens.map((t: any) => t.expo_push_token))];

        // 2. Siapkan Notifikasi
        const notifications = uniqueTokens.map((token: string) => ({
            to: token,
            title: title || 'Notifikasi Baru',
            body: message || 'Ada pesan baru.',
            data: data || {},
            sound: 'default',
            priority: 'high',
            channelId: channelId || 'default',
            mutableContent: true,
            _displayInForeground: true,
        }))

        console.log(`Sending ${notifications.length} notifications...`)

        const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notifications),
        })

        const expoData = await expoRes.json()
        console.log('Expo Response:', JSON.stringify(expoData));

        return new Response(JSON.stringify({ success: true, detail: expoData }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        })

    } catch (error: any) {
        console.error('Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        })
    }
})
