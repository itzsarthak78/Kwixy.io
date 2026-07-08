import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Comment {
  id: string;
  post_id: string;
  name: string;
  content: string;
  created_at: string;
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!postId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment: Omit<Comment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('comments')
        .insert([comment])
        .select()
        .single();
      if (error) throw error;
      return data as Comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.post_id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: comment, error: getError } = await supabase.from('comments').select('post_id').eq('id', id).single();
      if (getError) throw getError;
      
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) throw error;
      return { id, post_id: comment.post_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.post_id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
}
