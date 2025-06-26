import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Chrome,
  X,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle, isLoading: storeLoading } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }

        if (password.length < 6) {
          toast.error('Password must be at least 6 characters long');
          return;
        }

        const result = await signUp(email, password, { name });
        if (result.success) {
          onClose();
          setMode('signin');
        }
      } else {
        const result = await signIn(email, password);
        if (result.success) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  const loading = isLoading || storeLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--color-sage-200)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-sage-800)' }}>
                    {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-sage-600)' }}>
                    {mode === 'signin' 
                      ? 'Sign in to continue your study journey' 
                      : 'Join Synapse to start your AI-powered learning'
                    }
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  style={{ color: 'var(--color-sage-600)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-sage-700)' }}>
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="w-full p-3 pl-10 rounded-xl border transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: 'var(--color-sage-200)',
                          focusRingColor: 'var(--color-synapse-500)'
                        }}
                      />
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-sage-500)' }} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-sage-700)' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full p-3 pl-10 rounded-xl border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--color-sage-200)',
                        focusRingColor: 'var(--color-synapse-500)'
                      }}
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-sage-500)' }} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-sage-700)' }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full p-3 pl-10 pr-10 rounded-xl border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--color-sage-200)',
                        focusRingColor: 'var(--color-synapse-500)'
                      }}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-sage-500)' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ color: 'var(--color-sage-600)' }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-sage-700)' }}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                        className="w-full p-3 pl-10 pr-10 rounded-xl border transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: 'var(--color-sage-200)',
                          focusRingColor: 'var(--color-synapse-500)'
                        }}
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-sage-500)' }} />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        style={{ color: 'var(--color-sage-600)' }}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    backgroundColor: 'var(--color-synapse-500)',
                    color: 'white'
                  }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center">
                <div className="flex-1 border-t" style={{ borderColor: 'var(--color-sage-200)' }} />
                <span className="px-4 text-sm" style={{ color: 'var(--color-sage-500)' }}>or</span>
                <div className="flex-1 border-t" style={{ borderColor: 'var(--color-sage-200)' }} />
              </div>

              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  borderColor: 'var(--color-sage-200)',
                  color: 'var(--color-sage-700)'
                }}
              >
                <Chrome className="w-5 h-5" />
                <span className="font-medium">Continue with Google</span>
              </button>

              {/* Toggle Mode */}
              <div className="mt-6 text-center">
                <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>
                  {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                </p>
                <button
                  onClick={toggleMode}
                  className="mt-2 text-sm font-medium transition-colors hover:underline"
                  style={{ color: 'var(--color-synapse-600)' }}
                >
                  {mode === 'signin' ? 'Create Account' : 'Sign In'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal; 