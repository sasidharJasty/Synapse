import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Target, 
  TrendingUp, 
  Brain,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { GeminiService } from '../lib/gemini';
import toast from 'react-hot-toast';

const Calendar = () => {
  const { 
    tasks, 
    mood, 
    addTask,
    updateTask,
    getMoodTrend
  } = useStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('week'); // week, month, day
  const [organizedTasks, setOrganizedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    difficulty: 'medium',
    estimatedDuration: 60,
    category: 'study'
  });

  useEffect(() => {
    organizeTasksWithAI();
  }, [tasks, mood, selectedDate, view]);

  const organizeTasksWithAI = async () => {
    setLoading(true);
    try {
      const moodTrend = getMoodTrend();
      const currentMood = mood.current;
      const pendingTasks = tasks.filter(task => !task.completed);
      
      const prompt = `
        As an AI study assistant, help organize these tasks for optimal productivity based on:
        - Current mood: ${currentMood} (1-10 scale)
        - Mood trend: ${moodTrend}
        - Available time: ${view === 'day' ? 'Full day' : view === 'week' ? 'This week' : 'This month'}
        - Task difficulty, priority, and estimated duration
        
        Tasks to organize:
        ${pendingTasks.map(task => `
          - ${task.title}
            Priority: ${task.priority}
            Difficulty: ${task.difficulty || 'medium'}
            Duration: ${task.estimatedDuration || 60} minutes
            Due: ${task.dueDate}
        `).join('\n')}
        
        Please organize tasks considering:
        1. Start with easier tasks if mood is low (below 5)
        2. Tackle difficult tasks when mood is high (above 7)
        3. Group similar tasks together
        4. Consider energy levels throughout the day
        5. Balance workload across available time
        
        Return a JSON array with organized tasks including suggested start times and reasoning.
      `;

      const response = await GeminiService.organizeTasks(prompt);
      const organized = response;
      setOrganizedTasks(organized);
    } catch (error) {
      console.error('AI organization failed:', error);
      // Fallback to basic organization
      setOrganizedTasks(organizeTasksManually());
    } finally {
      setLoading(false);
    }
  };

  const organizeTasksManually = () => {
    const pendingTasks = tasks.filter(task => !task.completed);
    const moodScore = mood.current;
    
    // Sort by priority first, then by difficulty based on mood
    return pendingTasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
      
      // If mood is low, prefer easier tasks
      if (moodScore < 5) {
        return difficultyOrder[a.difficulty || 'medium'] - difficultyOrder[b.difficulty || 'medium'];
      }
      
      // If mood is high, prefer higher priority tasks
      if (moodScore > 7) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      
      // Default: priority first, then difficulty
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return difficultyOrder[a.difficulty || 'medium'] - difficultyOrder[b.difficulty || 'medium'];
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getWeekDays = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--color-red-500)';
      case 'medium': return 'var(--color-yellow-500)';
      case 'low': return 'var(--color-green-500)';
      default: return 'var(--color-sage-500)';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return <Star className="w-3 h-3" style={{ color: 'var(--color-green-500)' }} />;
      case 'medium': return <Target className="w-3 h-3" style={{ color: 'var(--color-yellow-500)' }} />;
      case 'hard': return <Zap className="w-3 h-3" style={{ color: 'var(--color-red-500)' }} />;
      default: return <Target className="w-3 h-3" style={{ color: 'var(--color-sage-500)' }} />;
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      await addTask({
        ...newTask,
        id: Date.now().toString(),
        completed: false,
        createdAt: new Date().toISOString()
      });
      
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        difficulty: 'medium',
        estimatedDuration: 60,
        category: 'study'
      });
      setShowTaskModal(false);
      toast.success('Task added successfully!');
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="container-mobile py-6 space-mobile">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="section-header flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" style={{ color: 'var(--color-synapse-500)' }} />
            Smart Calendar
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>
            AI-powered task organization based on your mood and energy
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTaskModal(true)}
            className="p-2 rounded-full transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: 'var(--color-synapse-500)',
              color: 'white'
            }}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* View Toggle */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              view === 'day' 
                ? 'text-white' 
                : 'hover:bg-gray-100'
            }`}
            style={{
              backgroundColor: view === 'day' ? 'var(--color-synapse-500)' : 'transparent',
              color: view === 'day' ? 'white' : 'var(--color-sage-700)'
            }}
          >
            Day
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              view === 'week' 
                ? 'text-white' 
                : 'hover:bg-gray-100'
            }`}
            style={{
              backgroundColor: view === 'week' ? 'var(--color-synapse-500)' : 'transparent',
              color: view === 'week' ? 'white' : 'var(--color-sage-700)'
            }}
          >
            Week
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              view === 'month' 
                ? 'text-white' 
                : 'hover:bg-gray-100'
            }`}
            style={{
              backgroundColor: view === 'month' ? 'var(--color-synapse-500)' : 'transparent',
              color: view === 'month' ? 'white' : 'var(--color-sage-700)'
            }}
          >
            Month
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              if (view === 'day') newDate.setDate(newDate.getDate() - 1);
              else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
              else newDate.setMonth(newDate.getMonth() - 1);
              setCurrentDate(newDate);
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--color-sage-600)' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-medium" style={{ color: 'var(--color-sage-700)' }}>
            {view === 'day' && formatDate(currentDate)}
            {view === 'week' && `${formatDate(getWeekDays(currentDate)[0])} - ${formatDate(getWeekDays(currentDate)[6])}`}
            {view === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              if (view === 'day') newDate.setDate(newDate.getDate() + 1);
              else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
              else newDate.setMonth(newDate.getMonth() + 1);
              setCurrentDate(newDate);
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--color-sage-600)' }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* AI Organization Status */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 p-4 rounded-2xl"
        style={{ backgroundColor: 'var(--color-sage-50)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-synapse-100)' }}>
            <Brain className="w-5 h-5" style={{ color: 'var(--color-synapse-600)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--color-sage-800)' }}>
              AI Task Organization
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>
              Optimized for your current mood ({mood.current}/10)
            </p>
          </div>
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--color-synapse-500)' }}></div>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-sage-600)' }} />
            <span style={{ color: 'var(--color-sage-700)' }}>
              {getMoodTrend()} mood trend
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-sage-600)' }} />
            <span style={{ color: 'var(--color-sage-700)' }}>
              {organizedTasks.length} tasks organized
            </span>
          </div>
        </div>
      </motion.div>

      {/* Calendar View */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        {view === 'day' && (
          <div className="space-y-4">
            <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-sage-50)' }}>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-sage-800)' }}>
                {formatDate(selectedDate)}
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>
                {isToday(selectedDate) ? 'Today' : 'Selected Day'}
              </p>
            </div>
            
            <div className="space-y-3">
              {organizedTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-2xl border transition-all duration-200 hover:shadow-md"
                  style={{ 
                    backgroundColor: 'white',
                    borderColor: 'var(--color-sage-200)'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium" style={{ color: 'var(--color-sage-800)' }}>
                          {task.title}
                        </h3>
                        {getDifficultyIcon(task.difficulty)}
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        ></div>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm mb-2" style={{ color: 'var(--color-sage-600)' }}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-sage-500)' }}>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimatedDuration} min
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => updateTask(task.id, { ...task, completed: !task.completed })}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        task.completed 
                          ? 'hover:bg-red-100' 
                          : 'hover:bg-green-100'
                      }`}
                    >
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-green-500)' }} />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: 'var(--color-sage-300)' }}></div>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {view === 'week' && (
          <div className="grid grid-cols-7 gap-2">
            {getWeekDays(currentDate).map((day, index) => (
              <div
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected(day) 
                    ? 'ring-2 ring-offset-2' 
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: isToday(day) ? 'var(--color-synapse-50)' : 'white',
                  borderColor: isSelected(day) ? 'var(--color-synapse-500)' : 'var(--color-sage-200)',
                  border: '1px solid'
                }}
              >
                <div className="text-center">
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-sage-600)' }}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-semibold ${
                    isToday(day) ? 'text-white' : ''
                  }`} style={{
                    color: isToday(day) ? 'var(--color-synapse-600)' : 'var(--color-sage-800)'
                  }}>
                    {day.getDate()}
                  </div>
                  <div className="mt-2 space-y-1">
                    {getTasksForDate(day).slice(0, 2).map(task => (
                      <div
                        key={task.id}
                        className="w-full h-1 rounded-full"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'month' && (
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-xs font-medium" style={{ color: 'var(--color-sage-600)' }}>
                {day}
              </div>
            ))}
            
            {getDaysInMonth(currentDate).map((day, index) => (
              <div
                key={index}
                onClick={() => day && setSelectedDate(day)}
                className={`p-2 min-h-[60px] cursor-pointer transition-all duration-200 ${
                  day && isSelected(day) 
                    ? 'ring-2 ring-offset-1' 
                    : day && 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: day && isToday(day) ? 'var(--color-synapse-50)' : 'transparent',
                  borderColor: day && isSelected(day) ? 'var(--color-synapse-500)' : 'transparent'
                }}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium ${
                      isToday(day) ? 'text-white' : ''
                    }`} style={{
                      color: isToday(day) ? 'var(--color-synapse-600)' : 'var(--color-sage-700)'
                    }}>
                      {day.getDate()}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {getTasksForDate(day).slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className="w-full h-0.5 rounded-full"
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        ></div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowTaskModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-sage-800)' }}>
                Add New Task
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-sage-700)' }}>
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full p-3 rounded-xl border transition-colors focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--color-sage-200)',
                      focusRingColor: 'var(--color-synapse-500)'
                    }}
                    placeholder="Enter task title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-sage-700)' }}>
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full p-3 rounded-xl border transition-colors focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--color-sage-200)',
                      focusRingColor: 'var(--color-synapse-500)'
                    }}
                    placeholder="Enter task description..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-sage-700)' }}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full p-3 rounded-xl border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--color-sage-200)',
                        focusRingColor: 'var(--color-synapse-500)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-sage-700)' }}>
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      value={newTask.estimatedDuration}
                      onChange={(e) => setNewTask({ ...newTask, estimatedDuration: parseInt(e.target.value) })}
                      className="w-full p-3 rounded-xl border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--color-sage-200)',
                        focusRingColor: 'var(--color-synapse-500)'
                      }}
                      min="15"
                      step="15"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-sage-700)' }}>
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full p-3 rounded-xl border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--color-sage-200)',
                        focusRingColor: 'var(--color-synapse-500)'
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-sage-700)' }}>
                      Difficulty
                    </label>
                    <select
                      value={newTask.difficulty}
                      onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })}
                      className="w-full p-3 rounded-xl border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--color-sage-200)',
                        focusRingColor: 'var(--color-synapse-500)'
                      }}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--color-sage-100)',
                    color: 'var(--color-sage-700)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--color-synapse-500)',
                    color: 'white'
                  }}
                >
                  Add Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar; 