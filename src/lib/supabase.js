import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to convert mood score to mood label
const getMoodLabel = (score) => {
  if (score >= 9) return 'excellent';
  if (score >= 7) return 'good';
  if (score >= 5) return 'neutral';
  if (score >= 3) return 'bad';
  return 'terrible';
};

// Debug function to log Supabase errors
const logSupabaseError = (operation, error) => {
  console.error(`Supabase ${operation} error:`, error);
  if (error.code) {
    console.error(`Error code: ${error.code}`);
  }
  if (error.message) {
    console.error(`Error message: ${error.message}`);
  }
  if (error.details) {
    console.error(`Error details: ${error.details}`);
  }
};

// Auth helpers
export const auth = {
  // Sign up with email and password
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign in with Google OAuth
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Reset password
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    return { data, error };
  },

  // Update password
  updatePassword: async (password) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    });
    return { data, error };
  }
};

// Database helpers
export const db = {
  // User profile operations
  profiles: {
    // Get user profile
    get: async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    },

    // Create or update user profile
    upsert: async (profile) => {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profile)
        .select()
        .single();
      return { data, error };
    },

    // Update user profile
    update: async (userId, updates) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    }
  },

  // Tasks operations
  tasks: {
    // Get all tasks for a user
    getAll: async (userId) => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Create a new task
    create: async (task) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      return { data, error };
    },

    // Update a task
    update: async (taskId, updates) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
      return { data, error };
    },

    // Delete a task
    delete: async (taskId) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      return { error };
    }
  },

  // Mood entries operations
  moodEntries: {
    // Get all mood entries for a user
    getAll: async (userId) => {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Create a new mood entry
    create: async (moodEntry) => {
      try {
        // Map the incoming data to match the database schema
        const entryData = {
          user_id: moodEntry.user_id,
          mood_score: moodEntry.value || moodEntry.mood_score,
          mood_label: moodEntry.mood_label || getMoodLabel(moodEntry.value || moodEntry.mood_score),
          notes: moodEntry.description || moodEntry.notes,
          activities: moodEntry.activities || [],
          energy_level: moodEntry.energy_level,
          stress_level: moodEntry.stress_level,
          created_at: moodEntry.created_at || new Date().toISOString()
        };

        console.log('Creating mood entry with data:', entryData);

        const { data, error } = await supabase
          .from('mood_entries')
          .insert(entryData)
          .select()
          .single();

        if (error) {
          logSupabaseError('mood entry create', error);
          throw error;
        }

        console.log('Mood entry created successfully:', data);
        return { data, error: null };
      } catch (error) {
        logSupabaseError('mood entry create', error);
        return { data: null, error };
      }
    },

    // Update a mood entry
    update: async (entryId, updates) => {
      try {
        // Map the updates to match the database schema
        const updateData = {
          mood_score: updates.value || updates.mood_score,
          mood_label: updates.mood_label || getMoodLabel(updates.value || updates.mood_score),
          notes: updates.description || updates.notes,
          activities: updates.activities,
          energy_level: updates.energy_level,
          stress_level: updates.stress_level,
          updated_at: new Date().toISOString()
        };

        console.log('Updating mood entry with data:', updateData);

        const { data, error } = await supabase
          .from('mood_entries')
          .update(updateData)
          .eq('id', entryId)
          .select()
          .single();

        if (error) {
          logSupabaseError('mood entry update', error);
          throw error;
        }

        console.log('Mood entry updated successfully:', data);
        return { data, error: null };
      } catch (error) {
        logSupabaseError('mood entry update', error);
        return { data: null, error };
      }
    },

    // Delete a mood entry
    delete: async (entryId) => {
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', entryId);
      return { error };
    }
  },

  // Goals operations
  goals: {
    // Get all goals for a user
    getAll: async (userId) => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Create a new goal
    create: async (goal) => {
      const { data, error } = await supabase
        .from('goals')
        .insert(goal)
        .select()
        .single();
      return { data, error };
    },

    // Update a goal
    update: async (goalId, updates) => {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId)
        .select()
        .single();
      return { data, error };
    },

    // Delete a goal
    delete: async (goalId) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);
      return { error };
    }
  },

  // Flashcards operations
  flashcards: {
    // Get all flashcards for a user
    getAll: async (userId) => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Create a new flashcard
    create: async (flashcard) => {
      const { data, error } = await supabase
        .from('flashcards')
        .insert(flashcard)
        .select()
        .single();
      return { data, error };
    },

    // Update a flashcard
    update: async (flashcardId, updates) => {
      const { data, error } = await supabase
        .from('flashcards')
        .update(updates)
        .eq('id', flashcardId)
        .select()
        .single();
      return { data, error };
    },

    // Delete a flashcard
    delete: async (flashcardId) => {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', flashcardId);
      return { error };
    }
  },

  // Study sessions operations
  studySessions: {
    // Get all study sessions for a user
    getAll: async (userId) => {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Create a new study session
    create: async (studySession) => {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert(studySession)
        .select()
        .single();
      return { data, error };
    },

    // Update a study session
    update: async (sessionId, updates) => {
      const { data, error } = await supabase
        .from('study_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();
      return { data, error };
    },

    // Delete a study session
    delete: async (sessionId) => {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', sessionId);
      return { error };
    }
  },

  // Peer matches operations
  peerMatches: {
    // Get all peer matches for a user
    getAll: async (userId) => {
      const { data, error } = await supabase
        .from('peer_matches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Create a new peer match
    create: async (peerMatch) => {
      const { data, error } = await supabase
        .from('peer_matches')
        .insert(peerMatch)
        .select()
        .single();
      return { data, error };
    },

    // Update a peer match
    update: async (matchId, updates) => {
      const { data, error } = await supabase
        .from('peer_matches')
        .update(updates)
        .eq('id', matchId)
        .select()
        .single();
      return { data, error };
    },

    // Delete a peer match
    delete: async (matchId) => {
      const { error } = await supabase
        .from('peer_matches')
        .delete()
        .eq('id', matchId);
      return { error };
    }
  }
};

// Storage helpers
export const storage = {
  // Upload file to storage
  uploadFile: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  },

  // Get public URL for file
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete file from storage
  deleteFile: async (bucket, path) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { data, error };
  },

  // List files in bucket
  listFiles: async (bucket, path = '') => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);
    return { data, error };
  }
};

export default supabase; 