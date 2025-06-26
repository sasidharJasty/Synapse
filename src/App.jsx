import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navigation from './components/Navigation';
import SetupModal from './components/SetupModal';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';
import PageErrorBoundary from './components/PageErrorBoundary';
import Dashboard from './pages/Dashboard';
import Flashcards from './pages/Flashcards';
import Planner from './pages/Planner';
import MoodTracker from './pages/MoodTracker';
import LectureEnhancer from './pages/LectureEnhancer';
import PeerMatch from './pages/PeerMatch';
import VoiceInterface from './pages/VoiceInterface';
import Calendar from './pages/Calendar';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import { useStore } from './store/useStore';
import './App.css';

function App() {
  const [showSetup, setShowSetup] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { isAuthenticated, checkAuth, isLoading } = useStore();

  useEffect(() => {
    // Check authentication status
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Check if setup is complete (only if authenticated)
    if (isAuthenticated) {
      const setupComplete = localStorage.getItem('setup-complete');
      if (!setupComplete) {
        setShowSetup(true);
      }
    }
  }, [isAuthenticated]);

  const handleSetupComplete = () => {
    setShowSetup(false);
  };

  const handleAuthClose = () => {
    setShowAuth(false);
  };

  // Show auth modal if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuth(true);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-sage-50)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-synapse-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium" style={{ color: 'var(--color-sage-700)' }}>
            Loading Synapse...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <div className="App">
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-sage-50)',
                color: 'var(--color-sage-800)',
                border: '1px solid var(--color-sage-200)',
              },
            }}
          />
          
          <SetupModal 
            isOpen={showSetup} 
            onComplete={handleSetupComplete} 
          />
          
          <AuthModal 
            isOpen={showAuth} 
            onClose={handleAuthClose}
            initialMode="signin"
          />
          
          {isAuthenticated && (
            <div className="flex">
              <Navigation />
              <main className="flex-1 min-h-screen w-full" >
                {/* Mobile padding for header and bottom nav */}
                <div className="lg:hidden pt-20 pb-24"></div>
                
                {/* Desktop padding */}
                <div className="hidden lg:block pt-8 pb-8"></div>
                
                <Routes>
                  <Route path="/" element={
                    <PageErrorBoundary>
                      <Dashboard />
                    </PageErrorBoundary>
                  } />
                  <Route path="/dashboard" element={
                    <PageErrorBoundary>
                      <Dashboard />
                    </PageErrorBoundary>
                  } />
                  <Route path="/flashcards" element={
                    <PageErrorBoundary>
                      <Flashcards />
                    </PageErrorBoundary>
                  } />
                  <Route path="/planner" element={
                    <PageErrorBoundary>
                      <Planner />
                    </PageErrorBoundary>
                  } />
                  <Route path="/mood-tracker" element={
                    <PageErrorBoundary>
                      <MoodTracker />
                    </PageErrorBoundary>
                  } />
                  <Route path="/lecture-enhancer" element={
                    <PageErrorBoundary>
                      <LectureEnhancer />
                    </PageErrorBoundary>
                  } />
                  <Route path="/peer-match" element={
                    <PageErrorBoundary>
                      <PeerMatch />
                    </PageErrorBoundary>
                  } />
                  <Route path="/voice-interface" element={
                    <PageErrorBoundary>
                      <VoiceInterface />
                    </PageErrorBoundary>
                  } />
                  <Route path="/calendar" element={
                    <PageErrorBoundary>
                      <Calendar />
                    </PageErrorBoundary>
                  } />
                  <Route path="/goals" element={
                    <PageErrorBoundary>
                      <Goals />
                    </PageErrorBoundary>
                  } />
                  <Route path="/settings" element={
                    <PageErrorBoundary>
                      <Settings />
                    </PageErrorBoundary>
                  } />
                </Routes>
              </main>
            </div>
          )}
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
