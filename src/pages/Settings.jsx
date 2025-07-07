import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon,
  Key,
  User,
  Bell,
  Moon,
  Sun,
  Palette,
  Database,
  Shield,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import { GeminiService } from '../lib/gemini';

const Settings = () => {
  const { 
    user, 
    updateUser, 
    mood,
    tasks,
    goals,
    flashcards,
    studySessions,
    peerMatches,
    geminiApiKey, 
    setGeminiApiKey, 
    clearGeminiApiKey
  } = useStore();

  const [activeTab, setActiveTab] = useState('general');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [theme, setTheme] = useState('light');
  const [apiKeyTested, setApiKeyTested] = useState(null);
  const [isTestingApiKey, setIsTestingApiKey] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedNotifications = localStorage.getItem('notifications') !== 'false';
    const savedVoiceEnabled = localStorage.getItem('voice-enabled') !== 'false';
    const savedAutoBackup = localStorage.getItem('auto-backup') !== 'false';

    setTheme(savedTheme);
    setNotifications(savedNotifications);
    setVoiceEnabled(savedVoiceEnabled);
    setAutoBackup(savedAutoBackup);
  }, []);

  const handleSaveGeminiKey = () => {
    setGeminiApiKey(geminiApiKey);
  };

  const handleClearGeminiKey = () => {
    clearGeminiApiKey();
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(geminiApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleNotificationToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('notifications', newValue.toString());
    toast.success(`Notifications ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleVoiceToggle = () => {
    const newValue = !voiceEnabled;
    setVoiceEnabled(newValue);
    localStorage.setItem('voice-enabled', newValue.toString());
    toast.success(`Voice interface ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleAutoBackupToggle = () => {
    const newValue = !autoBackup;
    setAutoBackup(newValue);
    localStorage.setItem('auto-backup', newValue.toString());
    toast.success(`Auto backup ${newValue ? 'enabled' : 'disabled'}`);
  };

  const exportData = () => {
    const data = {
      user,
      mood,
      tasks,
      goals,
      flashcards,
      studySessions,
      peerMatches,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synapse-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        // Here you would typically update the store with imported data
        toast.success('Data imported successfully!');
      } catch (error) {
        toast.error('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
      toast.success('All data cleared');
    }
  };

  const openGeminiInstructions = () => {
    window.open('https://aistudio.google.com/app/apikey', '_blank');
  };

  const testApiKey = async () => {
    if (!geminiApiKey) {
      toast.error('Please enter an API key first');
      return;
    }

    setIsTestingApiKey(true);
    setApiKeyTested(null);

    try {
      const isValid = await GeminiService.testApiKey(geminiApiKey);
      setApiKeyTested(isValid);
      
      if (isValid) {
        toast.success('API key is valid and working!');
      } else {
        toast.error('API key is invalid or not working');
      }
    } catch (error) {
      console.error('API key test error:', error);
      setApiKeyTested(false);
      toast.error('Failed to test API key. Please check your connection.');
    } finally {
      setIsTestingApiKey(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Backup', icon: Database },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'help', label: 'Help', icon: HelpCircle }
  ];

  const getTabIcon = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    return tab ? tab.icon : SettingsIcon;
  };

  return (
    <div className="container-mobile py-6 space-mobile">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="p-3 rounded-2xl" style={{ backgroundColor: 'var(--color-synapse-100)' }}>
          <SettingsIcon className="w-6 h-6" style={{ color: 'var(--color-synapse-600)' }} />
        </div>
        <div>
          <h1 className="section-header">Settings</h1>
          <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>
            Customize your Synapse experience
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: 'var(--color-sage-200)' }}>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                      activeTab === tab.id 
                        ? 'shadow-sm' 
                        : 'hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: activeTab === tab.id ? 'var(--color-synapse-50)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--color-synapse-700)' : 'var(--color-sage-700)'
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ 
                      color: activeTab === tab.id ? 'var(--color-synapse-600)' : 'var(--color-sage-500)' 
                    }} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: 'var(--color-sage-200)' }}>
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-sage-800)' }}>
                    General Settings
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--color-sage-50)' }}>
                      <div>
                        <h3 className="font-medium" style={{ color: 'var(--color-sage-800)' }}>
                          Voice Interface
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>
                          Enable voice commands and AI assistant
                        </p>
                      </div>
                      <button
                        onClick={handleVoiceToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          voiceEnabled ? 'bg-synapse-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--color-sage-50)' }}>
                      <div>
                        <h3 className="font-medium" style={{ color: 'var(--color-sage-800)' }}>
                          Auto Backup
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>
                          Automatically backup your data
                        </p>
                      </div>
                      <button
                        onClick={handleAutoBackupToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          autoBackup ? 'bg-synapse-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            autoBackup ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Keys */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-sage-800)' }}>
                    API Configuration
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-sage-50)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium" style={{ color: 'var(--color-sage-800)' }}>
                          Gemini API Key
                        </h3>
                        <button
                          onClick={openGeminiInstructions}
                          className="flex items-center gap-1 text-sm px-3 py-1 rounded-lg transition-colors"
                          style={{ 
                            backgroundColor: 'var(--color-synapse-100)',
                            color: 'var(--color-synapse-700)'
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Get Key
                        </button>
                      </div>
                      
                      <p className="text-sm mb-4" style={{ color: 'var(--color-sage-600)' }}>
                        Your Gemini API key is required for AI-powered features like smart task organization, 
                        flashcard generation, and voice assistance.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="relative">
                          <input
                            type={showGeminiKey ? 'text' : 'password'}
                            value={geminiApiKey}
                            onChange={(e) => { setGeminiApiKey(e.target.value); setApiKeyTested(null); }}
                            placeholder="Enter your Gemini API key"
                            className="w-full p-3 pr-20 rounded-xl border transition-colors focus:outline-none focus:ring-2"
                            style={{
                              borderColor: 'var(--color-sage-200)',
                              focusRingColor: 'var(--color-synapse-500)'
                            }}
                          />
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                            <button
                              onClick={() => setShowGeminiKey(!showGeminiKey)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              style={{ color: 'var(--color-sage-600)' }}
                            >
                              {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            {geminiApiKey && (
                              <button
                                onClick={handleCopyKey}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                style={{ color: 'var(--color-sage-600)' }}
                              >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={testApiKey}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            disabled={isTestingApiKey || !geminiApiKey}
                          >
                            {isTestingApiKey ? 'Testing...' : 'Test API Key'}
                          </button>
                          {apiKeyTested === true && <Check className="w-5 h-5 text-green-600" />}
                          {apiKeyTested === false && <EyeOff className="w-5 h-5 text-red-600" />}
                        </div>
                        
                        <button
                          onClick={handleSaveGeminiKey}
                          className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                          style={{
                            backgroundColor: 'var(--color-synapse-500)',
                            color: 'white'
                          }}
                        >
                          Save API Key
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-sage-800)' }}>
                    Profile Settings
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-sage-700)' }}>
                        Name
                      </label>
                      <input
                        type="text"
                        value={user.name || ''}
                        onChange={(e) => updateUser({ name: e.target.value })}
                        className="w-full p-3 rounded-xl border transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: 'var(--color-sage-200)',
                          focusRingColor: 'var(--color-synapse-500)'
                        }}
                        placeholder="Enter your name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-sage-700)' }}>
                        Subjects
                      </label>
                      <input
                        type="text"
                        value={user.subjects?.join(', ') || ''}
                        onChange={(e) => updateUser({ subjects: e.target.value.split(',').map(s => s.trim()) })}
                        className="w-full p-3 rounded-xl border transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: 'var(--color-sage-200)',
                          focusRingColor: 'var(--color-synapse-500)'
                        }}
                        placeholder="Enter subjects (comma-separated)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-sage-800)' }}>
                    Notification Settings
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--color-sage-50)' }}>
                      <div>
                        <h3 className="font-medium" style={{ color: 'var(--color-sage-800)' }}>
                          Push Notifications
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>
                          Receive notifications for tasks and reminders
                        </p>
                      </div>
                      <button
                        onClick={handleNotificationToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications ? 'bg-synapse-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-sage-800)' }}>
                    Appearance
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-sage-700)' }}>
                        Theme
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleThemeChange('light')}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            theme === 'light' ? 'border-synapse-500 bg-synapse-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Sun className="w-5 h-5" style={{ color: 'var(--color-sage-600)' }} />
                            <span className="font-medium" style={{ color: 'var(--color-sage-700)' }}>Light</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleThemeChange('dark')}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            theme === 'dark' ? 'border-synapse-500 bg-synapse-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Moon className="w-5 h-5" style={{ color: 'var(--color-sage-600)' }} />
                            <span className="font-medium" style={{ color: 'var(--color-sage-700)' }}>Dark</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Backup */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-sage-800)' }}>
                    Data & Backup
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={exportData}
                        className="flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
                        style={{ 
                          borderColor: 'var(--color-sage-200)',
                          color: 'var(--color-sage-700)'
                        }}
                      >
                        <Download className="w-5 h-5" style={{ color: 'var(--color-synapse-500)' }} />
                        <span className="font-medium">Export Data</span>
                      </button>
                      
                      <label className="flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer"
                        style={{ 
                          borderColor: 'var(--color-sage-200)',
                          color: 'var(--color-sage-700)'
                        }}
                      >
                        <Upload className="w-5 h-5" style={{ color: 'var(--color-synapse-500)' }} />
                        <span className="font-medium">Import Data</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={importData}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    <button
                      onClick={clearAllData}
                      className="flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-md w-full"
                      style={{ 
                        borderColor: 'var(--color-red-200)',
                        color: 'var(--color-red-700)'
                      }}
                    >
                      <Trash2 className="w-5 h-5" style={{ color: 'var(--color-red-500)' }} />
                      <span className="font-medium">Clear All Data</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-sage-800)' }}>
                    Privacy & Security
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-sage-50)' }}>
                      <h3 className="font-medium mb-2" style={{ color: 'var(--color-sage-800)' }}>
                        Data Storage
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>
                        Your data is stored locally on your device. We don't collect or store any personal information on our servers.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-sage-50)' }}>
                      <h3 className="font-medium mb-2" style={{ color: 'var(--color-sage-800)' }}>
                        API Usage
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>
                        Your Gemini API key is stored locally and used only for AI features. We don't have access to your API key.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Help */}
            {activeTab === 'help' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-sage-800)' }}>
                    Help & Support
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-sage-50)' }}>
                      <h3 className="font-medium mb-2" style={{ color: 'var(--color-sage-800)' }}>
                        Getting Started
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>
                        1. Set up your Gemini API key in the API Keys section<br/>
                        2. Configure your profile and preferences<br/>
                        3. Start using the AI-powered features
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-sage-50)' }}>
                      <h3 className="font-medium mb-2" style={{ color: 'var(--color-sage-800)' }}>
                        Need Help?
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>
                        If you need assistance, please check our documentation or contact support.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings; 