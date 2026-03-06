-- Migration script for Chat Feature
-- Copy and paste this directly into Supabase SQL Editor

-- 1. Create chat_sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  housing_complex_id bigint NOT NULL,
  participant1_id uuid NOT NULL,
  participant2_id uuid NOT NULL,
  last_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT chat_sessions_housing_complex_id_fkey FOREIGN KEY (housing_complex_id) REFERENCES public.housing_complexes(id),
  CONSTRAINT chat_sessions_participant1_id_fkey FOREIGN KEY (participant1_id) REFERENCES public.profiles(id),
  CONSTRAINT chat_sessions_participant2_id_fkey FOREIGN KEY (participant2_id) REFERENCES public.profiles(id)
);

-- Enable RLS for chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- 2. Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);

-- Enable RLS for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 3. Apply RLS Policies
-- chat_sessions policies
CREATE POLICY "Users can view their own chat sessions"
ON public.chat_sessions FOR SELECT
TO authenticated
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can create chat sessions if they are a participant"
ON public.chat_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can update their own chat sessions"
ON public.chat_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);


-- chat_messages policies
CREATE POLICY "Users can view messages in their sessions"
ON public.chat_messages FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM chat_sessions cs 
  WHERE cs.id = chat_messages.session_id 
  AND (cs.participant1_id = auth.uid() OR cs.participant2_id = auth.uid())
));

CREATE POLICY "Users can send messages to their sessions"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages in their sessions (mark as read)"
ON public.chat_messages FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM chat_sessions cs 
  WHERE cs.id = chat_messages.session_id 
  AND (cs.participant1_id = auth.uid() OR cs.participant2_id = auth.uid())
));
