import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { emitSocketEvent, onSocketEvent, offSocketEvent } from '../services/socket';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

function getRoomId(id1, id2) {
  return [id1, id2].sort().join('_');
}

export default function ChatPage() {
  const { user } = useAuth();
  const [contacts,  setContacts]  = useState([]);
  const [active,    setActive]    = useState(null);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [typing,    setTyping]    = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // Load contacts
  useEffect(() => {
    api.get('/messages/contacts')
      .then(r => { if (r.data.success) setContacts(r.data.data); })
      .catch(() => toast.error('Failed to load contacts'));
  }, []);

  // Load messages when contact selected
  useEffect(() => {
    if (!active) return;
    const room = getRoomId(user._id, active._id);
    setLoading(true);
    api.get(`/messages/${room}`)
      .then(r => { if (r.data.success) setMessages(r.data.data); })
      .finally(() => setLoading(false));

    // Join socket room
    emitSocketEvent('join_room', room);

    const onMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };
    const onTyping = ({ userId }) => {
      if (userId !== user._id) {
        setTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTyping(false), 2000);
      }
    };

    onSocketEvent('receive_message', onMessage);
    onSocketEvent('typing', onTyping);

    return () => {
      offSocketEvent('receive_message', onMessage);
      offSocketEvent('typing', onTyping);
    };
  }, [active]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = () => {
    if (!input.trim() || !active) return;
    const room = getRoomId(user._id, active._id);
    const msg = {
      room,
      content: input.trim(),
      sender: { _id: user._id, name: user.name },
      createdAt: new Date().toISOString(),
    };
    emitSocketEvent('send_message', msg);
    setMessages(prev => [...prev, msg]);
    setInput('');
    // Persist to DB
    api.post('/messages', { room, content: msg.content }).catch(() => {});
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (active) {
      emitSocketEvent('typing', { room: getRoomId(user._id, active._id), userId: user._id });
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="min-h-screen pt-16 bg-[#0A0F1E] flex">
      {/* Contacts sidebar */}
      <div className="w-72 border-r border-blue-500/10 flex flex-col flex-shrink-0 h-screen sticky top-0">
        <div className="p-5 border-b border-blue-500/10">
          <h2 className="text-lg font-black text-white font-head flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-400" /> Messages
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {user?.role === 'fresher' ? 'Chat with startups' : 'Chat with candidates'}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {contacts.length === 0 && (
            <p className="text-slate-600 text-xs text-center py-10">No contacts yet.</p>
          )}
          {contacts.map(c => (
            <button
              key={c._id}
              onClick={() => setActive(c)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/4 transition-colors text-left ${active?._id === c._id ? 'bg-blue-500/8 border-r-2 border-blue-400' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                {(c.name || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{c.name}</div>
                <div className="text-xs text-slate-500 truncate">{c.companyName || c.college || c.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col h-screen sticky top-0">
        {!active ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <MessageSquare size={64} className="text-slate-700 mb-4" />
            <h3 className="text-xl font-black text-slate-500 font-head">Select a conversation</h3>
            <p className="text-slate-600 text-sm mt-2">Choose a contact from the left to start chatting.</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-blue-500/10 bg-[#0A0F1E]/80 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-sm">
                {active.name[0].toUpperCase()}
              </div>
              <div>
                <div className="font-black text-white">{active.name}</div>
                <div className="text-xs text-slate-500">{active.companyName || active.college || active.role}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading && <div className="flex justify-center"><Loader2 className="text-blue-400 animate-spin" size={24} /></div>}
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => {
                  const isMe = (msg.sender?._id || msg.sender) === user._id;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs md:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm'
                          : 'glass-card text-slate-200 rounded-bl-sm'
                      }`}>
                        {msg.content}
                        <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-200/60' : 'text-slate-600'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {typing && (
                <div className="flex justify-start">
                  <div className="glass-card px-4 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-blue-500/10 bg-[#0A0F1E]/80 backdrop-blur-xl">
              <div className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={handleTyping}
                  onKeyDown={handleKey}
                  placeholder={`Message ${active.name}...`}
                  rows={1}
                  className="cp-input flex-1 resize-none max-h-28 overflow-auto"
                  style={{ minHeight: '44px' }}
                />
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="btn-primary px-4 py-3 disabled:opacity-40 flex-shrink-0"
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
