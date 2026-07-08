import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  name: string;
  bio: string;
  about: string;
  social_links: { platform: string; url: string }[];
  profile_picture_url: string;
  banner_url: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (error) {
        // Return dummy data if table is empty or error
        if (error.code === 'PGRST116') return null; 
        throw error;
      }
      return data as Profile;
    }
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileUpdate: Partial<Profile>) => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Not authenticated');

      // Singleton profile — get its actual id from cache or fetch it
      const cached = queryClient.getQueryData<Profile>(['profile']);
      let profileId = cached?.id;

      if (!profileId) {
        const { data: current, error: fetchErr } = await supabase
          .from('profiles')
          .select('id')
          .single();
        if (fetchErr) throw fetchErr;
        profileId = current.id;
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: profileId, ...profileUpdate }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
    }
  });
}
