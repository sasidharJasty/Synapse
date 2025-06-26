import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  RotateCcw, 
  Check, 
  X, 
  Play,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  Brain,
  Target
} from 'lucide-react';
import useStore from '../store/useStore';
import { GeminiService } from '../lib/gemini';
import toast from 'react-hot-toast';

const Flashcards = () => {
  const { flashcards, addFlashcard, completeStudySession } = useStore();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentFlashcards, setCurrentFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [score, setScore] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      setCurrentFlashcards(flashcards);
    }
  }, [flashcards]);

  const generateFlashcards = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const result = await GeminiService.generateFlashcards(topic);
      
      if (result.flashcards && result.flashcards.length > 0) {
        const newFlashcards = result.flashcards.map((fc, index) => ({
          id: Date.now() + index,
          question: fc.question,
          answer: fc.answer,
          topic: topic,
          created: new Date().toISOString()
        }));

        setCurrentFlashcards(newFlashcards);
        setQuizData(result.quiz);
        setCurrentIndex(0);
        setIsFlipped(false);
        setStudyMode(false);
        setScore(0);
        setShowQuiz(false);
        
        toast.success(`Generated ${newFlashcards.length} flashcards for "${topic}"`);
      } else {
        toast.error('Could not generate flashcards. Please try again.');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error('Error generating flashcards. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    if (currentIndex < currentFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const startStudyMode = () => {
    setStudyMode(true);
    setScore(0);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const markAsKnown = () => {
    setScore(score + 1);
    nextCard();
  };

  const markAsUnknown = () => {
    nextCard();
  };

  const handleQuizAnswer = (answer) => {
    setSelectedAnswer(answer);
    const correct = answer === quizData.correct;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
    }
  };

  const completeSession = () => {
    const sessionData = {
      topic: topic,
      flashcards: currentFlashcards.length,
      score: score,
      total: currentFlashcards.length + (quizData ? 1 : 0),
      date: new Date().toISOString()
    };
    
    completeStudySession(sessionData);
    toast.success(`Study session completed! Score: ${score}/${sessionData.total}`);
    
    setStudyMode(false);
    setShowQuiz(false);
    setScore(0);
  };

  const speakText = (text) => {
    if (!audioEnabled) return;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const currentCard = currentFlashcards[currentIndex];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient mb-2 flex items-center justify-center">
          <BookOpen className="w-8 h-8 mr-3" />
          Smart Flashcards
        </h1>
        <p className="text-gray-600">AI-powered study materials that adapt to your learning style</p>
      </div>

      {/* Generate New Flashcards */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Flashcards</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g., Photosynthesis, Calculus, World History)"
            className="input-field flex-1"
            onKeyPress={(e) => e.key === 'Enter' && generateFlashcards()}
          />
          <button
            onClick={generateFlashcards}
            disabled={loading}
            className="btn-primary flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Generate
          </button>
        </div>
      </div>

      {/* Flashcards Display */}
      {currentFlashcards.length > 0 && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentFlashcards([])}
                className="btn-secondary flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Topic
              </button>
              
              {!studyMode && (
                <button
                  onClick={startStudyMode}
                  className="btn-primary flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Study Mode
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-2 rounded-lg ${
                  audioEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              
              <span className="text-sm text-gray-600">
                {currentIndex + 1} of {currentFlashcards.length}
              </span>
            </div>
          </div>

          {/* Flashcard */}
          <div className="flex justify-center">
            <motion.div
              className="w-full max-w-md"
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="card cursor-pointer h-64 flex items-center justify-center relative"
                onClick={flipCard}
              >
                <motion.div
                  className="w-full h-full flex items-center justify-center p-6 text-center"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center p-6 ${
                      isFlipped ? 'opacity-0' : 'opacity-100'
                    }`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        {currentCard?.question}
                      </h3>
                      <p className="text-sm text-gray-500">Click to reveal answer</p>
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center p-6 ${
                      isFlipped ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">
                        {currentCard?.answer}
                      </h3>
                    </div>
                  </div>
                </motion.div>

                {/* Audio Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(isFlipped ? currentCard?.answer : currentCard?.question);
                  }}
                  className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          {!studyMode && (
            <div className="flex justify-center space-x-4">
              <button
                onClick={prevCard}
                disabled={currentIndex === 0}
                className="btn-secondary flex items-center disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>
              
              <button
                onClick={nextCard}
                disabled={currentIndex === currentFlashcards.length - 1}
                className="btn-secondary flex items-center disabled:opacity-50"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}

          {/* Study Mode Controls */}
          {studyMode && (
            <div className="flex justify-center space-x-4">
              <button
                onClick={markAsUnknown}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Don't Know
              </button>
              
              <button
                onClick={markAsKnown}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Know It
              </button>
            </div>
          )}

          {/* Quiz Section */}
          {quizData && !showQuiz && currentIndex === currentFlashcards.length - 1 && !studyMode && (
            <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <div className="text-center">
                <Target className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready for a Quiz?</h3>
                <p className="text-gray-600 mb-4">Test your knowledge with a quick quiz question!</p>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="btn-primary"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          )}

          {/* Quiz Display */}
          {showQuiz && quizData && (
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quiz Question</h3>
              <p className="text-lg text-gray-700 mb-6">{quizData.question}</p>
              
              <div className="space-y-3">
                {quizData.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(option)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 text-left rounded-lg border transition-all ${
                      selectedAnswer === option
                        ? isCorrect
                          ? 'bg-green-100 border-green-500 text-green-800'
                          : 'bg-red-100 border-red-500 text-red-800'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {selectedAnswer && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800 mb-2">
                    {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                  </p>
                  <p className="text-gray-600">{quizData.explanation}</p>
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <button
                  onClick={completeSession}
                  className="btn-primary"
                >
                  Complete Session
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {currentFlashcards.length === 0 && !loading && (
        <div className="card text-center py-12">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Study?</h3>
          <p className="text-gray-600 mb-6">
            Enter a topic above to generate AI-powered flashcards and start learning!
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Perfect for any subject or concept</p>
            <p>• Includes interactive quiz questions</p>
            <p>• Tracks your learning progress</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards; 