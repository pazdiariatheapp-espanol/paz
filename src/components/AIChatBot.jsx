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
  
  const currentLang = window.location.pathname.includes('/es') ? 'es' : 'en';
  const messagesEndRef = useRef(null);
  
  // These are your "Boxes" (Refs)
  const genAI = useRef(null);
  const chatSession = useRef(null);

  useEffect(() => {
    // Vite requires VITE_ prefix to expose variables to the client
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (apiKey) {
      // We fill the "box" with the connection
      genAI.current = new GoogleGenerativeAI(apiKey);
      console.log('✅ Paz AI: Key loaded. Handshake ready.');
    } else {
      console.error('❌ Paz AI: VITE_GEMINI_API_KEY is missing! Check Vercel settings.');
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const playAIVoice = (text) => {
    if (!voiceEnabled || !text) return;
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('throat')) {
      new Audio('/sounds/throat.mp3').play().catch(e => console.log(e));
    } else if (lowerText.includes('success')) {
      new Audio('/sounds/success.mp3').play().catch(e => console.log(e));
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.lang.startsWith(currentLang)) || voices[0];
    utterance.lang = currentLang === 'es' ? 'es-ES' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    // Check if the "box" (genAI.current) is empty
    if (!input.trim() || isLoading || !genAI.current) {
      if (!genAI.current) console.error("Cannot send: genAI is not initialized.");
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // ✅ FIX: Use .current and the stable 2026 model name
      const model = genAI.current.getGenerativeModel({ 
        model: "gemini-1.5-flash" 
      });

      if (!chatSession.current) {
        const systemPrompt = currentLang === 'es' 
          ? "Eres Paz, una guía espiritual compasiva. Responde SIEMPRE en Español. Sé breve y empática."
          : "You are Paz, a compassionate spiritual guide. Always respond in English. Keep it brief and empathetic.";

        chatSession.current = model.startChat({
          history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: currentLang === 'es' ? "Entendido." : "Understood." }] }
          ]
        });
      }

      // ✅ FIX: Use chatSession.current
      const result = await chatSession.current.sendMessage(userMessage);    
      const responseText = result.response.text();
      
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      playAIVoice(responseText);
      
    } catch (error) {
      console.error("Gemini Error:", error);
      chatSession.current = null; // Reset on error
      const fallback = currentLang === 'es' ? "Lo siento, ¿podemos intentar de nuevo?" : "I'm sorry, can we try again?";
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
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
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>{msg.content}</div>
            ))}
            {isLoading && <div className={styles.typing}><span></span><span></span><span></span></div>}
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