import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Target, 
  Heart, 
  FileText, 
  Users, 
  Mic,
  Settings,
  ChevronDown,
  ChevronUp,
  LogOut,
  User,
  Brain,
  Zap,
  Clock,
  TrendingUp,
  X
} from 'lucide-react';
import { useStore } from '../store/useStore';

const Navigation = () => {
  const location = useLocation();
  const { user, mood, signOut } = useStore();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Primary navigation items (always visible in bottom tabs)
  const primaryNavItems = [
    { path: '/dashboard', label: 'Home', icon: Home, shortLabel: 'Home' },
    { path: '/flashcards', label: 'Study', icon: BookOpen, shortLabel: 'Study' },
    { path: '/planner', label: 'Plan', icon: Target, shortLabel: 'Plan' },
    { path: '/calendar', label: 'Calendar', icon: Calendar, shortLabel: 'Cal' },
  ];

  // Secondary navigation items (in dropdown)
  const secondaryNavItems = [
    { 
      path: '/mood-tracker', 
      label: 'Mood Tracker', 
      icon: Heart, 
      description: 'Track your daily mood and energy',
      category: 'Wellness'
    },
    { 
      path: '/goals', 
      label: 'Goals', 
      icon: Target, 
      description: 'Set and track your academic goals',
      category: 'Productivity'
    },
    { 
      path: '/lecture-enhancer', 
      label: 'Lecture Enhancer', 
      icon: FileText, 
      description: 'AI-powered lecture analysis',
      category: 'Study Tools'
    },
    { 
      path: '/peer-match', 
      label: 'Peer Match', 
      icon: Users, 
      description: 'Find study partners',
      category: 'Collaboration'
    },
    { 
      path: '/voice-interface', 
      label: 'Voice Assistant', 
      icon: Mic, 
      description: 'Voice-controlled study assistant',
      category: 'Study Tools'
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: Settings, 
      description: 'App preferences and account',
      category: 'System'
    },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  const getMoodEmoji = (score) => {
    if (!score) return '😊'; // Default emoji when no mood data
    if (score >= 8) return '😄';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '😔';
    return '😢';
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Group secondary items by category
  const groupedSecondaryItems = secondaryNavItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const PrimaryNavItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <Link
        to={item.path}
        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 relative ${
          active ? 'scale-105' : 'hover:scale-105'
        }`}
        style={{
          color: active ? 'var(--color-synapse-600)' : 'var(--color-sage-600)'
        }}
      >
        <div className={`p-2 rounded-full mb-1 transition-all duration-200 ${
          active ? 'shadow-md' : ''
        }`}
        style={{
          backgroundColor: active ? 'var(--color-synapse-100)' : 'transparent'
        }}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium">{item.shortLabel}</span>
        {active && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 rounded-xl"
            style={{ 
              backgroundColor: 'var(--color-synapse-50)',
              zIndex: -1
            }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </Link>
    );
  };

  const SecondaryNavItem = ({ item, onClick }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
          active ? 'shadow-sm' : 'hover:bg-gray-50'
        }`}
        style={{
          backgroundColor: active ? 'var(--color-synapse-50)' : 'transparent',
          color: active ? 'var(--color-synapse-700)' : 'var(--color-sage-700)'
        }}
      >
        <div className={`p-2 rounded-lg ${
          active ? 'shadow-sm' : ''
        }`}
        style={{
          backgroundColor: active ? 'var(--color-synapse-100)' : 'var(--color-sage-100)'
        }}>
          <Icon className="w-4 h-4" style={{ 
            color: active ? 'var(--color-synapse-600)' : 'var(--color-sage-600)' 
          }} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{item.label}</p>
          <p className="text-xs opacity-70">{item.description}</p>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm" style={{ borderColor: 'var(--color-sage-200)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-synapse-500)' }}>
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--color-sage-800)' }}>
                Synapse
              </h1>
              <p className="text-xs" style={{ color: 'var(--color-sage-600)' }}>
                AI Study Assistant
              </p>
            </div>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: 'var(--color-synapse-100)' }}>
              <span className="text-2xl">{getMoodEmoji(mood.current)}</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium" style={{ color: 'var(--color-sage-800)' }}>
                {user?.name || 'Student'}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-sage-600)' }}>
                {mood.current ? `${mood.current}/10` : 'No mood recorded'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:min-h-screen">
        <div className="fixed top-0 left-0 w-64 h-full bg-white border-r shadow-sm z-40" style={{ borderColor: 'var(--color-sage-200)' }}>
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: 'var(--color-sage-200)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-synapse-500)' }}>
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-sage-800)' }}>
                  Synapse
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-sage-600)' }}>
                  AI Study Assistant
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-sage-50)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-synapse-100)' }}>
                <span className="text-2xl">{getMoodEmoji(mood.current)}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--color-sage-800)' }}>
                  {user?.name || 'Student'}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-sage-600)' }}>
                  Mood: {mood.current ? `${mood.current}/10` : 'Not recorded'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            {primaryNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive(item.path) ? 'shadow-sm' : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: isActive(item.path) ? 'var(--color-synapse-50)' : 'transparent',
                  color: isActive(item.path) ? 'var(--color-synapse-700)' : 'var(--color-sage-700)'
                }}
              >
                <item.icon className="w-5 h-5" style={{ 
                  color: isActive(item.path) ? 'var(--color-synapse-600)' : 'var(--color-sage-500)' 
                }} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="my-4 border-t" style={{ borderColor: 'var(--color-sage-200)' }} />

          {/* Secondary Navigation */}
          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive(item.path) ? 'shadow-sm' : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: isActive(item.path) ? 'var(--color-synapse-50)' : 'transparent',
                  color: isActive(item.path) ? 'var(--color-synapse-700)' : 'var(--color-sage-700)'
                }}
              >
                <item.icon className="w-5 h-5" style={{ 
                  color: isActive(item.path) ? 'var(--color-synapse-600)' : 'var(--color-sage-500)' 
                }} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Sign Out */}
          <div className="mt-auto pt-4">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-red-50"
              style={{ color: 'var(--color-red-600)' }}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg" style={{ borderColor: 'var(--color-sage-200)' }}>
        <div className="flex items-center justify-around p-2">
          {primaryNavItems.map((item) => (
            <PrimaryNavItem key={item.path} item={item} />
          ))}
          
          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 relative ${
              showMoreMenu ? 'scale-105' : 'hover:scale-105'
            }`}
            style={{
              color: showMoreMenu ? 'var(--color-synapse-600)' : 'var(--color-sage-600)'
            }}
          >
            <div className={`p-2 rounded-full mb-1 transition-all duration-200 ${
              showMoreMenu ? 'shadow-md' : ''
            }`}
            style={{
              backgroundColor: showMoreMenu ? 'var(--color-synapse-100)' : 'transparent'
            }}>
              {showMoreMenu ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
            <span className="text-xs font-medium">More</span>
          </button>
        </div>

        {/* More Menu Overlay */}
        <AnimatePresence>
          {showMoreMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full left-0 right-0 bg-white border-t rounded-t-3xl shadow-2xl p-6 mb-2 max-h-[70vh] overflow-y-auto"
              style={{ borderColor: 'var(--color-sage-200)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-sage-800)' }}>
                  More Features
                </h3>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" style={{ color: 'var(--color-sage-600)' }} />
                </button>
              </div>

              {/* Grouped Navigation Items */}
              <div className="space-y-6">
                {Object.entries(groupedSecondaryItems).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--color-sage-700)' }}>
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <SecondaryNavItem 
                          key={item.path} 
                          item={item} 
                          onClick={() => setShowMoreMenu(false)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sign Out Button */}
              <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-sage-200)' }}>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-red-50"
                  style={{ color: 'var(--color-red-600)' }}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Navigation; 