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
  const chatRef = useRef(null);  // Store the chat instance

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      genAI.current = new GoogleGenerativeAI(apiKey);
      console.log('Paz AI: Key loaded successfully');
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
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Initialize chat only once with system instruction
      if (!chatRef.current) {
        const model = genAI.current.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: "You are Paz, a compassionate mental health companion. Speak warmly and empathetically. Keep responses brief (1-2 sentences). Be supportive and encouraging. Remember the conversation context."
        });
        
        chatRef.current = model.startChat({
          history: [],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.8,
          }
        });
      }

      // Send message with full context
      const result = await chatRef.current.sendMessage(userMessage);
      const responseText = result.response.text();
      
      setMessages([...newMessages, { role: 'assistant', content: responseText }]);
      playAIVoice(responseText);
      
    } catch (error) {
      console.error("Gemini Error:", error);
      
      // Reset chat on error and try again
      chatRef.current = null;
      
      const fallbackMsg = "I'm here for you. Let's try that again - what's on your mind?";
      setMessages([...newMessages, { role: 'assistant', content: fallbackMsg }]);
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
            {messages.length === 0 && (
              <div className={styles.welcome}>
                <Brain size={48} className={styles.welcomeBrain} />
                <h4>Welcome to Paz AI</h4>
                <p>I'm here to support your mental wellness. How are you feeling?</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>{msg.content}</div>
            ))}
            {isLoading && <div className={`${styles.message} ${styles.assistant}`}>
              <div className={styles.typing}>
                <span></span><span></span><span></span>
              </div>
            </div>}
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