import { supabase } from '../../lib/supabaseConfig';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { triggerEdgePushNotification } from '../notification/triggerEdgePushNotification';

export interface ChatSession {
    id: string;
    housing_complex_id: number;
    participant1_id: string;
    participant2_id: string;
    last_message: string | null;
    created_at: string;
    updated_at: string;
    participant1?: any;
    participant2?: any;
    unread_count?: number;
}

export interface ChatMessage {
    id: string;
    session_id: string;
    sender_id: string;
    message: string;
    is_read: boolean;
    created_at: string;
    is_edited?: boolean;
    deleted_by?: string[];
}

export const fetchChatSessions = async (userId: string) => {
    const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select(`
      *,
      participant1:profiles!chat_sessions_participant1_id_fkey(id, full_name, avatar_url, role),
      participant2:profiles!chat_sessions_participant2_id_fkey(id, full_name, avatar_url, role)
    `)
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching chat sessions:', error);
        throw error;
    }

    if (!sessions || sessions.length === 0) return [];

    // Fetch unread counts for each session where sender != current user
    const sessionIds = sessions.map(s => s.id);
    const { data: unreadData, error: unreadError } = await supabase
        .from('chat_messages')
        .select('session_id')
        .in('session_id', sessionIds)
        .neq('sender_id', userId)
        .eq('is_read', false);

    if (unreadError) {
        console.error('Error fetching unread counts for sessions:', unreadError);
        return sessions as ChatSession[];
    }

    // Group counts by session_id
    const unreadCounts: Record<string, number> = {};
    if (unreadData) {
        unreadData.forEach(msg => {
            unreadCounts[msg.session_id] = (unreadCounts[msg.session_id] || 0) + 1;
        });
    }

    // Attach to sessions
    return sessions.map(session => ({
        ...session,
        unread_count: unreadCounts[session.id] || 0
    })) as ChatSession[];
};

export const createOrGetChatSession = async (
    participant1_id: string,
    participant2_id: string,
    housing_complex_id: number
) => {
    // Try to find an existing session
    const { data: existingSessions, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('housing_complex_id', housing_complex_id)
        .or(`and(participant1_id.eq.${participant1_id},participant2_id.eq.${participant2_id}),and(participant1_id.eq.${participant2_id},participant2_id.eq.${participant1_id})`)
        .limit(1);

    if (fetchError) {
        console.error('Error finding chat session:', fetchError);
        throw fetchError;
    }

    if (existingSessions && existingSessions.length > 0) {
        return existingSessions[0];
    }

    // Create new session
    const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .insert([
            {
                housing_complex_id,
                participant1_id,
                participant2_id,
                updated_at: new Date().toISOString()
            }
        ])
        .select()
        .single();

    if (createError) {
        console.error('Error creating chat session:', createError);
        throw createError;
    }

    return newSession;
};

export const fetchChatMessages = async (sessionId: string, currentUserId: string) => {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching chat messages:', error);
        throw error;
    }

    // Filter out messages deleted by "me"
    return data?.filter(msg => !msg.deleted_by?.includes(currentUserId)) || [];
};

