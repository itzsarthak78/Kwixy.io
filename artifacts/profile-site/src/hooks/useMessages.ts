import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  name: string;
  email: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

export function useMessages() {
  return useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Message[];
    }
  });
}

export function useCreateMessage() {
  return useMutation({
    mutationFn: async (msg: Omit<Message, 'id' | 'read' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('messages')
        .insert([msg])
        .select()
        .single();
      if (error) throw error;
      return data as Message;
    }
  });
}

export function useUpdateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ read })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Message;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['messages'], (old: Message[] | undefined) => 
        old ? old.map(m => m.id === data.id ? data : m) : old
      );
    }
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['messages'], (old: Message[] | undefined) => 
        old ? old.filter(m => m.id !== id) : old
      );
    }
  });
}
