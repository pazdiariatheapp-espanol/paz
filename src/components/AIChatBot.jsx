import React, { useState, useEffect, useRef } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Brain, Send, Volume2, VolumeX, X, Mic, MicOff, MessageSquare } from 'lucide-react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import PremiumModal from './PremiumModal'
import styles from './AIChatBot.module.css'

export default function AIChatBot() {
  const { 
    language, 
    aiChatMessages, 
    addAIChatMessage,
    clearAIChatMessages,
    subscription,
    shouldShowPremiumModal,
    incrementAIChatConversationCount,
  } = useStore()

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  
  const [inputMode, setInputMode] = useState('text')
  const [outputMode, setOutputMode] = useState('text')
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  
  const messagesEndRef = useRef(null)
  const genAI = useRef(null)
  const chatSession = useRef(null)
  const recognitionRef = useRef(null)
  const synthRef = useRef(null)

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (apiKey) {
      genAI.current = new GoogleGenerativeAI(apiKey)
      console.log('Paz AI: Connection Established')
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = language === 'es' ? 'es-ES' : 'en-US'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setTranscript('')
      }

      recognitionRef.current.onresult = (event) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            setInput(prev => prev + transcriptSegment)
          } else {
            interim += transcriptSegment
          }
        }
        setTranscript(interim)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
    }

    synthRef.current = window.speechSynthesis
  }, [language])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiChatMessages, isLoading])

  const initializeChatSession = async () => {
    if (chatSession.current) return

    const model = genAI.current.getGenerativeModel({ model: 'gemini-1.0-pro' })
    const systemPrompt = language === 'es'
      ? 'Eres Paz, una guía espiritual compasiva y empática. Responde SIEMPRE en Español. Sé breve (1-2 frases), empático y comprensivo. Enfócate en el bienestar mental y emocional.'
      : 'You are Paz, a compassionate and empathetic spiritual guide. Always respond in English. Keep it brief (1-2 sentences), empathetic and understanding. Focus on mental and emotional wellness.'

    const history = aiChatMessages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))

    chatSession.current = model.startChat({
      history: history.length > 0 ? history : [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: language === 'es' ? 'Entendido. ¿Cómo te puedo ayudar hoy?' : 'Understood. How can I help you today?' }] }
      ]
    })
  }

  const playAIVoice = (text) => {
    if (!voiceEnabled || outputMode !== 'voice' || !text) return

    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    
    const voices = synthRef.current.getVoices()
    let preferredVoice = null
    
    if (language === 'es') {
      preferredVoice = voices.find(v => v.lang.includes('es') && v.name.includes('female')) ||
                       voices.find(v => v.lang.includes('es')) ||
                       voices[0]
    } else {
      preferredVoice = voices.find(v => v.lang.includes('en') && v.name.includes('female')) ||
                       voices.find(v => v.lang.includes('en')) ||
                       voices[0]
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    
    utterance.lang = language === 'es' ? 'es-ES' : 'en-US'
    utterance.rate = 0.95
    utterance.pitch = 1.0

    synthRef.current.speak(utterance)
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.lang = language === 'es' ? 'es-ES' : 'en-US'
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const sendMessage = async () => {
    const messageText = inputMode === 'voice' && transcript ? transcript : input.trim()
    if (!messageText || isLoading || !genAI.current) return

    if (subscription === 'free' && shouldShowPremiumModal()) {
      setShowPremiumModal(true)
      return
    }

    setInput('')
    setTranscript('')
    
    const userMessage = { role: 'user', content: messageText }
    addAIChatMessage(userMessage)
    setIsLoading(true)

    try {
      await initializeChatSession()
      const result = await chatSession.current.sendMessage(messageText)
      const response = await result.response
      const responseText = response.text()

      addAIChatMessage({ role: 'assistant', content: responseText })
      
      if (aiChatMessages.filter(m => m.role === 'user').length === 0) {
        incrementAIChatConversationCount()
      }

      playAIVoice(responseText)
    } catch (error) {
      console.error('Gemini Error:', error)
      chatSession.current = null
      const fallbackMsg = language === 'es' 
        ? 'Lo siento, ¿podemos intentar de nuevo?' 
        : "I'm sorry, can we try again?"
      addAIChatMessage({ role: 'assistant', content: fallbackMsg })
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleClearConversation = () => {
    clearAIChatMessages()
    chatSession.current = null
  }

  const handleNewConversation = () => {
    if (subscription === 'free' && shouldShowPremiumModal()) {
      setShowPremiumModal(true)
      return
    }
    handleClearConversation()
  }

  return (
    <>
      {!isOpen && (
        <motion.button
          className={styles.floatingButton}
          onClick={() => setIsOpen(true)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <Brain size={28} />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.chatWindow}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <Brain size={24} className={styles.brainIcon} />
                <div>
                  <h3 className={styles.title}>Paz AI</h3>
                  <p className={styles.subtitle}>{language === 'es' ? 'Guía Compasiva' : 'Compassionate Guide'}</p>
                </div>
              </div>
              <div className={styles.headerRight}>
                <button 
                  onClick={handleNewConversation}
                  className={styles.iconButton}
                  title={language === 'en' ? 'New chat' : 'Nuevo chat'}
                >
                  <MessageSquare size={20} />
                </button>
                <button 
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={styles.iconButton}
                >
                  {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className={styles.iconButton}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className={styles.modeToggles}>
              <div className={styles.modeGroup}>
                <label>{language === 'en' ? 'Input' : 'Entrada'}:</label>
                <button
                  className={`${styles.modeBtn} ${inputMode === 'text' ? styles.active : ''}`}
                  onClick={() => setInputMode('text')}
                >
                  📝
                </button>
                <button
                  className={`${styles.modeBtn} ${inputMode === 'voice' ? styles.active : ''}`}
                  onClick={() => setInputMode('voice')}
                >
                  🎤
                </button>
              </div>
              <div className={styles.modeGroup}>
                <label>{language === 'en' ? 'Output' : 'Salida'}:</label>
                <button
                  className={`${styles.modeBtn} ${outputMode === 'text' ? styles.active : ''}`}
                  onClick={() => setOutputMode('text')}
                >
                  📝
                </button>
                <button
                  className={`${styles.modeBtn} ${outputMode === 'voice' ? styles.active : ''}`}
                  onClick={() => setOutputMode('voice')}
                >
                  🔊
                </button>
              </div>
            </div>

            <div className={styles.messages}>
              {aiChatMessages.length === 0 && (
                <motion.div
                  className={styles.welcome}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Brain size={48} className={styles.welcomeBrain} />
                  <h4>{language === 'es' ? 'Bienvenido a Paz AI' : 'Welcome to Paz AI'}</h4>
                  <p>{language === 'es' ? 'Estoy aquí para apoyarte.' : "I'm here to support you."}</p>
                </motion.div>
              )}
              {aiChatMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  className={`${styles.message} ${styles[msg.role]}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  {msg.content}
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  className={`${styles.message} ${styles.assistant}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className={styles.typing}>
                    <span></span><span></span><span></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputContainer}>
              {inputMode === 'text' ? (
                <>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={language === 'es' ? 'Habla con Paz...' : 'Talk to Paz...'}
                    className={styles.input}
                    rows={1}
                  />
                  <button
                    onClick={sendMessage}
                    className={styles.sendButton}
                    disabled={!input.trim() || isLoading}
                  >
                    <Send size={20} />
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.voiceInputContainer}>
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`${styles.voiceBtn} ${isListening ? styles.active : ''}`}
                    >
                      {isListening ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>
                    <div className={styles.voiceTranscript}>
                      {isListening ? (
                        <span className={styles.listening}>
                          {language === 'en' ? 'Listening...' : 'Escuchando...'}
                        </span>
                      ) : (
                        <span>{transcript || (language === 'en' ? 'Press to speak' : 'Presiona para hablar')}</span>
                      )}
                    </div>
                    <button
                      onClick={sendMessage}
                      className={styles.sendButton}
                      disabled={!transcript || isLoading || isListening}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumModal
        isOpen={showPremiumModal}
        onSubscribe={(planId) => {
          useStore.setState({ subscription: planId })
          setShowPremiumModal(false)
        }}
      />
    </>
  )
}