export const sendMessage = async (sessionId: string, senderId: string, message: string) => {
    const { data, error } = await supabase
        .from('chat_messages')
        .insert([
            {
                session_id: sessionId,
                sender_id: senderId,
                message: message,
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('Error sending message:', error);
        throw error;
    }

    const sessionUpdateMsg = message.startsWith('[IMAGE]') ? '📷 Foto' : message.startsWith('[DOCUMENT]') ? '📄 Dokumen' : message;

    // Update session last_message and updated_at
    await supabase
        .from('chat_sessions')
        .update({
            last_message: sessionUpdateMsg,
            updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

    // --- TRIGGER NOTIFICATIONS ---
    try {
        // 1. Get session details to find recipient
        const { data: sessionData } = await supabase
            .from('chat_sessions')
            .select('participant1_id, participant2_id')
            .eq('id', sessionId)
            .single();

        if (sessionData) {
            const recipientId = sessionData.participant1_id === senderId ? sessionData.participant2_id : sessionData.participant1_id;

            if (recipientId) {
                // 2. Get sender details for push title
                const { data: senderData } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', senderId)
                    .single();

                const senderName = senderData?.full_name || 'Penghuni';

                // 3. Trigger Edge Function Push
                await triggerEdgePushNotification(
                    [recipientId],
                    `Pesan Baru dari ${senderName}`,
                    sessionUpdateMsg,
                    { type: 'chat', sessionId: sessionId },
                    'default' // Expo channel ID
                );

                // 4. Save In-App Notification
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: recipientId,
                        title: `Pesan Baru dari ${senderName}`,
                        body: sessionUpdateMsg,
                        data: { type: 'chat', sessionId: sessionId },
                        is_read: false
                    });
            } else {
                console.warn('[PushNotif] Recipient ID not found, skipping notifications.');
            }
        }
    } catch (notifErr) {
        console.error('Error triggering chat notifications:', notifErr);
    }
    // ----------------------------

    return data;
};

export const uploadChatAttachment = async (
    uri: string,
    sessionId: string,
    fileExt: string,
    mimeType: string
) => {
    try {
        const fileName = `${sessionId}/${Date.now()}.${fileExt}`;
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as any });

        const { data, error } = await supabase.storage
            .from('chat_attachments')
            .upload(fileName, decode(base64), {
                contentType: mimeType,
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('chat_attachments')
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading attachment', error);
        throw error;
    }
};

export const markMessagesAsRead = async (sessionId: string, userId: string) => {
    const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('session_id', sessionId)
        .neq('sender_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error('Error marking messages as read:', error);
    }
};

export const editMessage = async (messageId: string, newText: string) => {
    const { data, error } = await supabase
        .from('chat_messages')
        .update({
            message: newText,
            is_edited: true
        })
        .eq('id', messageId)
        .select()
        .single();

    if (error) {
        console.error('Error editing message:', error);
        throw error;
    }
    return data;
};

export const getParticipantInfo = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select(`
            full_name,
            role,
            housing_complexes (
                name
            )
        `)
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching participant info:', error);
        return null;
    }
    return data;
};

export const deleteMessages = async (messageIds: string[], deleteType: 'me' | 'everyone', userId: string) => {
    if (deleteType === 'everyone') {
        const { error } = await supabase
            .from('chat_messages')
            .delete()
            .in('id', messageIds);

        if (error) {
            console.error('Error deleting messages for everyone:', error);
            throw error;
        }
    } else if (deleteType === 'me') {
        // We append the userId to the 'deleted_by' array using Postgres array functions
        // Since we can't do array_append directly in Supabase .update() without an RPC, 
        // we will fetch first, then update, or create a simpler approach:
        // Actually, Supabase has rpc, but let's just fetch them and update them manually for simplicity

        const { data: msgs } = await supabase
            .from('chat_messages')
            .select('id, deleted_by')
            .in('id', messageIds);

        if (msgs) {
            const promises = msgs.map(msg => {
                const currentDeletedBy = msg.deleted_by || [];
                if (!currentDeletedBy.includes(userId)) {
                    return supabase
                        .from('chat_messages')
                        .update({ deleted_by: [...currentDeletedBy, userId] })
                        .eq('id', msg.id);
                }
                return Promise.resolve();
            });
            await Promise.all(promises);
        }
    }
};

export const countUnreadMessages = async (userId: string) => {
    // We want to count all messages where is_read is false, 
    // and the message belongs to a session where the user is a participant,
    // and the sender is NOT the user themselves.

    // First, find sessions the user belongs to:
    const { data: sessions, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('id')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

    if (sessionError || !sessions || sessions.length === 0) {
        return 0;
    }

    const sessionIds = sessions.map(s => s.id);

    const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .in('session_id', sessionIds)
        .neq('sender_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error('Error counting unread messages:', error);
        return 0;
    }

    return count || 0;
};

export const subscribeToChatSessions = (userId: string, callback: () => void) => {
    return supabase
        .channel('chat_sessions_updates')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'chat_sessions',
                filter: `participant1_id=eq.${userId}`,
            },
            callback
        )
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'chat_sessions',
                filter: `participant2_id=eq.${userId}`,
            },
            callback
        )
        .subscribe();
};

export const subscribeToChatRoom = (
    sessionId: string,
    onMessage: (payload: any) => void,
    onTyping: (payload: { userId: string, isTyping: boolean }) => void
) => {
    const channel = supabase.channel(`chat_room_${sessionId}`, {
        config: {
            broadcast: { ack: false }
        }
    });

    channel
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `session_id=eq.${sessionId}`,
            },
            onMessage
        )
        .on(
            'postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'chat_messages',
            },
            onMessage
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'chat_messages',
                filter: `session_id=eq.${sessionId}`,
            },
            onMessage
        )
        .on(
            'broadcast',
            { event: 'typing' },
            (payload) => {
                if (payload.payload) {
                    onTyping(payload.payload as any);
                }
            }
        )
        .subscribe();

    return channel;
};

export const sendTypingStatus = async (channel: any, userId: string, isTyping: boolean) => {
    if (channel) {
        await channel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId, isTyping }
        });
    }
};
