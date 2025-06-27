import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Brain, 
  MessageSquare, 
  Map,
  Download,
  Mic,
  MicOff
} from 'lucide-react';
import useStore from '../store/useStore';
import { GeminiService } from '../lib/gemini';
import VoiceInterface from '../utils/voiceInterface';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const LectureEnhancer = () => {
  const [lectureText, setLectureText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [voiceInterface, setVoiceInterface] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [showGraph, setShowGraph] = useState(false);

  useState(() => {
    const vi = new VoiceInterface();
    setVoiceInterface(vi);
  }, []);

  const analyzeLecture = async () => {
    if (!lectureText.trim()) {
      toast.error('Please enter lecture content');
      return;
    }

    setLoading(true);
    try {
      const result = await GeminiService.enhanceLecture(lectureText);
      // Validate result structure
      if (!result || typeof result !== 'object' || !result.summary || !Array.isArray(result.key_points) || !Array.isArray(result.clarifying_questions) || !result.concept_map) {
        toast.error('AI did not return valid lecture analysis. Please try again or check your API key.');
        setAnalysis({
          summary: 'Lecture analysis completed',
          key_points: [],
          clarifying_questions: [],
          concept_map: { main_concept: 'Main topic', sub_concepts: [] }
        });
        return;
      }
      setAnalysis(result);
      toast.success('Lecture analyzed! Check the results below.');
    } catch (error) {
      console.error('Error analyzing lecture:', error);
      toast.error('Error analyzing lecture. Please check your API key or try again.');
      setAnalysis({
        summary: 'Lecture analysis completed',
        key_points: [],
        clarifying_questions: [],
        concept_map: { main_concept: 'Main topic', sub_concepts: [] }
      });
    } finally {
      setLoading(false);
    }
  };

  const startTranscription = () => {
    if (!voiceInterface) {
      toast.error('Voice interface not available');
      return;
    }

    setIsTranscribing(true);
    setIsListening(true);
    
    voiceInterface.startListening(
      (transcript) => {
        setLectureText(prev => prev + ' ' + transcript);
        setIsListening(false);
        setIsTranscribing(false);
      },
      (error) => {
        console.error('Transcription error:', error);
        setIsListening(false);
        setIsTranscribing(false);
        toast.error('Transcription error. Please try again.');
      }
    );
  };

  const stopTranscription = () => {
    if (voiceInterface) {
      voiceInterface.stopListening();
    }
    setIsListening(false);
    setIsTranscribing(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        // PDF parsing
        const reader = new FileReader();
        reader.onload = async (e) => {
          const typedarray = new Uint8Array(e.target.result);
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
          }
          setLectureText(text);
        };
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setLectureText(e.target.result);
        };
        reader.readAsText(file);
      }
    }
  };

  const downloadSummary = () => {
    if (!analysis) return;
    
    const content = `
Lecture Analysis Summary

Key Points:
${analysis.key_points.map(point => `• ${point}`).join('\n')}

Summary:
${analysis.summary}

Clarifying Questions:
${analysis.clarifying_questions.map(q => `• ${q}`).join('\n')}

Concept Map:
Main Concept: ${analysis.concept_map.main_concept}
Sub-concepts: ${analysis.concept_map.sub_concepts.join(', ')}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lecture-analysis.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const askQuestion = async () => {
    if (!lectureText.trim() || !question.trim()) {
      toast.error('Please upload a lecture or enter text and a question.');
      return;
    }
    setLoading(true);
    try {
      const result = await GeminiService.askLectureQuestion(lectureText, question);
      setAnswer(result.answer || 'No answer found.');
      toast.success('Answer generated!');
    } catch (error) {
      setAnswer('Error generating answer.');
      toast.error('Error generating answer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient mb-2 flex items-center justify-center">
          <FileText className="w-8 h-8 mr-3" />
          Lecture Enhancer
        </h1>
        <p className="text-gray-600">Transform your lecture notes with AI-powered analysis and insights</p>
      </div>

      {/* Input Section */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter Your Lecture Content</h2>
        
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Lecture File (Optional, PDF or Text)
            </label>
            <input
              type="file"
              accept=".txt,.md,.pdf"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-synapse-50 file:text-synapse-700 hover:file:bg-synapse-100"
            />
          </div>

          {/* Voice Transcription */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice Transcription
            </label>
            <div className="flex gap-3">
              <button
                onClick={isTranscribing ? stopTranscription : startTranscription}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  isTranscribing
                    ? 'bg-red-100 border-red-300 text-red-600'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isTranscribing ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </>
                )}
              </button>
              {isTranscribing && (
                <div className="flex items-center text-sm text-red-600">
                  <div className="animate-pulse">Recording...</div>
                </div>
              )}
            </div>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lecture Content
            </label>
            <textarea
              value={lectureText}
              onChange={(e) => setLectureText(e.target.value)}
              placeholder="Paste your lecture notes, transcript, or type your content here..."
              className="input-field resize-none"
              rows="10"
            />
          </div>

          <button
            onClick={analyzeLecture}
            disabled={loading || !lectureText.trim()}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            Analyze Lecture
          </button>
        </div>
      </div>

      {/* Ask Questions Section */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-2 flex items-center"><MessageSquare className="w-5 h-5 mr-2" />Ask Questions About Lecture</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Type your question about the lecture..."
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <button
            onClick={askQuestion}
            className="px-4 py-2 rounded-lg bg-synapse-500 text-white font-semibold hover:bg-synapse-600"
            disabled={loading}
          >Ask</button>
        </div>
        {answer && (
          <div className="bg-sage-50 p-3 rounded-lg border mt-2 text-gray-800">
            <strong>Answer:</strong> {answer}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Key Points */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Points</h2>
            <div className="space-y-2">
              {analysis.key_points.map((point, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-synapse-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-gray-700">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clarifying Questions */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Questions to Ask Your Teacher
            </h2>
            <div className="space-y-3">
              {analysis.clarifying_questions.map((question, index) => (
                <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-gray-800 font-medium">Question {index + 1}:</p>
                  <p className="text-gray-700 mt-1">{question}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Concept Map */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-2 flex items-center"><Map className="w-5 h-5 mr-2" />Concept Map</h2>
            <button
              onClick={() => setShowGraph(g => !g)}
              className="px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 mb-2"
            >{showGraph ? 'Hide' : 'Show'} Concept Net</button>
            {showGraph && analysis && analysis.concept_map && (
              <div id="concept-graph" className="w-full h-96 bg-white rounded-lg border mt-2 flex items-center justify-center">
                {/* Placeholder for D3/vis.js net visualization */}
                <span className="text-gray-400">[Concept Net Visualization Here]</span>
              </div>
            )}
          </div>

          {/* Download Button */}
          <div className="flex justify-center">
            <button
              onClick={downloadSummary}
              className="btn-secondary flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Analysis
            </button>
          </div>
        </div>
      )}

      {/* Features Overview */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="text-center">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Enhance Your Learning
          </h3>
          <p className="text-gray-600 mb-6">
            Transform any lecture content into structured, actionable insights. 
            Perfect for reviewing class notes, preparing for exams, or understanding complex topics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Smart Summaries</h4>
              <p>AI-powered content analysis and key point extraction</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Voice Input</h4>
              <p>Real-time transcription for live lectures</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Concept Mapping</h4>
              <p>Visual organization of ideas and relationships</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureEnhancer; 