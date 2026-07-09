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
      // Use limit(1) + maybeSingle so multiple rows never cause a 406 error
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    }
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileUpdate: Partial<Profile>) => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Not authenticated');

      // Try to get existing profile id from cache first
      const cached = queryClient.getQueryData<Profile>(['profile']);
      let profileId = cached?.id;

      // If not in cache, try fetching from DB (limit 1 avoids 406 on multiple rows)
      if (!profileId) {
        const { data: current } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
          .maybeSingle();
        profileId = current?.id;
      }

      let data, error;

      if (profileId) {
        // Profile row exists — update it
        ({ data, error } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', profileId)
          .select()
          .single());
      } else {
        // No profile row yet — insert a new one
        ({ data, error } = await supabase
          .from('profiles')
          .insert(profileUpdate)
          .select()
          .single());
      }

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}
