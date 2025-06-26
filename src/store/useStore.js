import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db } from '../lib/supabase';
import toast from 'react-hot-toast';

const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,

      // App data - no filler data
      tasks: [],
      mood: {
        current: null,
        history: []
      },
      goals: [],
      flashcards: [],
      studySessions: [],
      peerMatches: [],

      // Gemini API key management
      geminiApiKey: localStorage.getItem('gemini-api-key') || '',

      // Auth actions
      signUp: async (email, password, userData = {}) => {
        set({ isLoading: true });
        try {
          const { data, error } = await auth.signUp(email, password, userData);
          if (error) throw error;
          
          toast.success('Account created successfully! Please check your email to verify your account.');
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to create account');
          return { success: false, error };
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await auth.signIn(email, password);
          if (error) throw error;
          
          set({ 
            user: data.user, 
            session: data.session, 
            isAuthenticated: true 
          });
          
          // Load user data
          await get().loadUserData();
          
          toast.success('Welcome back!');
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to sign in');
          return { success: false, error };
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await auth.signInWithGoogle();
          if (error) throw error;
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to sign in with Google');
          return { success: false, error };
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          const { error } = await auth.signOut();
          if (error) throw error;
          
          set({ 
            user: null, 
            session: null, 
            isAuthenticated: false,
            tasks: [],
            mood: {
              current: null,
              history: []
            },
            goals: [],
            flashcards: [],
            studySessions: [],
            peerMatches: []
          });
          
          toast.success('Signed out successfully');
          return { success: true };
        } catch (error) {
          toast.error(error.message || 'Failed to sign out');
          return { success: false, error };
        } finally {
          set({ isLoading: false });
        }
      },

      checkAuth: async () => {
        try {
          const { user } = await auth.getCurrentUser();
          const { session } = await auth.getCurrentSession();
          
          if (user && session) {
            set({ 
              user, 
              session, 
              isAuthenticated: true 
            });
            await get().loadUserData();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      },

      loadUserData: async () => {
        const { user } = get();
        if (!user) return;

        try {
          // Load all user data in parallel
          const [
            tasksResult,
            moodResult,
            goalsResult,
            flashcardsResult,
            studySessionsResult,
            peerMatchesResult
          ] = await Promise.all([
            db.tasks.getAll(user.id),
            db.moodEntries.getAll(user.id),
            db.goals.getAll(user.id),
            db.flashcards.getAll(user.id),
            db.studySessions.getAll(user.id),
            db.peerMatches.getAll(user.id)
          ]);

          set({
            tasks: tasksResult.data || [],
            mood: {
              current: moodResult.data && moodResult.data.length > 0 ? moodResult.data[0].value : null,
              history: moodResult.data ? moodResult.data.map(entry => ({
                id: entry.id,
                value: entry.value,
                description: entry.description,
                date: entry.created_at
              })) : []
            },
            goals: goalsResult.data || [],
            flashcards: flashcardsResult.data || [],
            studySessions: studySessionsResult.data || [],
            peerMatches: peerMatchesResult.data || []
          });
        } catch (error) {
          console.error('Failed to load user data:', error);
          toast.error('Failed to load your data');
        }
      },

      // Task actions
      addTask: async (task) => {
        const { user } = get();
        if (!user) {
          toast.error('Please sign in to add tasks');
          return;
        }

        try {
          const taskData = {
            ...task,
            user_id: user.id,
            created_at: new Date().toISOString()
          };

          const { data, error } = await db.tasks.create(taskData);
          if (error) throw error;

          set(state => ({
            tasks: [data, ...state.tasks]
          }));

          toast.success('Task added successfully');
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to add task');
          return { success: false, error };
        }
      },

      updateTask: async (taskId, updates) => {
        try {
          const { data, error } = await db.tasks.update(taskId, updates);
          if (error) throw error;

          set(state => ({
            tasks: state.tasks.map(task => 
              task.id === taskId ? { ...task, ...data } : task
            )
          }));

          toast.success('Task updated successfully');
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to update task');
          return { success: false, error };
        }
      },

      deleteTask: async (taskId) => {
        try {
          const { error } = await db.tasks.delete(taskId);
          if (error) throw error;

          set(state => ({
            tasks: state.tasks.filter(task => task.id !== taskId)
          }));

          toast.success('Task deleted successfully');
          return { success: true };
        } catch (error) {
          toast.error(error.message || 'Failed to delete task');
          return { success: false, error };
        }
      },

      // Mood actions
      addMoodEntry: async (moodEntry) => {
        const { user } = get();
        if (!user) {
          toast.error('Please sign in to track mood');
          return;
        }

        try {
          const entryData = {
            ...moodEntry,
            user_id: user.id,
            created_at: new Date().toISOString()
          };

          const { data, error } = await db.moodEntries.create(entryData);
          if (error) throw error;

          set(state => ({
            mood: {
              current: data.value,
              history: [...state.mood.history, { 
                id: data.id,
                value: data.value, 
                description: data.description,
                date: data.created_at 
              }]
            }
          }));

          toast.success('Mood entry added successfully');
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to add mood entry');
          return { success: false, error };
        }
      },

      updateMoodEntry: async (entryId, updates) => {
        try {
          const { data, error } = await db.moodEntries.update(entryId, updates);
          if (error) throw error;

          set(state => ({
            mood: {
              current: data.value,
              history: state.mood.history.map(entry => 
                entry.id === entryId ? { 
                  ...entry, 
                  value: data.value,
                  description: data.description,
                  date: data.created_at 
                } : entry
              )
            }
          }));

          toast.success('Mood entry updated successfully');
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to update mood entry');
          return { success: false, error };
        }
      },

      deleteMoodEntry: async (entryId) => {
        try {
          const { error } = await db.moodEntries.delete(entryId);
          if (error) throw error;

          set(state => ({
            mood: {
              current: state.mood.history.length > 1 ? state.mood.history[state.mood.history.length - 2]?.value || null : null,
              history: state.mood.history.filter(entry => entry.id !== entryId)
            }
          }));

          toast.success('Mood entry deleted successfully');
          return { success: true };
        } catch (error) {
          toast.error(error.message || 'Failed to delete mood entry');
          return { success: false, error };
        }
      },

      // Simple mood update (used by MoodTracker)
      updateMood: async (score, description) => {
        const { user } = get();
        if (!user) {
          toast.error('Please sign in to track mood');
          return;
        }

        try {
          const entryData = {
            value: score,
            description: description,
            user_id: user.id,
            created_at: new Date().toISOString()
          };

          const { data, error } = await db.moodEntries.create(entryData);
          if (error) throw error;

          set(state => ({
            mood: {
              current: score,
              history: [...state.mood.history, { 
                id: data.id,
                value: score, 
                description: description,
                date: data.created_at 
              }]
            }
          }));

          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to update mood');
          return { success: false, error };
        }
      },

      // Goal actions
      addGoal: async (goal) => {
        const { user } = get();
        if (!user) {
          toast.error('Please sign in to add goals');
          return;
        }

        try {
          const goalData = {
            ...goal,
            user_id: user.id,
            created_at: new Date().toISOString()
          };

          const { data, error } = await db.goals.create(goalData);
          if (error) throw error;

          set(state => ({
            goals: [data, ...state.goals]
          }));

          toast.success('Goal added successfully');
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to add goal');
          return { success: false, error };
        }
      },

      updateGoal: async (goalId, updates) => {
        try {
          const { data, error } = await db.goals.update(goalId, updates);
          if (error) throw error;

          set(state => ({
            goals: state.goals.map(goal => 
              goal.id === goalId ? { ...goal, ...data } : goal
            )
          }));

          toast.success('Goal updated successfully');
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to update goal');
          return { success: false, error };
        }
      },

      deleteGoal: async (goalId) => {
        try {
          const { error } = await db.goals.delete(goalId);
          if (error) throw error;

          set(state => ({
            goals: state.goals.filter(goal => goal.id !== goalId)
          }));

          toast.success('Goal deleted successfully');
          return { success: true };
        } catch (error) {
          toast.error(error.message || 'Failed to delete goal');
          return { success: false, error };
        }
      },

      // Flashcard actions
      addFlashcard: async (flashcard) => {
        const { user } = get();
        if (!user) {
          toast.error('Please sign in to add flashcards');
          return;
        }

        try {
          const flashcardData = {
            ...flashcard,
            user_id: user.id,
            created_at: new Date().toISOString()
          };

          const { data, error } = await db.flashcards.create(flashcardData);
          if (error) throw error;

          set(state => ({
            flashcards: [data, ...state.flashcards]
          }));

          toast.success('Flashcard added successfully');
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to add flashcard');
          return { success: false, error };
        }
      },

      updateFlashcard: async (flashcardId, updates) => {
        try {
          const { data, error } = await db.flashcards.update(flashcardId, updates);
          if (error) throw error;

          set(state => ({
            flashcards: state.flashcards.map(flashcard => 
              flashcard.id === flashcardId ? { ...flashcard, ...data } : flashcard
            )
          }));

          toast.success('Flashcard updated successfully');
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to update flashcard');
          return { success: false, error };
        }
      },

      deleteFlashcard: async (flashcardId) => {
        try {
          const { error } = await db.flashcards.delete(flashcardId);
          if (error) throw error;

          set(state => ({
            flashcards: state.flashcards.filter(flashcard => flashcard.id !== flashcardId)
          }));

          toast.success('Flashcard deleted successfully');
          return { success: true };
        } catch (error) {
          toast.error(error.message || 'Failed to delete flashcard');
          return { success: false, error };
        }
      },

      // Study session actions
      addStudySession: async (studySession) => {
        const { user } = get();
        if (!user) {
          toast.error('Please sign in to add study sessions');
          return;
        }

        try {
          const sessionData = {
            ...studySession,
            user_id: user.id,
            created_at: new Date().toISOString()
          };

          const { data, error } = await db.studySessions.create(sessionData);
          if (error) throw error;

          set(state => ({
            studySessions: [data, ...state.studySessions]
          }));

          toast.success('Study session added successfully');
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to add study session');
          return { success: false, error };
        }
      },

      updateStudySession: async (sessionId, updates) => {
        try {
          const { data, error } = await db.studySessions.update(sessionId, updates);
          if (error) throw error;

          set(state => ({
            studySessions: state.studySessions.map(session => 
              session.id === sessionId ? { ...session, ...data } : session
            )
          }));

          toast.success('Study session updated successfully');
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to update study session');
          return { success: false, error };
        }
      },

      deleteStudySession: async (sessionId) => {
        try {
          const { error } = await db.studySessions.delete(sessionId);
          if (error) throw error;

          set(state => ({
            studySessions: state.studySessions.filter(session => session.id !== sessionId)
          }));

          toast.success('Study session deleted successfully');
          return { success: true };
        } catch (error) {
          toast.error(error.message || 'Failed to delete study session');
          return { success: false, error };
        }
      },

      // Peer match actions
      addPeerMatch: async (peerMatch) => {
        const { user } = get();
        if (!user) {
          toast.error('Please sign in to add peer matches');
          return;
        }

        try {
          const matchData = {
            ...peerMatch,
            user_id: user.id,
            created_at: new Date().toISOString()
          };

          const { data, error } = await db.peerMatches.create(matchData);
          if (error) throw error;

          set(state => ({
            peerMatches: [data, ...state.peerMatches]
          }));

          toast.success('Peer match added successfully');
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to add peer match');
          return { success: false, error };
        }
      },

      updatePeerMatch: async (matchId, updates) => {
        try {
          const { data, error } = await db.peerMatches.update(matchId, updates);
          if (error) throw error;

          set(state => ({
            peerMatches: state.peerMatches.map(match => 
              match.id === matchId ? { ...match, ...data } : match
            )
          }));

          toast.success('Peer match updated successfully');
          return { success: true, data };
        } catch (error) {
          toast.error(error.message || 'Failed to update peer match');
          return { success: false, error };
        }
      },

      deletePeerMatch: async (matchId) => {
        try {
          const { error } = await db.peerMatches.delete(matchId);
          if (error) throw error;

          set(state => ({
            peerMatches: state.peerMatches.filter(match => match.id !== matchId)
          }));

          toast.success('Peer match deleted successfully');
          return { success: true };
        } catch (error) {
          toast.error(error.message || 'Failed to delete peer match');
          return { success: false, error };
        }
      },

      // User profile actions
      updateUser: (updates) => {
        set(state => ({
          user: state.user ? { ...state.user, ...updates } : updates
        }));
      },

      // Utility actions
      clearAllData: () => {
        set({
          tasks: [],
          mood: {
            current: null,
            history: []
          },
          goals: [],
          flashcards: [],
          studySessions: [],
          peerMatches: []
        });
      },

      updateSchedule: async (schedule) => {
        const { user } = get();
        if (!user) return;

        try {
          // This would typically save to a schedule table
          // For now, we'll just update the store
          set({ schedule });
        } catch (error) {
          console.error('Failed to update schedule:', error);
        }
      },

      // Utility functions
      getTodayTasks: () => {
        const { tasks } = get();
        const today = new Date().toDateString();
        return tasks.filter(task => {
          const taskDate = new Date(task.dueDate || task.created_at).toDateString();
          return taskDate === today;
        });
      },

      getPendingGoals: () => {
        const { goals } = get();
        return goals.filter(goal => !goal.completed);
      },

      getCompletedGoals: () => {
        const { goals } = get();
        return goals.filter(goal => goal.completed);
      },

      getMoodTrend: () => {
        const { mood } = get();
        const moodHistory = mood?.history || [];
        if (moodHistory.length < 2) return 'stable';
        
        const recent = moodHistory.slice(-3);
        const avg = recent.reduce((sum, m) => sum + (m.value || 0), 0) / recent.length;
        
        const currentMood = mood?.current || null;
        if (currentMood > avg + 1) return 'improving';
        if (currentMood < avg - 1) return 'declining';
        return 'stable';
      },

      // Gemini API key management
      setGeminiApiKey: (apiKey) => {
        localStorage.setItem('gemini-api-key', apiKey);
        set({ geminiApiKey: apiKey });
        toast.success('API key saved successfully');
      },

      clearGeminiApiKey: () => {
        localStorage.removeItem('gemini-api-key');
        set({ geminiApiKey: '' });
        toast.success('API key cleared');
      },
    }),
    {
      name: 'synapse-store',
      partialize: (state) => ({
        // Only persist non-sensitive data locally
        tasks: state.tasks,
        mood: state.mood,
        goals: state.goals,
        flashcards: state.flashcards,
        studySessions: state.studySessions,
        peerMatches: state.peerMatches
      })
    }
  )
);

export default useStore;
export { useStore }; 