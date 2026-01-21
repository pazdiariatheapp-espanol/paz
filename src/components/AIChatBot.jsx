import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Brain, Send, Mic, Volume2, VolumeX, X, AlertCircle } from 'lucide-react';
import styles from './AIChatBot.module.css';

const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'want to die', 'better off dead', 'hurt myself', 'self harm'];

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

  useEffect(() => {
    // VITE_ prefix is mandatory for Vite apps to expose keys to the client
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      genAI.current = new GoogleGenerativeAI(apiKey);
    } else {
      console.warn("API Key missing. Ensure VITE_GEMINI_API_KEY is set in .env or Vercel.");
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = (text) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !genAI.current) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    if (CRISIS_KEYWORDS.some(k => userMessage.toLowerCase().includes(k))) {
      setShowCrisisAlert(true);
    }

    setIsLoading(true);

    // List of models to try in order of preference
    const modelOptions = ["gemini-2.0-flash", "gemini-1.5-flash"];
    let success = false;

    for (const modelName of modelOptions) {
      if (success) break;
      try {
        const model = genAI.current.getGenerativeModel({ 
          model: modelName,
          systemInstruction: "You are a compassionate mental health support AI for the Paz app. Keep responses concise (2-3 sentences). Never provide medical advice."
        });

        // Gemini history requires alternating roles: 'user' and 'model'
        const chatHistory = messages.slice(-6).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(userMessage);
        const responseText = result.response.text();

        setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
        speak(responseText);
        success = true;
      } catch (error) {
        console.error(`Failed with ${modelName}:`, error);
        // If it's the last model and it fails, show the user error
        if (modelName === modelOptions[modelOptions.length - 1]) {
          const errorMsg = "I'm having a connection issue. Please try again in a moment.";
          setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        }
      }
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
                <p className={styles.subtitle}>Companion</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className={styles.iconButton}><X size={20} /></button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>{msg.content}</div>
            ))}
            {isLoading && <div className={`${styles.message} ${styles.assistant}`}>Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputContainer}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="How are you?"
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