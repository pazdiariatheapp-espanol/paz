import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Brain, Send, Volume2, VolumeX, X } from 'lucide-react';
import styles from './AIChatBot.module.css';

const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'want to die', 'better off dead', 'hurt myself', 'self harm'];

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const messagesEndRef = useRef(null);
  const genAI = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      genAI.current = new GoogleGenerativeAI(apiKey);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const playAIVoice = (text) => {
    if (!voiceEnabled || !text) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Samantha') || 
      voice.name.includes('Google US English') ||
      (voice.lang.includes('en') && voice.name.includes('Female'))
    ) || voices.find(voice => voice.lang.includes('en-US'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !genAI.current) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // FIXED: Simplified to work with standard Gemini API
      const model = genAI.current.getGenerativeModel({ 
        model: "gemini-1.5-flash"
      });

      const chat = model.startChat({
        history: messages.slice(-6).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }))
      });

      const result = await chat.sendMessage("You are Paz, a compassionate mental health guide. Speak with a warm, empathetic tone. Keep responses to 1-2 short sentences. Always be supportive.\n\nUser: " + userMessage);
      const responseText = result.response.text();
      
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      playAIVoice(responseText);
      
    } catch (error) {
      console.error("Gemini Error:", error);
      const fallbackMsg = "I'm here, but I'm having a little trouble with my connection. How can I support you right now?";
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackMsg }]);
      playAIVoice(fallbackMsg);
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button className={styles.floatingButton} onClick={() => setIsOpen(true)}>
          <Brain size={28} />
        </button>
      )}

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <Brain size={24} className={styles.brainIcon} />
              <div>
                <h3 className={styles.title}>Paz AI</h3>
                <p className={styles.subtitle}>Compassionate Guide</p>
              </div>
            </div>
            <div className={styles.headerRight}>
               <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)} 
                className={styles.iconButton}
              >
                {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button onClick={() => setIsOpen(false)} className={styles.iconButton}><X size={20} /></button>
            </div>
          </div>

          <div className={styles.messages}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>{msg.content}</div>
            ))}
            {isLoading && <div className={`${styles.message} ${styles.assistant}`}>Connecting...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputContainer}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Talk to Paz..."
              className={styles.input}
              rows={1}
            />
            <button onClick={sendMessage} className={styles.sendButton} disabled={!input.trim() || isLoading}>
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}