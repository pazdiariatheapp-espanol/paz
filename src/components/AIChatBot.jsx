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
  
  const currentLang = localStorage.getItem('paz_language') || 'en';

  const messagesEndRef = useRef(null);
  const genAI = useRef(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log("Paz AI: Checking connection...", apiKey ? "Key Loaded" : "Key Missing");
    
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
    
    const preferredVoice = voices.find(voice => {
      if (currentLang === 'es') {
        return voice.lang.includes('es') && (voice.name.includes('Monica') || voice.name.includes('Google'));
      } else {
        return voice.name.includes('Samantha') || voice.name.includes('Google US English') || (voice.lang.includes('en') && voice.name.includes('Female'));
      }
    }) || voices.find(voice => voice.lang.includes(currentLang));
    
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !genAI.current) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // STABLE MODEL CALL (No "models/" prefix)
      const model = genAI.current.getGenerativeModel({ 
        model: "gemini-1.5-flash"
      });

      const result = await model.generateContent(
        `You are Paz, a compassionate spiritual guide. 
         The user's preferred language is ${currentLang === 'es' ? 'Spanish' : 'English'}.
         Please respond ONLY in ${currentLang === 'es' ? 'Spanish' : 'English'}.
         Keep your response to 1 or 2 warm, helpful sentences.
         User says: ${userMessage}`
      );
     
      // SAFETY: Await the response extraction
      const response = await result.response;
      const responseText = response.text();
      
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      playAIVoice(responseText);
      
    } catch (error) {
      console.error("Gemini Error:", error);
      const fallbackMsg = currentLang === 'es' 
        ? "Estoy aquí, pero tengo un pequeño problema con mi conexión. ¿Cómo puedo apoyarte en este momento?"
        : "I'm here, but I'm having a little trouble with my connection. How can I support you right now?";
      
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
                <p className={styles.subtitle}>
                  {currentLang === 'es' ? 'Guía Compasivo' : 'Compassionate Guide'}
                </p>
              </div>
            </div>
            <div className={styles.headerRight}>
               <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={styles.iconButton}>
                {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button onClick={() => setIsOpen(false)} className={styles.iconButton}><X size={20} /></button>
            </div>
          </div>

          <div className={styles.messages}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>{msg.content}</div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                {currentLang === 'es' ? 'Conectando...' : 'Connecting...'}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputContainer}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={currentLang === 'es' ? 'Habla con Paz...' : 'Talk to Paz...'}
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