import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Mic, 
  MicOff,
  Brain,
  Calendar,
  BarChart3
} from 'lucide-react';
import useStore from '../store/useStore';
import { GeminiService } from '../lib/gemini';
import VoiceInterface from '../utils/voiceInterface';
import toast from 'react-hot-toast';

const MoodTracker = () => {
  const { mood, updateMood } = useStore();
  const [moodScore, setMoodScore] = useState(mood.current);
  const [moodDescription, setMoodDescription] = useState('');
  const [voiceInterface, setVoiceInterface] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const moodEmojis = [
    { emoji: '😢', score: 1, label: 'Very Sad' },
    { emoji: '😔', score: 2, label: 'Sad' },
    { emoji: '😐', score: 3, label: 'Neutral' },
    { emoji: '🙂', score: 4, label: 'Okay' },
    { emoji: '😊', score: 5, label: 'Good' },
    { emoji: '😄', score: 6, label: 'Happy' },
    { emoji: '🤩', score: 7, label: 'Great' },
    { emoji: '🥳', score: 8, label: 'Amazing' },
    { emoji: '🤗', score: 9, label: 'Ecstatic' },
    { emoji: '💫', score: 10, label: 'Perfect' }
  ];

  useEffect(() => {
    const vi = new VoiceInterface();
    setVoiceInterface(vi);
  }, []);

  const handleMoodSubmit = async () => {
    if (!moodDescription.trim()) {
      toast.error('Please describe how you\'re feeling');
      return;
    }

    setLoading(true);
    try {
      const result = await GeminiService.analyzeMood(moodScore, moodDescription);
      // Validate result structure
      if (!result || typeof result !== 'object' || !result.study_suggestion || !result.intensity_adjustment || !result.motivational_message || !Array.isArray(result.recommended_activities)) {
        toast.error('AI did not return valid mood analysis. Please try again or check your API key.');
        setAnalysis({
          study_suggestion: 'Take a light review session',
          intensity_adjustment: 'Reduce intensity by 20%',
          motivational_message: "It's okay to have off days. You're doing great!",
          recommended_activities: ["Light reading", "Review notes", "Take a break"]
        });
        return;
      }
      setAnalysis(result);
      updateMood(moodScore, moodDescription);
      toast.success('Mood updated! Check your personalized suggestions below.');
    } catch (error) {
      console.error('Error analyzing mood:', error);
      toast.error('Error analyzing mood. Please check your API key or try again.');
      setAnalysis({
        study_suggestion: 'Take a light review session',
        intensity_adjustment: 'Reduce intensity by 20%',
        motivational_message: "It's okay to have off days. You're doing great!",
        recommended_activities: ["Light reading", "Review notes", "Take a break"]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!voiceInterface) {
      toast.error('Voice interface not available');
      return;
    }

    setIsListening(true);
    voiceInterface.startListening(
      (transcript) => {
        setMoodDescription(transcript);
        setIsListening(false);
        
        // Auto-detect mood from voice
        const detectedMood = voiceInterface.detectMoodFromVoice(transcript);
        const moodMap = {
          'happy': 8,
          'sad': 3,
          'angry': 2,
          'tired': 4,
          'motivated': 7,
          'stressed': 3,
          'neutral': 5
        };
        
        if (moodMap[detectedMood]) {
          setMoodScore(moodMap[detectedMood]);
        }
      },
      (error) => {
        console.error('Voice recognition error:', error);
        setIsListening(false);
        toast.error('Voice recognition error. Please try again.');
      }
    );
  };

  const getMoodColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    if (score >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMoodTrend = () => {
    if (mood.history.length < 2) return 'stable';
    
    const recent = mood.history.slice(-3);
    const avg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
    
    if (moodScore > avg + 1) return 'improving';
    if (moodScore < avg - 1) return 'declining';
    return 'stable';
  };

  const getWeeklyAverage = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentMoods = mood.history.filter(m => 
      new Date(m.date) > weekAgo
    );
    
    if (recentMoods.length === 0) return moodScore;
    
    return Math.round(
      recentMoods.reduce((sum, m) => sum + m.value, 0) / recentMoods.length
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient mb-2 flex items-center justify-center">
          <Heart className="w-8 h-8 mr-3" />
          Mood Tracker
        </h1>
        <p className="text-gray-600">Track your emotional wellbeing and get personalized study suggestions</p>
      </div>

      {/* Current Mood Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Mood</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-3xl">{moodEmojis.find(m => m.score === mood.current)?.emoji || '😐'}</span>
                <span className={`text-2xl font-bold ${getMoodColor(mood.current)}`}>
                  {mood.current}/10
                </span>
              </div>
            </div>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Weekly Average</p>
              <p className="text-2xl font-bold text-blue-600">{getWeeklyAverage()}/10</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mood Trend</p>
              <div className="flex items-center space-x-2 mt-1">
                {getMoodTrend() === 'improving' ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : getMoodTrend() === 'declining' ? (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-full"></div>
                )}
                <span className={`text-sm font-medium ${
                  getMoodTrend() === 'improving' ? 'text-green-600' :
                  getMoodTrend() === 'declining' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {getMoodTrend().charAt(0).toUpperCase() + getMoodTrend().slice(1)}
                </span>
              </div>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Mood Input */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">How are you feeling today?</h2>
        
        <div className="space-y-6">
          {/* Emoji Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select your mood:
            </label>
            <div className="grid grid-cols-5 gap-3">
              {moodEmojis.map((mood) => (
                <button
                  key={mood.score}
                  onClick={() => setMoodScore(mood.score)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    moodScore === mood.score
                      ? 'border-synapse-500 bg-synapse-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-1">{mood.emoji}</div>
                  <div className="text-xs text-gray-600">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mood Score: {moodScore}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={moodScore}
              onChange={(e) => setMoodScore(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Very Low</span>
              <span>Very High</span>
            </div>
          </div>

          {/* Voice Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe how you're feeling (or use voice):
            </label>
            <div className="flex gap-3">
              <textarea
                value={moodDescription}
                onChange={(e) => setMoodDescription(e.target.value)}
                placeholder="I'm feeling... (e.g., tired but motivated, stressed about exams, excited about learning)"
                className="input-field flex-1 resize-none"
                rows="3"
              />
              <button
                onClick={handleVoiceInput}
                disabled={isListening}
                className={`p-3 rounded-lg border transition-colors ${
                  isListening
                    ? 'bg-red-100 border-red-300 text-red-600'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleMoodSubmit}
            disabled={loading || !moodDescription.trim()}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            Analyze Mood & Get Suggestions
          </button>
        </div>
      </div>

      {/* Mood Analysis */}
      {analysis && (
        <div className="card bg-gradient-to-r from-synapse-50 to-primary-50 border-synapse-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Personalized Analysis</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Study Suggestion</h3>
              <p className="text-gray-700">{analysis.study_suggestion}</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Intensity Adjustment</h3>
              <p className="text-gray-700">{analysis.intensity_adjustment}</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Motivational Message</h3>
              <p className="text-gray-700">{analysis.motivational_message}</p>
            </div>

            {analysis.recommended_activities && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Recommended Activities</h3>
                <ul className="space-y-1">
                  {analysis.recommended_activities.map((activity, index) => (
                    <li key={index} className="text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-synapse-500 rounded-full mr-2"></span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mood History */}
      {mood.history.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Mood History</h2>
          <div className="space-y-3">
            {mood.history.slice(-10).reverse().map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {moodEmojis.find(m => m.score === entry.value)?.emoji || '😐'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">
                      {entry.description || 'No description'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(entry.date).toLocaleDateString()} at{' '}
                      {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <span className={`font-bold ${getMoodColor(entry.value)}`}>
                  {entry.value}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivation Section */}
      <div className="card bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <div className="text-center">
          <Heart className="w-12 h-12 text-pink-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Your Mental Health Matters
          </h3>
          <p className="text-gray-600 mb-6">
            Tracking your mood helps you understand your patterns and optimize your study sessions. 
            Remember, it's okay to have off days - they're part of being human!
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• AI-powered mood analysis</p>
            <p>• Personalized study suggestions</p>
            <p>• Voice input for easy tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker; 