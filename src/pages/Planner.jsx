import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Target, 
  Heart, 
  Plus, 
  CheckCircle,
  X,
  Play,
  Pause,
  Zap,
  TrendingUp,
  Brain
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { GeminiService } from '../lib/gemini';
import toast from 'react-hot-toast';

const Planner = () => {
  const { 
    mood, 
    goals, 
    tasks, 
    schedule, 
    addTask, 
    updateTask, 
    updateSchedule,
    getTodayTasks,
    getPendingGoals
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [generatedSchedule, setGeneratedSchedule] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTask, setActiveTask] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const todayTasks = getTodayTasks();
  const pendingGoals = getPendingGoals();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTimerRunning]);

  const generateSchedule = async () => {
    if (selectedGoals.length === 0) {
      toast.error('Please select at least one goal');
      return;
    }

    setLoading(true);
    try {
      const result = await GeminiService.generateSchedule(
        mood.current,
        selectedGoals.map(g => g.title),
        energyLevel
      );
      // Validate result structure
      if (!result || !Array.isArray(result.schedule) || result.schedule.length === 0) {
        toast.error('AI did not return a valid schedule. Please try again or check your API key.');
        setGeneratedSchedule([]);
        updateSchedule([]);
        return;
      }
      setGeneratedSchedule(result.schedule);
      updateSchedule(result.schedule);
      // Add tasks to the store
      result.schedule.forEach(item => {
        addTask({
          title: item.activity || 'Untitled',
          description: item.mood_adjustment || '',
          estimated_time: item.duration || 60,
          priority: item.intensity === 'high' ? 'high' : item.intensity === 'medium' ? 'medium' : 'low',
          scheduledTime: item.time || '',
          started: false,
          completed: false,
          timeSpent: 0,
          completedAt: null
        });
      });
      toast.success('Schedule generated! Check your tasks below.');
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast.error('Error generating schedule. Please check your API key or try again.');
      setGeneratedSchedule([]);
      updateSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const startTask = (task) => {
    setActiveTask(task);
    setTimer(0);
    setIsTimerRunning(true);
    updateTask(task.id, { started: true });
  };

  const pauseTask = () => {
    setIsTimerRunning(false);
  };

  const completeTask = () => {
    if (activeTask) {
      updateTask(activeTask.id, { 
        completed: true, 
        timeSpent: timer,
        completedAt: new Date().toISOString()
      });
      setActiveTask(null);
      setTimer(0);
      setIsTimerRunning(false);
      toast.success('Task completed! Great job!');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentHour = () => {
    return currentTime.getHours();
  };

  const getTimeStatus = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour = hours;
    if (period === 'PM' && hours !== 12) hour += 12;
    if (period === 'AM' && hours === 12) hour = 0;
    
    const currentHour = getCurrentHour();
    if (hour < currentHour) return 'past';
    if (hour === currentHour) return 'current';
    return 'future';
  };

  const getEnergyColor = (level) => {
    if (level >= 8) return 'text-green-600';
    if (level >= 6) return 'text-blue-600';
    if (level >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMoodEmoji = (score) => {
    if (score >= 8) return '😄';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '😔';
    return '😢';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient mb-2 flex items-center justify-center">
          <Calendar className="w-8 h-8 mr-3" />
          AI Planner
        </h1>
        <p className="text-gray-600">Smart scheduling that adapts to your mood and energy</p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Mood</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-2xl">{getMoodEmoji(mood.current)}</span>
                <span className="text-xl font-bold text-gray-800">{mood.current}/10</span>
              </div>
            </div>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Energy Level</p>
              <div className="flex items-center space-x-2 mt-1">
                <Zap className={`w-5 h-5 ${getEnergyColor(energyLevel)}`} />
                <span className={`text-xl font-bold ${getEnergyColor(energyLevel)}`}>{energyLevel}/10</span>
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Time</p>
              <p className="text-xl font-bold text-gray-800">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Schedule Generator */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Generate Your Schedule</h2>
        
        <div className="space-y-6">
          {/* Energy Level Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Energy Level: {energyLevel}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Goal Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Goals to Include
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingGoals.map((goal) => (
                <label key={goal.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedGoals.some(g => g.id === goal.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGoals([...selectedGoals, goal]);
                      } else {
                        setSelectedGoals(selectedGoals.filter(g => g.id !== goal.id));
                      }
                    }}
                    className="rounded border-gray-300 text-synapse-600 focus:ring-synapse-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{goal.title}</span>
                </label>
              ))}
            </div>
            {pendingGoals.length === 0 && (
              <p className="text-gray-500 text-center py-4">No pending goals. Create some goals first!</p>
            )}
          </div>

          <button
            onClick={generateSchedule}
            disabled={loading || selectedGoals.length === 0}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            Generate Smart Schedule
          </button>
        </div>
      </div>

      {/* Generated Schedule */}
      {generatedSchedule.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Schedule</h2>
          <div className="space-y-4">
            {generatedSchedule.map((item, index) => {
              const status = getTimeStatus(item.time);
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-all ${
                    status === 'past' ? 'bg-gray-50 border-gray-200' :
                    status === 'current' ? 'bg-blue-50 border-blue-200' :
                    'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">{item.time}</p>
                        <p className="text-xs text-gray-500">{item.duration}min</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{item.activity}</h3>
                        <p className="text-sm text-gray-600">{item.mood_adjustment}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.intensity === 'high' ? 'bg-red-100 text-red-800' :
                        item.intensity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.intensity}
                      </span>
                      {status === 'current' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Now
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Task Timer */}
      {activeTask && (
        <div className="card bg-gradient-to-r from-synapse-50 to-primary-50 border-synapse-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Currently Working On</h3>
          <div className="text-center">
            <h4 className="text-xl font-medium text-gray-800 mb-2">{activeTask.title}</h4>
            <div className="text-4xl font-mono text-synapse-600 mb-4">{formatTime(timer)}</div>
            <div className="flex justify-center space-x-4">
              {isTimerRunning ? (
                <button
                  onClick={pauseTask}
                  className="btn-secondary flex items-center"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={() => setIsTimerRunning(true)}
                  className="btn-primary flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </button>
              )}
              <button
                onClick={completeTask}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Tasks</h2>
        {todayTasks.length > 0 ? (
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle 
                    className={`w-5 h-5 cursor-pointer ${
                      task.completed ? 'text-green-500' : 'text-gray-400'
                    }`}
                    onClick={() => updateTask(task.id, { completed: !task.completed })}
                  />
                  <div>
                    <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600">{task.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {task.estimated_time && (
                    <span className="text-sm text-gray-500">{task.estimated_time}min</span>
                  )}
                  {!task.completed && !task.started && (
                    <button
                      onClick={() => startTask(task)}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tasks for today. Generate a schedule to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Planner; 