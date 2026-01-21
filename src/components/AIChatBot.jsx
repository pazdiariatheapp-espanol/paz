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
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  
  const messagesEndRef = useRef(null);
  const genAI = useRef(null);
  const audioRef = useRef(null); // Ref to manage the current AI voice playing

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      genAI.current = new GoogleGenerativeAI(apiKey);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // NEW: Play high-quality Native AI Audio
  const playAIVoice = (base64Audio) => {
    if (!voiceEnabled || !base64Audio) return;
    
    // Stop any current speaking
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audioUrl = `data:audio/wav;base64,${base64Audio}`;
    audioRef.current = new Audio(audioUrl);
    audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
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

    // TRY TTS MODEL FIRST for human voice, fallback to standard if needed
    const modelOptions = ["gemini-2.0-flash-tts", "gemini-2.0-flash"]; 
    let success = false;

    for (const modelName of modelOptions) {
      if (success) break;
      try {
        const model = genAI.current.getGenerativeModel({ 
          model: modelName,
          systemInstruction: "You are a compassionate mental health guide. Speak with a warm, empathetic, and human-like tone. Keep responses concise (2 sentences)."
        });

        // Config for Native Audio Output
        const generationConfig = {
          responseModalities: ["audio"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Vindemiatrix" } } // Calm healing voice
          }
        };

        const chat = model.startChat({
          history: messages.slice(-6).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          }))
        });

        // Generate content with Audio config
        const result = await chat.sendMessage(userMessage, generationConfig);
        
        // Extract Text and Audio
        const responseText = result.response.text();
        const audioPart = result.response.candidates[0].content.parts.find(p => p.inlineData);
        
        setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
        
        if (audioPart) {
          playAIVoice(audioPart.inlineData.data);
        }
        
        success = true;
      } catch (error) {
        console.error(`Failed with ${modelName}:`, error);
        if (modelName === modelOptions[modelOptions.length - 1]) {
          setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a connection issue. Please try again." }]);
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