import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  ExternalLink, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  BookOpen,
  Mic,
  Calendar,
  Target,
  Users,
  Brain
} from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

const SetupModal = ({ isOpen, onComplete }) => {
  const { setGeminiApiKey } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [geminiKey, setGeminiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [userName, setUserName] = useState('');
  const [subjects, setSubjects] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    // Load existing data if available
    const savedGeminiKey = localStorage.getItem('gemini-api-key');
    const savedUserName = localStorage.getItem('user-name');
    const savedSubjects = localStorage.getItem('user-subjects');
    
    if (savedGeminiKey) setGeminiKey(savedGeminiKey);
    if (savedUserName) setUserName(savedUserName);
    if (savedSubjects) setSubjects(savedSubjects);
  }, []);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save all settings
    if (geminiKey.trim()) {
      setGeminiApiKey(geminiKey.trim());
    }
    
    if (userName.trim()) {
      localStorage.setItem('user-name', userName.trim());
    }
    
    if (subjects.trim()) {
      localStorage.setItem('user-subjects', subjects.trim());
    }
    
    localStorage.setItem('notifications', notifications.toString());
    localStorage.setItem('voice-enabled', voiceEnabled.toString());
    
    toast.success('Setup completed successfully!');
    onComplete();
  };

  const openGeminiInstructions = () => {
    window.open('https://aistudio.google.com/app/apikey', '_blank');
  };

  const steps = [
    {
      title: 'Welcome to Synapse',
      subtitle: 'Your AI-powered study assistant',
      icon: Sparkles,
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-synapse-500 rounded-full flex items-center justify-center mx-auto">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Synapse</h2>
            <p className="text-gray-600">
              Your intelligent study companion that helps you learn smarter, not harder.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" />
              <span>Smart Flashcards</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-600" />
              <span>AI Planning</span>
            </div>
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary-600" />
              <span>Voice Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-600" />
              <span>Peer Matching</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Gemini API Key',
      subtitle: 'Required for AI features',
      icon: Key,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Synapse uses Google's Gemini AI to provide intelligent features. 
              You'll need to get a free API key to continue.
            </p>
            <button
              onClick={openGeminiInstructions}
              className="btn-primary-mobile w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get Free API Key
            </button>
          </div>
          
          <div>
            <label className="label-mobile">API Key</label>
            <div className="relative">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="input-field-mobile w-full pr-12"
              />
              <button
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showGeminiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your API key is stored locally and never shared
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Personalize',
      subtitle: 'Tell us about yourself',
      icon: Target,
      content: (
        <div className="space-y-4">
          <div>
            <label className="label-mobile">Your Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="input-field-mobile"
            />
          </div>
          
          <div>
            <label className="label-mobile">Subjects You're Studying</label>
            <input
              type="text"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="e.g., Math, Physics, History, Literature"
              className="input-field-mobile"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple subjects with commas
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Preferences',
      subtitle: 'Customize your experience',
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
            <div>
              <h3 className="font-medium">Notifications</h3>
              <p className="text-sm text-gray-600">Get reminders for tasks and goals</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
            <div>
              <h3 className="font-medium">Voice Assistant</h3>
              <p className="text-sm text-gray-600">Use voice commands to control the app</p>
            </div>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                voiceEnabled ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <StepIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
                  <p className="text-sm text-gray-600">{currentStepData.subtitle}</p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {currentStepData.content}
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t flex justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="btn-secondary-mobile disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              
              <button
                onClick={handleNext}
                className="btn-primary-mobile"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SetupModal; 