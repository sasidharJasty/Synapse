import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Brain,
  MessageSquare,
  Clock,
  Zap,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import useStore from '../store/useStore';
import VoiceInterface from '../utils/voiceInterface';
import { GeminiService } from '../lib/gemini';
import toast from 'react-hot-toast';

const VoiceInterfacePage = () => {
  const { 
    mood, 
    goals, 
    tasks, 
    updateMood, 
    addGoal, 
    addTask,
    setVoiceEnabled,
    voiceEnabled,
    isListening,
    setIsListening
  } = useStore();

  const [voiceInterface, setVoiceInterface] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [settings, setSettings] = useState({
    voiceRate: 1,
    voicePitch: 1,
    voiceVolume: 1
  });

  useEffect(() => {
    const vi = new VoiceInterface();
    setVoiceInterface(vi);
  }, []);

  const startListening = () => {
    if (!voiceInterface) {
      toast.error('Voice interface not available');
      return;
    }

    setTranscript('');
    setAiResponse('');
    setIsListening(true);

    voiceInterface.startListening(
      handleVoiceCommand,
      (error) => {
        console.error('Voice recognition error:', error);
        toast.error('Voice recognition error. Please try again.');
        setIsListening(false);
      }
    );
  };

  const stopListening = () => {
    if (voiceInterface) {
      voiceInterface.stopListening();
      setIsListening(false);
    }
  };

  const handleVoiceCommand = async (text) => {
    setTranscript(text);
    
    try {
      // Check if API key is available
      const apiKey = localStorage.getItem('gemini-api-key') || '';
      if (!apiKey) {
        setAiResponse("I need a Gemini API key to process voice commands. Please add your API key in Settings.");
        toast.error('Gemini API key not found. Please add it in Settings.');
        return;
      }

      // Process the command with Gemini
      const result = await GeminiService.processVoiceCommand(text);
      
      // Validate result structure
      if (!result || typeof result !== 'object') {
        toast.error('AI did not return a valid response. Please try again.');
        setAiResponse("I'm sorry, I couldn't process that command. Please try again.");
        return;
      }

      // Check for required fields
      if (!result.response) {
        toast.error('AI response is missing required fields. Please try again.');
        setAiResponse("I'm sorry, I couldn't process that command. Please try again.");
        return;
      }

      setAiResponse(result.response);
      
      // Add to conversation history
      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userInput: text,
        aiResponse: result.response,
        intent: result.intent || 'general',
        action: result.action || 'unknown'
      };
      
      setConversationHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
      
      // Handle different intents
      switch (result.intent) {
        case 'mood':
          const moodScore = voiceInterface.detectMoodFromVoice(text);
          const moodMap = {
            'happy': 8,
            'sad': 3,
            'angry': 2,
            'tired': 4,
            'motivated': 7,
            'stressed': 3,
            'neutral': 5
          };
          if (moodMap[moodScore]) {
            updateMood(moodMap[moodScore], text);
          }
          break;
          
        case 'goals':
          addGoal(text);
          break;
          
        case 'planner':
          // This would trigger planner functionality
          break;
          
        case 'flashcards':
          // This would trigger flashcard functionality
          break;
          
        default:
          break;
      }
      
      // Speak the response if audio is enabled
      if (audioEnabled) {
        speakText(result.response);
      }
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      
      // Provide more specific error messages
      let errorMessage = "I'm sorry, I couldn't process that command. Please try again.";
      
      if (error.message?.includes('API key')) {
        errorMessage = "Please check your Gemini API key in Settings.";
        toast.error('Invalid or missing API key');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Network error. Please check your internet connection.";
        toast.error('Network error');
      } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
        errorMessage = "API quota exceeded. Please try again later.";
        toast.error('API quota exceeded');
      }
      
      setAiResponse(errorMessage);
      
      if (audioEnabled) {
        speakText(errorMessage);
      }
    }
  };

  const speakText = (text) => {
    if (!voiceInterface || !audioEnabled) return;
    
    setIsSpeaking(true);
    voiceInterface.speak(text, {
      rate: settings.voiceRate,
      pitch: settings.voicePitch,
      volume: settings.voiceVolume
    });
    
    // Reset speaking state after a delay
    setTimeout(() => setIsSpeaking(false), 2000);
  };

  const toggleVoiceEnabled = () => {
    setVoiceEnabled(!voiceEnabled);
    toast.success(voiceEnabled ? 'Voice interface disabled' : 'Voice interface enabled');
  };

  const clearHistory = () => {
    setConversationHistory([]);
    toast.success('Conversation history cleared');
  };

  const voiceCommands = [
    {
      category: 'Mood & Wellness',
      commands: [
        "I'm feeling tired today",
        "I'm really motivated right now",
        "I'm stressed about my exams",
        "I'm in a great mood"
      ]
    },
    {
      category: 'Goals & Planning',
      commands: [
        "Add goal: finish my research paper",
        "I want to learn Spanish",
        "Help me plan my day",
        "Create a study schedule"
      ]
    },
    {
      category: 'Study & Learning',
      commands: [
        "Create flashcards for photosynthesis",
        "I need help with calculus",
        "Generate a quiz for world history",
        "Summarize my lecture notes"
      ]
    },
    {
      category: 'General',
      commands: [
        "What's my current mood?",
        "Give me some motivation",
        "How can I improve my study habits?",
        "What should I focus on today?"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient mb-2 flex items-center justify-center">
          <Mic className="w-8 h-8 mr-3" />
          Voice Assistant
        </h1>
        <p className="text-gray-600">Talk to Synapse and get intelligent responses to your academic needs</p>
      </div>

      {/* API Key Warning */}
      {!localStorage.getItem('gemini-api-key') && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">API Key Required</h3>
              <p className="text-yellow-700 mb-3">
                To use the voice assistant, you need a Gemini API key. This enables AI-powered responses to your voice commands.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                >
                  Get Free API Key
                </a>
                <button
                  onClick={() => window.location.href = '/settings?tab=api'}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Add to Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Voice Controls</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleVoiceEnabled}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                voiceEnabled
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {voiceEnabled ? 'Enabled' : 'Disabled'}
            </button>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                audioEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Main Voice Button */}
        <div className="text-center">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!voiceEnabled}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : voiceEnabled
                ? 'bg-gradient-to-r from-synapse-500 to-primary-500 hover:from-synapse-600 hover:to-primary-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
          
          <p className="mt-4 text-sm text-gray-600">
            {isListening ? 'Listening... Click to stop' : 'Click to start listening'}
          </p>
        </div>

        {/* Current Status */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-600">Voice Status</div>
            <div className="text-lg font-semibold text-gray-800">
              {voiceEnabled ? 'Active' : 'Inactive'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-600">Audio Output</div>
            <div className="text-lg font-semibold text-gray-800">
              {audioEnabled ? 'On' : 'Off'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-600">Current Mood</div>
            <div className="text-lg font-semibold text-gray-800">
              {mood.current}/10
            </div>
          </div>
        </div>
      </div>

      {/* Live Conversation */}
      {(transcript || aiResponse) && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Live Conversation</h2>
          
          <div className="space-y-4">
            {transcript && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Mic className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">You said:</span>
                </div>
                <p className="text-gray-800">{transcript}</p>
              </div>
            )}
            
            {aiResponse && (
              <div className="bg-synapse-50 border border-synapse-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-synapse-600" />
                  <span className="text-sm font-medium text-synapse-800">Synapse responded:</span>
                  {isSpeaking && (
                    <div className="flex space-x-1">
                      <div className="w-1 h-4 bg-synapse-500 rounded animate-pulse"></div>
                      <div className="w-1 h-4 bg-synapse-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-4 bg-synapse-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}
                </div>
                <p className="text-gray-800">{aiResponse}</p>
                {audioEnabled && (
                  <button
                    onClick={() => speakText(aiResponse)}
                    className="mt-2 text-sm text-synapse-600 hover:text-synapse-800 flex items-center"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Replay
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Voice Commands Guide */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Voice Commands Guide</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {voiceCommands.map((category) => (
            <div key={category.category}>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.commands.map((command, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      setTranscript(command);
                      handleVoiceCommand(command);
                    }}
                  >
                    <p className="text-sm text-gray-700">"{command}"</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Conversation History</h2>
            <button
              onClick={clearHistory}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear History
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversationHistory.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    entry.intent === 'mood' ? 'bg-pink-100 text-pink-800' :
                    entry.intent === 'goals' ? 'bg-purple-100 text-purple-800' :
                    entry.intent === 'planner' ? 'bg-green-100 text-green-800' :
                    entry.intent === 'flashcards' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {entry.intent}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-sm text-gray-800"><strong>You:</strong> {entry.userInput}</p>
                  </div>
                  <div className="bg-synapse-50 p-2 rounded">
                    <p className="text-sm text-gray-800"><strong>Synapse:</strong> {entry.aiResponse}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Voice Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speech Rate: {settings.voiceRate}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.voiceRate}
              onChange={(e) => setSettings(prev => ({ ...prev, voiceRate: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pitch: {settings.voicePitch}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.voicePitch}
              onChange={(e) => setSettings(prev => ({ ...prev, voicePitch: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume: {settings.voiceVolume}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.voiceVolume}
              onChange={(e) => setSettings(prev => ({ ...prev, voiceVolume: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="text-center">
          <Mic className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Your Voice, Your Assistant
          </h3>
          <p className="text-gray-600 mb-6">
            Speak naturally and let AI handle the rest. From mood tracking to study planning, 
            everything is just a conversation away!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Natural Language</h4>
              <p>Speak naturally and get intelligent responses</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Multi-Modal</h4>
              <p>Voice input, text display, and audio output</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Context Aware</h4>
              <p>Remembers your conversation history</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterfacePage; 