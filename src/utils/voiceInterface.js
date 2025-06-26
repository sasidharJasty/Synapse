class VoiceInterface {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.onResult = null;
    this.onError = null;
    
    this.initializeSpeechRecognition();
  }

  initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (this.onResult) {
          this.onResult(transcript);
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (this.onError) {
          this.onError(event.error);
        }
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
      };
    } else {
      console.warn('Speech recognition not supported');
    }
  }

  startListening(onResult, onError) {
    if (!this.recognition) {
      onError?.('Speech recognition not supported');
      return false;
    }

    this.onResult = onResult;
    this.onError = onError;
    
    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      onError?.(error.message);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text, options = {}) {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Stop any current speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set default options
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.lang || 'en-US';
    
    // Try to use a pleasant voice
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || voice.name.includes('Samantha')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    this.synthesis.speak(utterance);
  }

  // Mood detection from voice
  detectMoodFromVoice(text) {
    const lowerText = text.toLowerCase();
    
    // Simple keyword-based mood detection
    const moodKeywords = {
      happy: ['happy', 'excited', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic'],
      sad: ['sad', 'depressed', 'down', 'miserable', 'terrible', 'awful', 'horrible'],
      angry: ['angry', 'frustrated', 'mad', 'annoyed', 'irritated', 'upset'],
      tired: ['tired', 'exhausted', 'sleepy', 'drained', 'fatigued'],
      motivated: ['motivated', 'energized', 'ready', 'focused', 'determined'],
      stressed: ['stressed', 'anxious', 'worried', 'overwhelmed', 'nervous']
    };

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return mood;
      }
    }

    return 'neutral';
  }

  // Energy level detection
  detectEnergyLevel(text) {
    const lowerText = text.toLowerCase();
    
    const energyIndicators = {
      high: ['energized', 'pumped', 'ready', 'focused', 'alert', 'awake'],
      medium: ['okay', 'fine', 'normal', 'average', 'moderate'],
      low: ['tired', 'exhausted', 'sleepy', 'drained', 'fatigued', 'low energy']
    };

    for (const [level, indicators] of Object.entries(energyIndicators)) {
      if (indicators.some(indicator => lowerText.includes(indicator))) {
        return level;
      }
    }

    return 'medium';
  }

  // Intent detection
  detectIntent(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('schedule') || lowerText.includes('plan') || lowerText.includes('organize')) {
      return 'planner';
    }
    
    if (lowerText.includes('mood') || lowerText.includes('feel') || lowerText.includes('emotion')) {
      return 'mood';
    }
    
    if (lowerText.includes('motivation') || lowerText.includes('inspire') || lowerText.includes('encourage')) {
      return 'motivation';
    }
    
    if (lowerText.includes('flashcard') || lowerText.includes('study') || lowerText.includes('learn')) {
      return 'flashcards';
    }
    
    if (lowerText.includes('goal') || lowerText.includes('target') || lowerText.includes('objective')) {
      return 'goals';
    }
    
    return 'general';
  }

  // Generate appropriate response based on intent and mood
  generateVoiceResponse(intent, mood, energyLevel) {
    const responses = {
      planner: {
        happy: "Great! Let's create an amazing schedule for you.",
        sad: "I understand. Let's make a gentle, manageable plan.",
        tired: "Let's create a schedule that respects your energy levels.",
        stressed: "Let's organize your day to reduce stress.",
        default: "I'll help you plan your day effectively."
      },
      mood: {
        happy: "I'm so glad you're feeling good! Let's keep that energy going.",
        sad: "It's okay to feel this way. Let's work on something that might help.",
        tired: "Rest is important. Let's adjust our plans accordingly.",
        stressed: "Let's take a moment to breathe and find some calm.",
        default: "How can I help you feel better today?"
      },
      motivation: {
        happy: "Your positive energy is contagious! Keep it up!",
        sad: "Remember, every expert was once a beginner. You've got this!",
        tired: "Small steps lead to big changes. Let's start with something simple.",
        stressed: "You're stronger than you think. Let's break this down together.",
        default: "You're capable of amazing things. Let's get started!"
      },
      flashcards: {
        happy: "Perfect! Let's make learning fun and engaging.",
        sad: "Learning can be a great distraction. Let's make it enjoyable.",
        tired: "Let's keep it light and easy. Small study sessions work wonders.",
        stressed: "Let's focus on one thing at a time. You'll do great.",
        default: "Ready to learn something new!"
      }
    };

    const intentResponses = responses[intent] || responses.planner;
    return intentResponses[mood] || intentResponses.default;
  }
}

export default VoiceInterface; 