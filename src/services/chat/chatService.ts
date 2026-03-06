import { supabase } from '../../lib/supabaseConfig';

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
}

export interface ChatMessage {
    id: string;
    session_id: string;
    sender_id: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export const fetchChatSessions = async (userId: string) => {
    const { data, error } = await supabase
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
    return data;
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

export const fetchChatMessages = async (sessionId: string) => {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching chat messages:', error);
        throw error;
    }
    return data;
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

    // Update session last_message and updated_at
    await supabase
        .from('chat_sessions')
        .update({
            last_message: message,
            updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

    return data;
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

export const subscribeToChatMessages = (sessionId: string, callback: (payload: any) => void) => {
    return supabase
        .channel(`chat_messages_${sessionId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `session_id=eq.${sessionId}`,
            },
            callback
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'chat_messages',
                filter: `session_id=eq.${sessionId}`,
            },
            callback
        )
        .subscribe();
};
