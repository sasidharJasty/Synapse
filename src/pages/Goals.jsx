import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Brain,
  Calendar,
  Zap
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { GeminiService } from '../lib/gemini';
import toast from 'react-hot-toast';

const Goals = () => {
  const { 
    goals, 
    addGoal, 
    updateGoal, 
    addTask,
    getCompletedGoals,
    getPendingGoals
  } = useStore();

  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [breakdownResult, setBreakdownResult] = useState(null);

  const completedGoals = getCompletedGoals();
  const pendingGoals = getPendingGoals();

  const addNewGoal = () => {
    if (!newGoal.trim()) {
      toast.error('Please enter a goal');
      return;
    }

    addGoal(newGoal);
    setNewGoal('');
    toast.success('Goal added successfully!');
  };

  const breakdownGoal = async (goal) => {
    setLoading(true);
    setSelectedGoal(goal);
    
    try {
      const result = await GeminiService.breakdownGoal(goal.title);
      setBreakdownResult(result);
      
      // Add tasks to the store
      if (result.tasks && result.tasks.length > 0) {
        result.tasks.forEach(task => {
          addTask({
            title: task.title,
            description: task.description,
            estimatedTime: task.estimated_time,
            priority: task.priority,
            goalId: goal.id
          });
        });
        
        toast.success(`Goal broken down into ${result.tasks.length} tasks!`);
      }
    } catch (error) {
      console.error('Error breaking down goal:', error);
      toast.error('Error breaking down goal. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const toggleGoalCompletion = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      updateGoal(goalId, { completed: !goal.completed });
      toast.success(goal.completed ? 'Goal reactivated!' : 'Goal completed! 🎉');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressPercentage = (goal) => {
    // This would need to be calculated based on completed tasks
    // For now, return a placeholder
    return goal.completed ? 100 : 0;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient mb-2 flex items-center justify-center">
          <Target className="w-8 h-8 mr-3" />
          Goal Breakdown
        </h1>
        <p className="text-gray-600">Turn big goals into manageable daily tasks with AI</p>
      </div>

      {/* Add New Goal */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Goal</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Enter your goal (e.g., Write research paper, Learn Spanish, Build a website)"
            className="input-field flex-1"
            onKeyPress={(e) => e.key === 'Enter' && addNewGoal()}
          />
          <button
            onClick={addNewGoal}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-gray-800">{goals.length}</p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">{pendingGoals.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Active Goals */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Goals</h2>
        {pendingGoals.length > 0 ? (
          <div className="space-y-4">
            {pendingGoals.map((goal) => (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-800">{goal.title}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => breakdownGoal(goal)}
                      disabled={loading && selectedGoal?.id === goal.id}
                      className="btn-primary text-sm px-3 py-1 flex items-center"
                    >
                      {loading && selectedGoal?.id === goal.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Brain className="w-3 h-3 mr-2" />
                      )}
                      Break Down
                    </button>
                    <button
                      onClick={() => toggleGoalCompletion(goal.id)}
                      className="btn-secondary text-sm px-3 py-1 flex items-center"
                    >
                      <CheckCircle className="w-3 h-3 mr-2" />
                      Complete
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(goal.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {getProgressPercentage(goal)}% complete
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-synapse-500 to-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(goal)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No active goals. Add a goal to get started!</p>
          </div>
        )}
      </div>

      {/* Goal Breakdown Result */}
      {breakdownResult && selectedGoal && (
        <div className="card bg-gradient-to-r from-synapse-50 to-primary-50 border-synapse-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Breakdown: {selectedGoal.title}
          </h2>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-4">{breakdownResult.motivational_quote}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Total estimated time: {breakdownResult.total_estimated_time} minutes
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                {breakdownResult.tasks?.length || 0} tasks created
              </div>
            </div>
          </div>

          {breakdownResult.tasks && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Generated Tasks:</h3>
              {breakdownResult.tasks.map((task, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{task.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {task.estimated_time} minutes
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setBreakdownResult(null);
                setSelectedGoal(null);
              }}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Completed Goals</h2>
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <h3 className="font-medium text-gray-800 line-through">{goal.title}</h3>
                    <p className="text-sm text-gray-600">
                      Completed on {new Date(goal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleGoalCompletion(goal.id)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Reactivate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivation Section */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="text-center">
          <Target className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Ready to Achieve Your Goals?
          </h3>
          <p className="text-gray-600 mb-6">
            Break down your big dreams into small, actionable steps. 
            Every goal achieved is a step toward your best self!
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• AI-powered task breakdown</p>
            <p>• Time estimates and priority levels</p>
            <p>• Progress tracking and motivation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals; 