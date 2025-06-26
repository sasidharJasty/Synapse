import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  Target, 
  Heart, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Play,
  Users,
  Brain,
  Sparkles,
  Circle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { GeminiService } from '../lib/gemini';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { 
    user, 
    mood, 
    goals, 
    tasks, 
    flashcards, 
    studySessions
  } = useStore();

  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    generateGreeting();
    // Enable voice interface on first visit
    if (!localStorage.getItem('voice-enabled')) {
      localStorage.setItem('voice-enabled', 'true');
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Simulate loading
    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(loadingTimer);
    };
  }, [mood.current]);

  const generateGreeting = async () => {
    setLoading(true);
    try {
      const greeting = await GeminiService.generateGreeting(user.name || 'Student');
      setGreeting(greeting);
    } catch (error) {
      console.error('Error generating greeting:', error);
      setGreeting('Welcome back');
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const getTodayTasks = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    return (tasks || []).filter(task => {
      const taskDate = new Date(task.due_date || task.created_at).toISOString().split('T')[0];
      return taskDate === todayString;
    });
  };

  const getCompletedGoals = () => {
    return (goals || []).filter(goal => goal.completed);
  };

  const getPendingGoals = () => {
    return (goals || []).filter(goal => goal.status !== 'completed').slice(0, 3);
  };

  const getRecentStudySessions = () => {
    return (studySessions || []).slice(0, 3);
  };

  const getMoodTrend = () => {
    if (!mood?.history || mood.history.length < 2) return 'stable';
    
    const recent = mood.history.slice(-7);
    if (recent.length < 2) return 'stable';
    
    const avg = recent.reduce((sum, m) => sum + (m.value || 0), 0) / recent.length;
    
    const currentMood = mood?.current;
    if (!currentMood) return 'stable';
    
    if (currentMood > avg + 1) return 'improving';
    if (currentMood < avg - 1) return 'declining';
    return 'stable';
  };

  const getStudyStreak = () => {
    // Simple implementation - count consecutive days with study sessions
    const sortedSessions = (studySessions || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dateString = currentDate.toISOString().split('T')[0];
      const hasSession = sortedSessions.some(session => {
        const sessionDate = new Date(session.created_at).toISOString().split('T')[0];
        return sessionDate === dateString;
      });
      
      if (hasSession) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Call functions after they're defined
  const todayTasks = getTodayTasks();
  const completedGoals = getCompletedGoals();
  const pendingGoals = getPendingGoals();
  const moodTrend = getMoodTrend();
  const studyStreak = getStudyStreak();

  // Defensive programming - ensure arrays exist
  const safeTasks = todayTasks || [];
  const safeGoals = goals || [];
  const safeStudySessions = studySessions || [];
  const safeMood = mood || { current: 5, history: [] };

  const quickActions = [
    {
      title: 'Create Flashcards',
      description: 'Generate study materials',
      icon: BookOpen,
      path: '/flashcards',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Plan Your Day',
      description: 'AI-powered scheduling',
      icon: Calendar,
      path: '/planner',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Set Goals',
      description: 'Break down objectives',
      icon: Target,
      path: '/goals',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Track Mood',
      description: 'Monitor your wellbeing',
      icon: Heart,
      path: '/mood',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const getMoodEmoji = (score) => {
    if (score >= 8) return '😄';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '😔';
    return '😢';
  };

  const getMoodColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    if (score >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const completedToday = safeTasks.filter(t => t.completed).length;
  const totalToday = safeTasks.length;

  const recentGoals = safeGoals.slice(0, 3);
  const recentSessions = safeStudySessions.slice(0, 3);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  if (loading) {
    return (
      <div className="container-mobile py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-synapse-500)' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-mobile space-mobile">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="section-header">
          {greeting}, {user?.name || 'Student'}! ✨
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-sage-600)' }}>
          {formatTime(currentTime)} • {formatDate(currentTime)}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid-mobile">
        <div className="card-mobile">
          <div className="card-header-mobile">
            <Target className="card-icon-mobile" />
            <h3 className="card-title-mobile">Today's Tasks</h3>
          </div>
          <div className="text-center py-4">
            {getTodayTasks().length > 0 ? (
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {getTodayTasks().length}
                </div>
                <p className="text-sm text-gray-600">tasks to complete</p>
              </div>
            ) : (
              <div>
                <div className="text-3xl font-bold text-gray-400 mb-1">0</div>
                <p className="text-sm text-gray-500">No tasks for today</p>
              </div>
            )}
          </div>
        </div>

        <div className="card-mobile">
          <div className="card-header-mobile">
            <Heart className="card-icon-mobile" />
            <h3 className="card-title-mobile">Current Mood</h3>
          </div>
          <div className="text-center py-4">
            {mood?.current ? (
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {mood.current}/10
                </div>
                <p className="text-sm text-gray-600 capitalize">{getMoodTrend()}</p>
              </div>
            ) : (
              <div>
                <div className="text-3xl font-bold text-gray-400 mb-1">-</div>
                <p className="text-sm text-gray-500">No mood recorded</p>
              </div>
            )}
          </div>
        </div>

        <div className="card-mobile">
          <div className="card-header-mobile">
            <Target className="card-icon-mobile" />
            <h3 className="card-title-mobile">Active Goals</h3>
          </div>
          <div className="text-center py-4">
            {goals && goals.length > 0 ? (
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {goals.filter(g => g.status !== 'completed').length}
                </div>
                <p className="text-sm text-gray-600">goals in progress</p>
              </div>
            ) : (
              <div>
                <div className="text-3xl font-bold text-gray-400 mb-1">0</div>
                <p className="text-sm text-gray-500">No goals set</p>
              </div>
            )}
          </div>
        </div>

        <div className="card-mobile">
          <div className="card-header-mobile">
            <BookOpen className="card-icon-mobile" />
            <h3 className="card-title-mobile">Study Sessions</h3>
          </div>
          <div className="text-center py-4">
            {studySessions && studySessions.length > 0 ? (
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {studySessions.length}
                </div>
                <p className="text-sm text-gray-600">sessions this week</p>
              </div>
            ) : (
              <div>
                <div className="text-3xl font-bold text-gray-400 mb-1">0</div>
                <p className="text-sm text-gray-500">No sessions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="subsection-header flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{ color: 'var(--color-synapse-600)' }} />
          Today's Schedule
        </h2>
        <div className="card">
          {safeTasks.length > 0 ? (
            <div className="space-y-3">
              {safeTasks.slice(0, 5).map((task, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`list-item ${
                    task.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'hover:bg-sage-50'
                  }`}
                  style={{
                    backgroundColor: task.completed ? 'var(--color-green-50)' : 'white',
                    borderColor: task.completed ? 'var(--color-green-200)' : 'var(--color-sage-200)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      task.completed 
                        ? 'bg-green-500' 
                        : 'bg-synapse-100'
                    }`}>
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Circle className="w-5 h-5" style={{ color: 'var(--color-sage-400)' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-base ${
                        task.completed ? 'text-green-800 line-through' : 'text-sage-800'
                      }`}
                      style={{ 
                        color: task.completed ? 'var(--color-green-800)' : 'var(--color-sage-800)'
                      }}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" style={{ color: 'var(--color-sage-500)' }} />
                        <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>{task.time || 'No time set'}</p>
                        {task.completed && (
                          <span className="status-indicator status-success"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10" style={{ color: 'var(--color-sage-400)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-sage-800)' }}>
                No tasks scheduled for today
              </h3>
              <p className="text-base" style={{ color: 'var(--color-sage-600)' }}>
                Time to plan something amazing!
              </p>
              <button className="btn-primary mt-4">
                <Calendar className="w-4 h-4" />
                Plan Your Day
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Activity & Goals */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Recent Goals */}
        <div className="card">
          <h3 className="subsection-header flex items-center gap-2">
            <Target className="w-5 h-5" style={{ color: 'var(--color-synapse-600)' }} />
            Recent Goals
          </h3>
          <div className="space-y-3">
            {recentGoals.length > 0 ? (
              recentGoals.map((goal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="list-item bg-sage-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="icon-container bg-synapse-100">
                      <Target className="w-5 h-5" style={{ color: 'var(--color-synapse-600)' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-base" style={{ color: 'var(--color-sage-800)' }}>{goal.title}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${goal.completedTasks ? (goal.completedTasks / goal.totalTasks) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-sage-700)' }}>
                          {goal.completedTasks || 0}/{goal.totalTasks || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8" style={{ color: 'var(--color-sage-400)' }} />
                </div>
                <p className="text-base" style={{ color: 'var(--color-sage-600)' }}>No goals set yet</p>
                <p className="text-sm" style={{ color: 'var(--color-sage-500)' }}>Start setting your academic goals!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Study Sessions */}
        <div className="card">
          <h3 className="subsection-header flex items-center gap-2">
            <Brain className="w-5 h-5" style={{ color: 'var(--color-synapse-600)' }} />
            Recent Study Sessions
          </h3>
          <div className="space-y-3">
            {recentSessions.length > 0 ? (
              recentSessions.map((session, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="list-item bg-sage-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="icon-container bg-primary-100">
                      <BookOpen className="w-5 h-5" style={{ color: 'var(--color-primary-600)' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-base" style={{ color: 'var(--color-sage-800)' }}>{session.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" style={{ color: 'var(--color-sage-500)' }} />
                        <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>{session.duration} minutes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gradient">
                        {session.score || 85}%
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-sage-500)' }}>Score</div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8" style={{ color: 'var(--color-sage-400)' }} />
                </div>
                <p className="text-base" style={{ color: 'var(--color-sage-600)' }}>No study sessions yet</p>
                <p className="text-sm" style={{ color: 'var(--color-sage-500)' }}>Start your first study session!</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Motivation Quote */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-synapse-50), var(--color-primary-50))',
          borderColor: 'var(--color-synapse-200)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-synapse-500/5 to-primary-500/5"></div>
        <div className="relative z-10">
          <div className="icon-container bg-gradient-to-r from-synapse-500 to-primary-500 mx-auto mb-6">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <blockquote className="text-xl font-semibold mb-4" style={{ color: 'var(--color-sage-800)' }}>
            "The only way to do great work is to love what you do."
          </blockquote>
          <cite className="text-base font-medium" style={{ color: 'var(--color-sage-600)' }}>— Steve Jobs</cite>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 