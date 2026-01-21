import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Brain, Send, Mic, Volume2, VolumeX, X, AlertCircle } from 'lucide-react';
import styles from './AIChatBot.module.css';

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
  'no reason to live', 'can\'t go on', 'hurt myself', 'self harm'
];

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const genAI = useRef(null);

  // Initialize Gemini
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      genAI.current = new GoogleGenerativeAI(apiKey);
    } else {
      console.error("Gemini API Key not found. Check your .env file and restart your server.");
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.onresult = (event) => {
        setInput(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const detectCrisis = (text) => {
    const lowerText = text.toLowerCase();
    return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
  };

  const speak = (text) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // MAIN FIX: Improved Send Message Logic
  const sendMessage = async () => {
    if (!input.trim() || isLoading || !genAI.current) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI immediately
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);

    if (detectCrisis(userMessage)) {
      setShowCrisisAlert(true);
    }

    setIsLoading(true);

    try {
      // Initialize model with System Instructions
      const model = genAI.current.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are a compassionate mental health support AI for the Paz app. Provide warm, empathetic, non-judgmental, and concise (2-3 sentences) support. Never provide medical diagnoses. If crisis is detected, emphasize contacting a professional immediately."
      });

      // Prepare history (excluding the message we are about to send)
      const chatHistory = messages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const responseText = result.response.text();

      // Add AI response to UI
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      speak(responseText);

    } catch (error) {
      console.error('Gemini Error:', error);
      const errorMsg = "I'm having trouble connecting. Please check your API key and internet connection.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
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
                <p className={styles.subtitle}>Your mental health companion</p>
              </div>
            </div>
            <div className={styles.headerRight}>
              <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={styles.iconButton}>
                {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button onClick={() => setIsOpen(false)} className={styles.iconButton}>
                <X size={20} />
              </button>
            </div>
          </div>

          {showCrisisAlert && (
            <div className={styles.crisisAlert}>
              <AlertCircle size={20} />
              <div className={styles.crisisContent}>
                <strong>Need immediate help?</strong>
                <p>US/Canada: 988 | UK: 116 123</p>
              </div>
              <button onClick={() => setShowCrisisAlert(false)} className={styles.closeAlert}>
                <X size={16} />
              </button>
            </div>
          )}

          <div className={styles.messages}>
            {messages.length === 0 && (
              <div className={styles.welcome}>
                <Brain size={48} className={styles.welcomeBrain} />
                <h4>Welcome to Paz AI</h4>
                <p>How are you feeling today?</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                {msg.content}
              </div>
            ))}
            
            {isLoading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.typing}><span></span><span></span><span></span></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputContainer}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Share what's on your mind..."
              className={styles.input}
              rows={1}
              disabled={isLoading}
            />
            <div className={styles.inputButtons}>
              <button onClick={startListening} className={`${styles.micButton} ${isListening ? styles.listening : ''}`} disabled={isLoading}>
                <Mic size={20} />
              </button>
              <button onClick={sendMessage} className={styles.sendButton} disabled={!input.trim() || isLoading}>
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}