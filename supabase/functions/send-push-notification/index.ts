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
        
        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('[PushNotif] Missing critical environment variables!')
            return new Response(JSON.stringify({ success: false, debug_error: 'Server is missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // ✅ Ambil Expo Access Token dari Secrets (opsional tapi sangat disarankan di production)
        const expoAccessToken = Deno.env.get('EXPO_ACCESS_TOKEN')

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
            console.log(`[PushNotif] No tokens found for user_ids: ${user_ids.join(', ')}`)
            return new Response(JSON.stringify({ message: 'No push tokens found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        const uniqueTokens = [...new Set(userTokens.map((t: any) => t.expo_push_token))];

        // 2. Siapkan Notifikasi
        // ✅ channelId selalu 'default' atau 'sos' — JANGAN nama dinamis
        const resolvedChannelId = (channelId === 'sos') ? 'sos' : 'default'

        const notifications = uniqueTokens.map((token: string) => ({
            to: token,
            title: title || 'Notifikasi Baru',
            body: message || 'Ada pesan baru.',
            data: data || {},
            sound: 'default',
            priority: 'high',
            channelId: resolvedChannelId,
            mutableContent: true,
            _displayInForeground: true,
        }))

        // 3. Chunking notifications (max 100 per chunk per Expo docs)
        const chunks: any[][] = []
        for (let i = 0; i < notifications.length; i += 100) {
            chunks.push(notifications.slice(i, i + 100))
        }

        console.log(`[PushNotif] Sending ${notifications.length} notifications in ${chunks.length} chunk(s)...`)

        const allDeliveryStatuses: any[] = []
        const tokensToDelete: string[] = []

        // ✅ Tambahkan Authorization header jika EXPO_ACCESS_TOKEN tersedia
        const expoHeaders: Record<string, string> = {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        }
        if (expoAccessToken) {
            expoHeaders['Authorization'] = `Bearer ${expoAccessToken}`
            console.log('[PushNotif] Using Expo Access Token for authentication.')
        } else {
            console.warn('[PushNotif] EXPO_ACCESS_TOKEN not set. Requests may be rate-limited. Set it in Supabase Edge Function Secrets.')
        }

        for (const chunk of chunks) {
            try {
                const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: expoHeaders,
                    body: JSON.stringify(chunk),
                })
                const expoData = await expoRes.json()

                if (!expoRes.ok) {
                    console.error(`[PushNotif] Expo API returned HTTP ${expoRes.status}:`, JSON.stringify(expoData))
                    continue
                }

                // Parse Expo response to find expired tokens
                if (expoData?.data) {
                    expoData.data.forEach((receipt: any, index: number) => {
                        allDeliveryStatuses.push(receipt)
                        if (receipt.status === 'error') {
                            console.error(`[PushNotif] Token error for token ${chunk[index].to}:`, receipt.message, receipt.details)
                            if (receipt.details?.error === 'DeviceNotRegistered') {
                                tokensToDelete.push(chunk[index].to)
                            }
                        }
                    })
                }
            } catch (chunkError) {
                console.error('[PushNotif] Error sending chunk:', chunkError)
            }
        }

        // 4. Cleanup expired tokens
        if (tokensToDelete.length > 0) {
            console.log(`[PushNotif] Removing ${tokensToDelete.length} expired token(s)...`)
            await supabase
                .from('user_tokens')
                .delete()
                .in('expo_push_token', tokensToDelete)
        }

        console.log(`[PushNotif] Done. Statuses: ${JSON.stringify(allDeliveryStatuses)}`)

        return new Response(JSON.stringify({ success: true, detail: allDeliveryStatuses }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        })

    } catch (error: any) {
        console.error('[PushNotif] Fatal Error:', error)
        // Bubble up error to frontend to see what crashed
        return new Response(JSON.stringify({ success: false, debug_error: error.message || String(error) }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        })
    }
})
