import { supabase, db } from '../lib/supabase';

export const verifySupabaseSetup = async () => {
  const results = {
    environment: false,
    connection: false,
    auth: false,
    tables: {},
    policies: false,
    overall: false
  };

  try {
    // Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      results.environment = true;
      console.log('✅ Environment variables are set');
    } else {
      console.error('❌ Missing environment variables');
      return results;
    }

    // Test connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (!error) {
        results.connection = true;
        console.log('✅ Supabase connection successful');
      } else {
        console.error('❌ Supabase connection failed:', error);
        return results;
      }
    } catch (error) {
      console.error('❌ Supabase connection error:', error);
      return results;
    }

    // Check authentication
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        results.auth = true;
        console.log('✅ User is authenticated');
      } else {
        console.log('⚠️ User not authenticated (this is normal for new users)');
      }
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
    }

    // Check tables
    const tables = ['profiles', 'tasks', 'mood_entries', 'goals', 'flashcards', 'study_sessions', 'peer_matches'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error && error.code === 'PGRST116') {
          // Table doesn't exist
          results.tables[table] = false;
          console.error(`❌ Table '${table}' does not exist`);
        } else if (error) {
          // Other error (likely permission)
          results.tables[table] = false;
          console.error(`❌ Table '${table}' access error:`, error.message);
        } else {
          results.tables[table] = true;
          console.log(`✅ Table '${table}' exists and is accessible`);
        }
      } catch (error) {
        results.tables[table] = false;
        console.error(`❌ Error checking table '${table}':`, error);
      }
    }

    // Check RLS policies
    try {
      const { data, error } = await supabase
        .rpc('get_policies');
      
      if (error) {
        // Try a different approach to check policies
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);
        
        if (testError && testError.code === '42501') {
          results.policies = false;
          console.error('❌ RLS policies may not be set up correctly');
        } else {
          results.policies = true;
          console.log('✅ RLS policies appear to be working');
        }
      } else {
        results.policies = true;
        console.log('✅ RLS policies are configured');
      }
    } catch (error) {
      console.error('❌ Error checking RLS policies:', error);
    }

    // Overall assessment
    const tableChecks = Object.values(results.tables);
    const allTablesExist = tableChecks.length > 0 && tableChecks.every(exists => exists);
    
    results.overall = results.environment && results.connection && allTablesExist;
    
    if (results.overall) {
      console.log('🎉 Supabase setup is complete and working!');
    } else {
      console.log('⚠️ Some issues found. Check the errors above and refer to SUPABASE_SETUP.md');
    }

    return results;

  } catch (error) {
    console.error('❌ Setup verification failed:', error);
    return results;
  }
};

export const testDataOperations = async () => {
  const user = (await supabase.auth.getUser()).data.user;
  
  if (!user) {
    console.log('⚠️ No authenticated user found. Please sign in first.');
    return;
  }

  console.log('🧪 Testing data operations...');

  // Test mood entry creation
  try {
    const { data: moodData, error: moodError } = await db.moodEntries.create({
      user_id: user.id,
      value: 8,
      description: 'Test mood entry'
    });

    if (moodError) {
      console.error('❌ Mood entry creation failed:', moodError);
    } else {
      console.log('✅ Mood entry created successfully');
      
      // Clean up test data
      await db.moodEntries.delete(moodData.id);
    }
  } catch (error) {
    console.error('❌ Mood entry test failed:', error);
  }

  // Test goal creation
  try {
    const { data: goalData, error: goalError } = await db.goals.create({
      user_id: user.id,
      title: 'Test Goal',
      description: 'Test goal description'
    });

    if (goalError) {
      console.error('❌ Goal creation failed:', goalError);
    } else {
      console.log('✅ Goal created successfully');
      
      // Clean up test data
      await db.goals.delete(goalData.id);
    }
  } catch (error) {
    console.error('❌ Goal test failed:', error);
  }

  // Test task creation
  try {
    const { data: taskData, error: taskError } = await db.tasks.create({
      user_id: user.id,
      title: 'Test Task',
      description: 'Test task description'
    });

    if (taskError) {
      console.error('❌ Task creation failed:', taskError);
    } else {
      console.log('✅ Task created successfully');
      
      // Clean up test data
      await db.tasks.delete(taskData.id);
    }
  } catch (error) {
    console.error('❌ Task test failed:', error);
  }

  console.log('🧪 Data operation tests completed');
};

// Function to run in browser console for debugging
export const debugSupabase = () => {
  console.log('🔍 Supabase Debug Information:');
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Client:', supabase);
  
  // Test connection
  supabase.from('profiles').select('count').limit(1)
    .then(({ data, error }) => {
      console.log('Connection test:', { data, error });
    })
    .catch(error => {
      console.error('Connection error:', error);
    });
}; 