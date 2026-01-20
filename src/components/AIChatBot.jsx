import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Brain, Send, Mic, Volume2, VolumeX, X, AlertCircle } from 'lucide-react';
import styles from './AIChatBot.module.css';

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
  'no reason to live', 'can\'t go on', 'hurt myself', 'self harm'
];

const CRISIS_RESOURCES = {
  US: { name: 'US Suicide & Crisis Lifeline', number: '988', link: 'https://988lifeline.org' },
  UK: { name: 'Samaritans', number: '116 123', link: 'https://www.samaritans.org' },
  AU: { name: 'Lifeline Australia', number: '13 11 14', link: 'https://www.lifeline.org.au' },
  CA: { name: 'Canada Suicide Prevention', number: '988', link: 'https://988.ca' },
  GLOBAL: { name: 'International Association for Suicide Prevention', link: 'https://www.iasp.info/resources/Crisis_Centres/' }
};

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
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Check for crisis keywords
  const detectCrisis = (text) => {
    const lowerText = text.toLowerCase();
    return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
  };

  // Text-to-speech with natural voice
  const speak = (text) => {
    if (!voiceEnabled) return;
    
    window.speechSynthesis.cancel();
    
    const setVoice = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a natural English voice
      const preferredVoice = voices.find(voice => {
        return voice.name.includes('Samantha') || 
               voice.name.includes('Google US English') ||
               voice.name.includes('Microsoft Zira') ||
               voice.name.includes('Karen') ||
               (voice.lang.includes('en') && voice.name.includes('Female'));
      }) || voices.find(voice => voice.lang.includes('en-US'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    };
    
    // Ensure voices are loaded
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }
  };

  // Start voice input
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Stop speech
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Send message to Gemini
  const sendMessage = async () => {
    if (!input.trim() || isLoading || !genAI.current) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    // Check for crisis
    if (detectCrisis(userMessage)) {
      setShowCrisisAlert(true);
    }

    setIsLoading(true);

    try {
      const model = genAI.current.getGenerativeModel({ model: 'gemini-pro' });
      
      const systemPrompt = `You are a compassionate mental health support AI for the Paz app. Your role is to:
- Provide emotional support and active listening
- Offer coping strategies and mindfulness techniques
- Encourage positive thinking and self-care
- Be warm, empathetic, and non-judgmental
- Keep responses concise (2-3 sentences) and supportive
- Never provide medical diagnosis or replace professional therapy
- If someone mentions crisis or self-harm, acknowledge their pain and encourage professional help

IMPORTANT: If you detect any mention of suicide, self-harm, or crisis, respond with compassion but always emphasize the importance of contacting a crisis hotline or mental health professional immediately.`;

      const chat = model.startChat({
        history: newMessages.slice(-10).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(systemPrompt + '\n\nUser: ' + userMessage);
      const response = result.response.text();

      // Add AI response
      setMessages([...newMessages, { role: 'assistant', content: response }]);
      
      // Speak response
      speak(response);

    } catch (error) {
      console.error('Error:', error);
      const errorMsg = "I'm having trouble connecting right now. Please try again in a moment.";
      setMessages([...newMessages, { role: 'assistant', content: errorMsg }]);
      speak(errorMsg);
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
      {/* Floating Button */}
      {!isOpen && (
        <button 
          className={styles.floatingButton}
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Chat"
        >
          <Brain size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <Brain size={24} className={styles.brainIcon} />
              <div>
                <h3 className={styles.title}>Paz AI</h3>
                <p className={styles.subtitle}>Your mental health companion</p>
              </div>
            </div>
            <div className={styles.headerRight}>
              <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={styles.iconButton}
                aria-label={voiceEnabled ? 'Disable voice' : 'Enable voice'}
              >
                {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className={styles.iconButton}
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Crisis Alert */}
          {showCrisisAlert && (
            <div className={styles.crisisAlert}>
              <AlertCircle size={20} />
              <div className={styles.crisisContent}>
                <strong>Need immediate help?</strong>
                <p>US/Canada: Call/Text 988</p>
                <p>UK: 116 123 | Australia: 13 11 14</p>
                <a 
                  href="https://www.google.com/search?q=psychiatrists+near+me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.crisisLink}
                >
                  Find local psychiatrists →
                </a>
              </div>
              <button 
                onClick={() => setShowCrisisAlert(false)}
                className={styles.closeAlert}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Messages */}
          <div className={styles.messages}>
            {messages.length === 0 && (
              <div className={styles.welcome}>
                <Brain size={48} className={styles.welcomeBrain} />
                <h4>Welcome to Paz AI</h4>
                <p>I'm here to support your mental wellness journey. How are you feeling today?</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`${styles.message} ${styles[msg.role]}`}
              >
                {msg.content}
              </div>
            ))}
            
            {isLoading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.typing}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputContainer}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className={styles.input}
              rows={1}
              disabled={isLoading}
            />
            <div className={styles.inputButtons}>
              <button
                onClick={startListening}
                className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
                disabled={isLoading || isListening}
                aria-label="Voice input"
              >
                <Mic size={20} />
              </button>
              <button
                onClick={sendMessage}
                className={styles.sendButton}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <p>AI responses are supportive, not medical advice</p>
          </div>
        </div>
      )}
    </>
  );
}