import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Brain, Send, Volume2, VolumeX, X } from 'lucide-react';
import styles from './AIChatBot.module.css';

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Detect language based on URL path
  const currentLang = window.location.pathname.includes('/es') ? 'es' : 'en';
  
  const messagesEndRef = useRef(null);
  const genAI = useRef(null);
  const chatSession = useRef(null);

  useEffect(() => {
    // Vite uses import.meta.env for environment variables
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      genAI.current = new GoogleGenerativeAI(apiKey);
      console.log('Paz AI: Connection Established');
    } else {
      console.error('Paz AI: Missing VITE_GEMINI_API_KEY');
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const playAIVoice = (text) => {
    if (!voiceEnabled || !text) return;
    
    const lowerText = text.toLowerCase();
    
    // Play sound effect based on keywords in the AI response
    if (lowerText.includes('throat')) {
      const audio = new Audio('/sounds/throat.mp3');
      audio.play().catch(err => console.log('Audio error:', err));
    } else if (lowerText.includes('success')) {
      const audio = new Audio('/sounds/success.mp3');
      audio.play().catch(err => console.log('Audio error:', err));
    }
    
    // Web Speech API for TTS
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const langCode = currentLang === 'es' ? 'es-ES' : 'en-US';
    const preferredVoice = voices.find(v => v.lang.startsWith(currentLang)) || voices[0];
    
    utterance.voice = preferredVoice;
    utterance.lang = langCode;
    utterance.rate = 0.95;

    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !genAI.current) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const model = genAI.current.getGenerativeModel({ model: "gemini-1.5-flash" });

      if (!chatSession.current) {
        const systemPrompt = currentLang === 'es' 
          ? "Eres Paz, una guía espiritual compasiva. Responde SIEMPRE en Español. Sé breve (1-2 frases) y empática."
          : "You are Paz, a compassionate spiritual guide. Always respond in English. Keep it brief (1-2 sentences) and empathetic.";

        chatSession.current = model.startChat({
          history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: currentLang === 'es' ? "Entendido. ¿Cómo te puedo ayudar hoy?" : "Understood. How can I help you today?" }] }
          ],
        });
      }

      const result = await chatSession.current.sendMessage(userMessage);    
      const response = await result.response;
      const responseText = response.text();
      
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      playAIVoice(responseText);
      
    } catch (error) {
      console.error("Gemini Error:", error);
      chatSession.current = null; 
      const fallbackMsg = currentLang === 'es' ? "Lo siento, ¿podemos intentar de nuevo?" : "I'm sorry, can we try again?";
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackMsg }]);
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
                <p className={styles.subtitle}>{currentLang === 'es' ? 'Guía Compasiva' : 'Compassionate Guide'}</p>
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
            {messages.length === 0 && (
              <div className={styles.welcome}>
                <Brain size={48} className={styles.welcomeBrain} />
                <h4>{currentLang === 'es' ? 'Bienvenido a Paz AI' : 'Welcome to Paz AI'}</h4>
                <p>{currentLang === 'es' ? 'Estoy aquí para apoyarte.' : "I'm here to support you."}</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>{msg.content}</div>
            ))}
            {isLoading && <div className={`${styles.message} ${styles.assistant}`}><div className={styles.typing}><span></span><span></span><span></span></div></div>}
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