import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  BookOpen, 
  Clock, 
  Star,
  Plus,
  Brain,
  Send
} from 'lucide-react';
import useStore from '../store/useStore';
import { GeminiService } from '../lib/gemini';
import toast from 'react-hot-toast';

const PeerMatch = () => {
  const { user, peerMatches, addPeerMatch, updateUser } = useStore();
  const [subjects, setSubjects] = useState(user?.subjects || []);
  const [strengths, setStrengths] = useState(user?.strengths || []);
  const [newSubject, setNewSubject] = useState('');
  const [newStrength, setNewStrength] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [message, setMessage] = useState('');
  const [icebreaker, setIcebreaker] = useState('');
  const [availablePeers, setAvailablePeers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subjects.length > 0 && strengths.length > 0) {
      generateIcebreaker();
      findAvailablePeers();
    }
  }, [subjects, strengths]);

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      const updatedSubjects = [...subjects, newSubject.trim()];
      setSubjects(updatedSubjects);
      setNewSubject('');
      updateUser({ subjects: updatedSubjects });
    }
  };

  const addStrength = () => {
    if (newStrength.trim() && !strengths.includes(newStrength.trim())) {
      const updatedStrengths = [...strengths, newStrength.trim()];
      setStrengths(updatedStrengths);
      setNewStrength('');
      updateUser({ strengths: updatedStrengths });
    }
  };

  const removeSubject = (subject) => {
    const updatedSubjects = subjects.filter(s => s !== subject);
    setSubjects(updatedSubjects);
    updateUser({ subjects: updatedSubjects });
  };

  const removeStrength = (strength) => {
    const updatedStrengths = strengths.filter(s => s !== strength);
    setStrengths(updatedStrengths);
    updateUser({ strengths: updatedStrengths });
  };

  const generateIcebreaker = async () => {
    if (subjects.length === 0 || strengths.length === 0) return;
    
    try {
      const icebreakerText = await GeminiService.generateIcebreaker(
        subjects.join(', '),
        strengths
      );
      setIcebreaker(icebreakerText);
    } catch (error) {
      console.error('Error generating icebreaker:', error);
      setIcebreaker("Hey! I'm also studying similar subjects. Want to study together?");
    }
  };

  const findAvailablePeers = async () => {
    if (!user || subjects.length === 0) return;
    
    setLoading(true);
    try {
      // In a real app, this would query the database for users with similar subjects
      // For now, we'll show a message that no peers are available
      setAvailablePeers([]);
    } catch (error) {
      console.error('Error finding peers:', error);
      toast.error('Failed to find study partners');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !selectedMatch) return;
    
    // In a real app, this would send a message to the selected peer
    toast.success('Message sent!');
    setMessage('');
  };

  const requestStudySession = (peer) => {
    // In a real app, this would create a study session request
    toast.success(`Study session requested with ${peer.name}`);
  };

  return (
    <div className="container-mobile space-mobile">
      <div className="section-header">Find Study Partners</div>
      
      {/* Profile Setup */}
      <div className="card-mobile">
        <div className="card-header-mobile">
          <Users className="card-icon-mobile" />
          <h3 className="card-title-mobile">Your Profile</h3>
        </div>
        
        <div className="space-mobile">
          {/* Subjects */}
          <div>
            <label className="label-mobile">Subjects</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Add a subject..."
                className="input-field-mobile flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addSubject()}
              />
              <button
                onClick={addSubject}
                className="btn-primary-mobile"
                disabled={!newSubject.trim()}
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject, index) => (
                <span
                  key={index}
                  className="tag-mobile"
                  onClick={() => removeSubject(subject)}
                >
                  {subject} ×
                </span>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div>
            <label className="label-mobile">Strengths</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                placeholder="Add a strength..."
                className="input-field-mobile flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addStrength()}
              />
              <button
                onClick={addStrength}
                className="btn-primary-mobile"
                disabled={!newStrength.trim()}
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {strengths.map((strength, index) => (
                <span
                  key={index}
                  className="tag-mobile"
                  onClick={() => removeStrength(strength)}
                >
                  {strength} ×
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Available Peers */}
      <div className="card-mobile">
        <div className="card-header-mobile">
          <Users className="card-icon-mobile" />
          <h3 className="card-title-mobile">Available Study Partners</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Finding study partners...</p>
          </div>
        ) : availablePeers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No study partners available yet</p>
            <p className="text-sm text-gray-500">
              Add your subjects and strengths to find compatible study partners
            </p>
          </div>
        ) : (
          <div className="space-mobile">
            {availablePeers.map((peer) => (
              <div key={peer.id} className="peer-card-mobile">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">{peer.avatar}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{peer.name}</h4>
                      <p className="text-sm text-gray-600">{peer.subjects.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => requestStudySession(peer)}
                      className="btn-secondary-mobile"
                    >
                      <BookOpen size={16} />
                    </button>
                    <button
                      onClick={() => setSelectedMatch(peer)}
                      className="btn-primary-mobile"
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">{selectedMatch.avatar}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{selectedMatch.name}</h3>
                  <p className="text-sm text-gray-600">Study Partner</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="bg-primary-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-primary-800">{icebreaker}</p>
              </div>
            </div>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="input-field-mobile flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="btn-primary-mobile"
                  disabled={!message.trim()}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerMatch; 