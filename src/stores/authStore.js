import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  
  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      set({ user: data.user, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  signUp: async (email, password, username) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (error) throw error;
      
      set({ user: data.user, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  signOut: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      set({ user: null, profile: null, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  fetchProfile: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return null;
    
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      set({ profile: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  updateProfile: async (updates) => {
    const { user } = useAuthStore.getState();
    if (!user) return { error: 'Not authenticated' };
    
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      set({ profile: data, isLoading: false });
      return { data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
}));
