import { observable, computed, action, runInAction, makeObservable, reaction } from 'mobx';
import { supabaseRunestones } from '../services/supabaseRunestones';
import { runestonesCache } from '../services/runestonesCache';
import { authStore } from './authStore';
import { Runestone } from '../types';

const TOTAL_RUNESTONES = 6815;

class VisitedRunestonesStore {
  @observable visitedRunestoneIds: Set<number> = new Set();
  @observable loading: boolean = false;
  @observable error: string | null = null;
  @observable totalRunestonesCount: number = TOTAL_RUNESTONES;

  constructor() {
    makeObservable(this);

    // React to auth changes - fetch visited runestones when user logs in, clear when logs out
    reaction(
      () => authStore.user,
      (user) => {
        if (user) {
          this.fetchVisitedRunestones();
        } else {
          this.clearVisitedRunestones();
        }
      },
      { fireImmediately: true }
    );
  }

  @action
  setLoading(loading: boolean) {
    this.loading = loading;
  }

  @action
  setError(error: string | null) {
    this.error = error;
  }

  @action
  setVisitedRunestoneIds(ids: Set<number>) {
    this.visitedRunestoneIds = ids;
  }

  @action
  setTotalRunestonesCount(count: number) {
    this.totalRunestonesCount = count;
  }

  @action
  addVisitedRunestone(id: number) {
    this.visitedRunestoneIds.add(id);
  }

  @action
  removeVisitedRunestone(id: number) {
    this.visitedRunestoneIds.delete(id);
  }

  @action
  clearVisitedRunestones() {
    this.visitedRunestoneIds.clear();
    this.error = null;
  }

  @action
  async fetchVisitedRunestones() {
    if (!authStore.user) {
      this.clearVisitedRunestones();
      return;
    }

    this.setLoading(true);
    this.setError(null);

    try {
      // Only fetch visited runestone IDs from Supabase
      const visitedRunestones = await supabaseRunestones.getAllVisitedRunestones();
      const visitedIds = new Set(visitedRunestones.map((rs) => rs.id));

      runInAction(() => {
        this.setVisitedRunestoneIds(visitedIds);
      });
    } catch (error) {
      console.error('Error fetching visited runestones:', error);
      runInAction(() => {
        this.setError('Failed to fetch visited runestones');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  @action
  async markAsVisited(runestoneId: number): Promise<boolean> {
    if (!authStore.user) {
      console.warn('markAsVisited: User not logged in');
      return false;
    }

    try {
      const success = await supabaseRunestones.markAsVisited(runestoneId);
      if (success) {
        runInAction(() => {
          this.addVisitedRunestone(runestoneId);
        });
      }
      return success;
    } catch (error) {
      console.error('Error marking runestone as visited:', error);
      runInAction(() => {
        this.setError('Failed to mark runestone as visited');
      });
      return false;
    }
  }

  @action
  async unmarkAsVisited(runestoneId: number): Promise<boolean> {
    if (!authStore.user) {
      console.warn('unmarkAsVisited: User not logged in');
      return false;
    }

    try {
      const success = await supabaseRunestones.deleteVisited(runestoneId);
      if (success) {
        runInAction(() => {
          this.removeVisitedRunestone(runestoneId);
        });
      }
      return success;
    } catch (error) {
      console.error('Error unmarking runestone as visited:', error);
      runInAction(() => {
        this.setError('Failed to unmark runestone as visited');
      });
      return false;
    }
  }

  @computed
  get isRunestoneVisited() {
    return (runestoneId: number): boolean => {
      return this.visitedRunestoneIds.has(runestoneId);
    };
  }

  @computed
  get visitedCount(): number {
    return this.visitedRunestoneIds.size;
  }

  @computed
  get completionPercentage(): number {
    return this.totalRunestonesCount > 0 ? Math.round((this.visitedCount / this.totalRunestonesCount) * 100) : 0;
  }

  // Method to get visited runestone details from cache
  async getVisitedRunestoneDetails(): Promise<Runestone[]> {
    if (this.visitedRunestoneIds.size === 0) {
      return [];
    }

    try {
      const allRunestones = await runestonesCache.getAllRunestones();
      return allRunestones.filter((runestone) => this.visitedRunestoneIds.has(runestone.id));
    } catch (error) {
      console.error('Error getting visited runestone details from cache:', error);
      throw error;
    }
  }

  @computed
  get isAuthenticated(): boolean {
    return authStore.isAuthenticated;
  }

  // Helper method to apply visited status to runestones array
  @computed
  get applyVisitedStatus() {
    return (runestones: Runestone[]): Runestone[] => {
      return runestones.map((runestone) => ({
        ...runestone,
        visited: this.isRunestoneVisited(runestone.id),
      }));
    };
  }
}

// Create and export a singleton instance
export const visitedRunestonesStore = new VisitedRunestonesStore();
