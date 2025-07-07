import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, VolumeX } from 'lucide-react';
import useStore from '../store/useStore';
import VoiceInterface from '../utils/voiceInterface';
import { GeminiService } from '../lib/gemini';

const VoiceAssistant = () => {
  const { mood, addMoodEntry, voiceEnabled, setVoiceEnabled, isListening, setIsListening } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const voiceInterface = useRef(null);

  useEffect(() => {
    voiceInterface.current = new VoiceInterface();
    
    // Check if voice is enabled
    if (voiceEnabled) {
      setIsMuted(false);
    }
  }, [voiceEnabled]);

  const handleVoiceCommand = async () => {
    if (!voiceInterface.current) return;

    if (isListening) {
      // Stop listening
      voiceInterface.current.stopListening();
      setIsListening(false);
      setIsProcessing(true);
      
      try {
        // Process the command using Gemini
        const processedResult = await GeminiService.processVoiceCommand(transcript);
        setResponse(processedResult.response);
        
        // Update mood if detected
        if (processedResult.action === 'analyze_mood') {
          const moodScore = 7; // Default mood score
          const moodAnalysis = await GeminiService.analyzeMood(moodScore, transcript);
          addMoodEntry({
            mood: moodScore,
            energy: mood.energy,
            timestamp: new Date().toISOString(),
            source: 'voice',
            description: transcript
          });
        }
      } catch (error) {
        console.error('Voice processing error:', error);
        setResponse('Sorry, I had trouble processing that. Could you try again?');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Start listening
      setIsListening(true);
      setTranscript('');
      setResponse('');
      
      try {
        const success = voiceInterface.current.startListening(
          (transcript) => {
            setTranscript(transcript);
            // Auto-stop after getting transcript
            voiceInterface.current.stopListening();
            setIsListening(false);
            setIsProcessing(true);
            
            // Process the command
            GeminiService.processVoiceCommand(transcript)
              .then((processedResult) => {
                setResponse(processedResult.response);
                
                // Update mood if detected
                if (processedResult.action === 'analyze_mood') {
                  const moodScore = 7; // Default mood score
                  return GeminiService.analyzeMood(moodScore, transcript);
                }
              })
              .then((moodAnalysis) => {
                if (moodAnalysis) {
                  addMoodEntry({
                    mood: 7,
                    energy: mood.energy,
                    timestamp: new Date().toISOString(),
                    source: 'voice',
                    description: transcript
                  });
                }
              })
              .catch((error) => {
                console.error('Voice processing error:', error);
                setResponse('Sorry, I had trouble processing that. Could you try again?');
              })
              .finally(() => {
                setIsProcessing(false);
              });
          },
          (error) => {
            console.error('Voice recognition error:', error);
            setIsListening(false);
            setResponse('Sorry, I couldn\'t understand that. Please try again.');
          }
        );
        
        if (!success) {
          setIsListening(false);
          setResponse('Sorry, I couldn\'t start listening. Please check your microphone permissions.');
        }
      } catch (error) {
        console.error('Voice recognition error:', error);
        setIsListening(false);
        setResponse('Sorry, I couldn\'t start listening. Please check your microphone permissions.');
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setVoiceEnabled(!isMuted);
  };

  const closeAssistant = () => {
    setIsExpanded(false);
    setIsListening(false);
    setTranscript('');
    setResponse('');
    setIsProcessing(false);
    if (voiceInterface.current) {
      voiceInterface.current.stopListening();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsExpanded(true)}
        className="fab"
        style={{
          background: isListening 
            ? 'linear-gradient(to right, var(--color-red-500), var(--color-red-600))'
            : 'linear-gradient(to right, var(--color-synapse-500), var(--color-synapse-600))'
        }}
      >
        <Mic className="w-6 h-6" />
      </button>

      {/* Expanded Assistant */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end lg:items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-sage-200)' }}>
              <div className="flex items-center gap-3">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isListening 
                      ? 'animate-pulse' 
                      : ''
                  }`}
                  style={{
                    backgroundColor: isListening 
                      ? 'var(--color-red-100)' 
                      : 'var(--color-sage-100)',
                    border: isListening 
                      ? '4px solid var(--color-red-300)' 
                      : '4px solid var(--color-sage-300)'
                  }}
                >
                  <Mic className="w-8 h-8" style={{ color: 'var(--color-sage-600)' }} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-sage-800)' }}>
                    Voice Assistant
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>
                    {isListening ? 'Listening...' : 'Tap to speak'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  style={{ color: 'var(--color-sage-600)' }}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={closeAssistant}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  style={{ color: 'var(--color-sage-600)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Main Action Button */}
              <button
                onClick={handleVoiceCommand}
                disabled={isProcessing}
                className={`w-full py-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 ${
                  isListening 
                    ? 'animate-pulse' 
                    : 'hover:scale-105'
                }`}
                style={{
                  background: isListening 
                    ? 'linear-gradient(to right, var(--color-red-500), var(--color-red-600))'
                    : 'linear-gradient(to right, var(--color-synapse-500), var(--color-synapse-600))',
                  color: 'white'
                }}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    <span className="text-lg font-medium">
                      {isListening ? 'Stop Listening' : 'Start Listening'}
                    </span>
                  </>
                )}
              </button>

              {/* Transcript */}
              {transcript && (
                <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-sage-50)' }}>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-sage-700)' }}>
                    <Mic className="w-4 h-4" />
                    You said:
                  </h5>
                  <p style={{ color: 'var(--color-sage-800)' }}>{transcript}</p>
                </div>
              )}

              {/* Response */}
              {response && (
                <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-synapse-50)' }}>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-synapse-700)' }}>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--color-synapse-500)' }}></div>
                    Synapse responded:
                  </h5>
                  <p style={{ color: 'var(--color-synapse-800)' }}>{response}</p>
                </div>
              )}

              {/* Quick Commands */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium" style={{ color: 'var(--color-sage-700)' }}>
                  Try saying:
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'How am I feeling?',
                    'Create a study plan',
                    'Set a reminder',
                    'Track my mood'
                  ].map((command, index) => (
                    <button
                      key={index}
                      onClick={() => setTranscript(command)}
                      className="p-2 text-xs rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'var(--color-sage-100)',
                        color: 'var(--color-sage-700)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--color-sage-200)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'var(--color-sage-100)';
                      }}
                    >
                      {command}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant; 