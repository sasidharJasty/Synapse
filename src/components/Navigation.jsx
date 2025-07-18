import React, { useState, useRef, useEffect } from 'react';
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
  X,
  ChevronLeft,
  ChevronRight,
  Star
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { toast } from 'react-toastify';

const Navigation = () => {
  const location = useLocation();
  const { user, mood, signOut, addMoodEntry } = useStore();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  // Add state for sidebar collapse and favorites
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    // Load from localStorage or default to empty
    try {
      return JSON.parse(localStorage.getItem('nav-favorites')) || [];
    } catch {
      return [];
    }
  });

  // Add state for mini progress (simulate for now)
  const todayTasks = [/* get from store or props */];
  const completedTasks = todayTasks.filter(t => t.completed).length;
  const progress = todayTasks.length ? completedTasks / todayTasks.length : 0;

  // Add quick mood log
  const [loggingMood, setLoggingMood] = useState(false);
  const quickMoods = [
    { score: 10, emoji: '😄' },
    { score: 7, emoji: '🙂' },
    { score: 5, emoji: '��' },
    { score: 3, emoji: '😔' },
    { score: 1, emoji: '😢' },
  ];
  const handleQuickMood = async (score) => {
    if (!user) {
      toast.error('Please sign in to track mood');
      setLoggingMood(false);
      return;
    }
    await addMoodEntry({ mood_score: score, notes: 'Quick log', mood_label: undefined });
    setLoggingMood(false);
  };

  // Add to favorites
  const toggleFavorite = (path) => {
    let newFavs;
    if (favorites.includes(path)) {
      newFavs = favorites.filter(f => f !== path);
    } else {
      newFavs = [...favorites, path];
    }
    setFavorites(newFavs);
    localStorage.setItem('nav-favorites', JSON.stringify(newFavs));
  };

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

  // Add state for profile dropdown
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

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

      {/* Desktop Sidebar (glassy, collapsible) */}
      <div className={`hidden lg:block ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} lg:min-h-screen`}>
        <div className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 bg-white/70 backdrop-blur-xl shadow-xl border-r border-sage-100 ${sidebarCollapsed ? 'w-20' : 'w-64'} rounded-tr-3xl rounded-br-3xl`}>
          {/* Collapse Toggle */}
          <button onClick={() => setSidebarCollapsed(v => !v)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-sage-100">
            {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
          {/* Header */}
          <div className={`p-6 border-b border-sage-100 flex items-center gap-3 mb-4 ${sidebarCollapsed ? 'justify-center' : ''}`}> 
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-synapse-500">
              <Brain className="w-7 h-7 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-sage-800">Synapse</h1>
                <p className="text-sm text-sage-600">AI Study Assistant</p>
              </div>
            )}
          </div>
          {/* User Info + Quick Mood Log */}
          {/* In the sidebar, replace the user info section with a more visible profile card */}
          {!sidebarCollapsed && user && (
            <div className="relative">
              <button
                className="flex items-center gap-3 p-3 mb-3 bg-white/80 rounded-xl shadow border border-sage-100 w-full hover:bg-synapse-50 transition"
                onClick={() => setProfileMenuOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={profileMenuOpen}
              >
                <div className="w-10 h-10 rounded-full bg-synapse-100 flex items-center justify-center text-xl font-bold">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{user.name ? user.name[0] : 'S'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-semibold text-sage-800 truncate">{user.name || 'Student'}</div>
                  <div className="text-xs text-sage-500 truncate">{user.email}</div>
                </div>
                <svg className={`w-4 h-4 ml-1 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {profileMenuOpen && (
                <div ref={profileMenuRef} className="absolute left-0 top-full mt-2 w-48 bg-white border border-sage-100 rounded-xl shadow-lg z-50 py-2 animate-fade-in">
                  <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all group hover:bg-synapse-50 text-sage-700">
                    <Settings className="w-5 h-5 text-synapse-600" />
                    <span className="font-medium">Settings</span>
                  </a>
                  <div className="my-1 border-t border-sage-100" />
                  <button onClick={signOut} className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all group hover:bg-red-50 text-red-600">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Mini Progress Bar */}
          {!sidebarCollapsed && (
            <div className="px-6 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-sage-600">Today's Progress</span>
                <span className="text-xs text-sage-800 font-bold">{Math.round(progress * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-sage-100 rounded-full overflow-hidden">
                <div className="h-2 bg-synapse-500 rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
          )}
          {/* Favorites Section */}
          {!sidebarCollapsed && favorites.length > 0 && (
            <div className="px-4 mb-2">
              <h4 className="text-xs font-semibold text-sage-700 mb-2">Favorites</h4>
              <div className="space-y-1">
                {secondaryNavItems.filter(i => favorites.includes(i.path)).map(item => (
                  <Link key={item.path} to={item.path} className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-synapse-50 transition-all">
                    <item.icon className="w-5 h-5 text-synapse-500" />
                    <span className="font-medium">{item.label}</span>
                    <button onClick={e => { e.preventDefault(); toggleFavorite(item.path); }} className="ml-auto p-1 rounded hover:bg-sage-100" title="Remove from favorites">
                      <X className="w-4 h-4 text-sage-400" />
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {/* Navigation Links (primary/secondary) */}
          <nav className="p-4 space-y-2">
            {primaryNavItems.map((item) => (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl relative group transition-all ${isActive(item.path) ? 'bg-synapse-100/60' : 'hover:bg-sage-50'}`}
                style={{ color: isActive(item.path) ? 'var(--color-synapse-700)' : 'var(--color-sage-700)' }}>
                <item.icon className="w-5 h-5" style={{ color: isActive(item.path) ? 'var(--color-synapse-600)' : 'var(--color-sage-500)' }} />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                {isActive(item.path) && (
                  <motion.div layoutId="activeNav" className="absolute inset-0 rounded-xl bg-synapse-100/60 -z-10" transition={{ type: 'spring', duration: 0.5 }} />
                )}
              </Link>
            ))}
          </nav>
          <div className="my-4 border-t border-sage-100" />
          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl relative group transition-all ${isActive(item.path) ? 'bg-synapse-100/60' : 'hover:bg-sage-50'}`}
                style={{ color: isActive(item.path) ? 'var(--color-synapse-700)' : 'var(--color-sage-700)' }}>
                <item.icon className="w-5 h-5" style={{ color: isActive(item.path) ? 'var(--color-synapse-600)' : 'var(--color-sage-500)' }} />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                <button onClick={e => { e.preventDefault(); toggleFavorite(item.path); }} className="ml-auto p-1 rounded hover:bg-sage-100" title={favorites.includes(item.path) ? 'Remove from favorites' : 'Add to favorites'}>
                  {favorites.includes(item.path) ? <X className="w-4 h-4 text-sage-400" /> : <Star className="w-4 h-4 text-synapse-400" />}
                </button>
                {isActive(item.path) && (
                  <motion.div layoutId="activeNav" className="absolute inset-0 rounded-xl bg-synapse-100/60 -z-10" transition={{ type: 'spring', duration: 0.5 }} />
                )}
              </Link>
            ))}
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
      {/* In mobile nav, add a profile avatar button (bottom right corner, floating) */}
      {user && (
        <button
          className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-synapse-100 flex items-center justify-center shadow-lg border border-synapse-200"
          onClick={() => window.location.href = '/settings'}
          title="Profile & Settings"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-synapse-600">{user.name ? user.name[0] : 'S'}</span>
          )}
        </button>
      )}
    </>
  );
};

export default Navigation; 