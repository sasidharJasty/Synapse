import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { verifySupabaseSetup, testDataOperations } from '../utils/setupVerification';
import toast from 'react-hot-toast';
import { GeminiService } from '../lib/gemini';

const SetupModal = ({ isOpen, onComplete }) => {
  const { geminiApiKey, setGeminiApiKey } = useStore();
  const [localApiKey, setLocalApiKey] = useState(geminiApiKey);
  const [debugResults, setDebugResults] = useState(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const [apiKeyTested, setApiKeyTested] = useState(null);
  const [isTestingApiKey, setIsTestingApiKey] = useState(false);

  const handleSave = () => {
    setGeminiApiKey(localApiKey);
    localStorage.setItem('setup-complete', 'true');
    onComplete();
    toast.success('Setup completed successfully!');
  };

  const runDebugTests = async () => {
    setIsDebugging(true);
    try {
      const results = await verifySupabaseSetup();
      setDebugResults(results);
      
      if (results.overall) {
        toast.success('Supabase setup is working correctly!');
      } else {
        toast.error('Some issues found. Check the console for details.');
      }
    } catch (error) {
      console.error('Debug test failed:', error);
      toast.error('Debug test failed. Check console for details.');
    } finally {
      setIsDebugging(false);
    }
  };

  const runDataTests = async () => {
    try {
      await testDataOperations();
      toast.success('Data operation tests completed!');
    } catch (error) {
      console.error('Data tests failed:', error);
      toast.error('Data tests failed. Check console for details.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Welcome to Synapse</h2>
                <p className="text-sm text-gray-600">Let's get you set up</p>
              </div>
            </div>
            <button
              onClick={onComplete}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* API Key Setup */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Set Up Gemini API Key (Optional)
              </h3>
              <p className="text-gray-600 mb-4">
                To use AI features like goal breakdown and mood analysis, you'll need a Gemini API key.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={localApiKey}
                    onChange={(e) => { setLocalApiKey(e.target.value); setApiKeyTested(null); }}
                    placeholder="Enter your Gemini API key"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsTestingApiKey(true);
                        setApiKeyTested(null);
                        const valid = await GeminiService.testApiKey(localApiKey);
                        setApiKeyTested(valid);
                        setIsTestingApiKey(false);
                        if (valid) toast.success('Gemini API key is valid!');
                        else toast.error('Invalid Gemini API key.');
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      disabled={isTestingApiKey || !localApiKey}
                    >
                      {isTestingApiKey ? 'Testing...' : 'Test API Key'}
                    </button>
                    {apiKeyTested === true && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {apiKeyTested === false && <AlertCircle className="w-5 h-5 text-red-600" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    You can get a free API key from{' '}
                    <a 
                      href="https://makersuite.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Optional but Recommended</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        The API key enables AI-powered features. You can skip this step and add it later in settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Database Setup Verification */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Verify Database Setup
              </h3>
              <p className="text-gray-600 mb-4">
                Let's make sure your Supabase database is properly configured.
              </p>

              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Database Setup Required</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Make sure you've followed the setup guide in SUPABASE_SETUP.md and created all required tables.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={runDebugTests}
                    disabled={isDebugging}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isDebugging ? 'Running Tests...' : 'Run Setup Tests'}
                  </button>
                  <button
                    onClick={runDataTests}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Test Data Operations
                  </button>
                </div>

                {debugResults && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-800 mb-3">Test Results:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {debugResults.environment ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm">Environment Variables</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {debugResults.connection ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm">Database Connection</span>
                      </div>
                      {Object.entries(debugResults.tables).map(([table, exists]) => (
                        <div key={table} className="flex items-center space-x-2">
                          {exists ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm capitalize">{table.replace('_', ' ')} Table</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Need Help?</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        If tests fail, check the browser console for detailed error messages and refer to the troubleshooting guide in SUPABASE_SETUP.md
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <button
                onClick={onComplete}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Complete Setup
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SetupModal; 