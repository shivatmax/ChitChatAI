import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { User } from '../../../types/SupabaseTypes';
import { v4 as uuidv4 } from 'uuid';
import { decrypt } from '../../../utils/encryption';
import { logger } from '@/app/utils/logger';

export const useUser = (id: string) =>
  useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);

      if (data) {
        try {
          if (!data.encryption_key || !data.iv || !data.tag) {
            logger.error('Missing encryption data:', {
              hasKey: !!data.encryption_key,
              hasIv: !!data.iv,
              hasTag: !!data.tag,
            });
            return data;
          }

          const key = Buffer.from(data.encryption_key, 'hex');
          return {
            ...data,
            name: data.encrypted_name
              ? decrypt(data.encrypted_name, key, data.iv, data.tag)
              : data.name,
            email: data.encrypted_email
              ? decrypt(data.encrypted_email, key, data.iv, data.tag)
              : data.email,
          };
        } catch (error) {
          logger.debug('Failed to decrypt user data:', {
            error,
            userId: id,
          });
          return data;
        }
      }
      return null;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('User').select('*');

      if (error) throw new Error(error.message);
      return data;
    },
  });

export const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      newUser: Omit<User, 'id' | 'created_at' | 'updated_at'>
    ) => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('User')
        .insert([
          {
            id: uuidv4(),
            ...newUser,
            created_at: now,
            updated_at: now,
          },
        ])
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedUser: Partial<User> & { id: string }) => {
      const { data, error } = await supabase
        .from('User')
        .update({
          ...updatedUser,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedUser.id);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from('User').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
