import { observable, computed, action, runInAction, makeObservable } from 'mobx';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

class AuthStore {
  @observable user: User | null = null;
  @observable loading: boolean = false;

  constructor() {
    makeObservable(this);
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      runInAction(() => {
        this.setUser(user);
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  @action
  setUser(user: User | null) {
    this.user = user;
  }

  @action
  setLoading(loading: boolean) {
    this.loading = loading;
  }

  @action
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    runInAction(() => {
      this.setUser(data.user);
    });
    return data;
  }

  @action
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    runInAction(() => {
      this.setUser(data.user);
    });
    return data;
  }

  @action
  async signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  }

  @action
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    runInAction(() => {
      this.setUser(null);
    });
  }

  @action
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  @action
  async deleteUser() {
    const { error } = await supabase.rpc('delete_user');
    if (error) throw error;
    runInAction(() => {
      this.setUser(null);
    });
  }

  @computed
  get isAuthenticated() {
    return this.user !== null;
  }

  @computed
  get isEmailConfirmed() {
    return this.user?.email_confirmed_at !== undefined;
  }

  @computed
  get isFullyAuthenticated() {
    return this.isAuthenticated && this.isEmailConfirmed;
  }

  @computed
  get userId() {
    return this.user?.id;
  }

  @computed
  get userEmail() {
    return this.user?.email;
  }
}

// Create and export a singleton instance
export const authStore = new AuthStore();

// Set up Supabase auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    runInAction(() => {
      authStore.setUser(session?.user ?? null);
    });
  } else if (event === 'SIGNED_OUT') {
    runInAction(() => {
      authStore.setUser(null);
    });
  }
});
