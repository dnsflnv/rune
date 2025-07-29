import { makeAutoObservable } from 'mobx';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

class AuthStore {
  user: User | null = null;
  loading: boolean = true;

  constructor() {
    makeAutoObservable(this);
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      this.setUser(user);
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      this.setLoading(false);
    }
  }

  setUser(user: User | null) {
    this.user = user;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  async signIn(email: string, password: string, captchaToken: string | null) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken: captchaToken || undefined,
      },
    });
    if (error) throw error;
    this.setUser(data.user);
    return data;
  }

  async signUp(email: string, password: string, captchaToken: string | null) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken: captchaToken || undefined,
      },
    });
    if (error) throw error;
    this.setUser(data.user);
    return data;
  }

  async signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    this.setUser(null);
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  get isAuthenticated() {
    return this.user !== null;
  }

  get userId() {
    return this.user?.id;
  }

  get userEmail() {
    return this.user?.email;
  }
}

// Create and export a singleton instance
export const authStore = new AuthStore();

// Set up Supabase auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    authStore.setUser(session?.user ?? null);
  } else if (event === 'SIGNED_OUT') {
    authStore.setUser(null);
  }
});
