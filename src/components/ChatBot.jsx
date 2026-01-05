import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import styles from './ChatBot.module.css'

// Pre-written conversation flows
const conversations = {
  en: {
    greeting: [
      "Hi there! 👋 I'm here to support you. How can I help today?",
      "Hello! 🌟 Ready to check in with yourself?",
      "Hey! 💙 What brings you here today?",
    ],
    options: [
      { id: 'mood', label: '😊 Check my mood', icon: '😊' },
      { id: 'breathe', label: '🌬️ Help me breathe', icon: '🌬️' },
      { id: 'talk', label: '💬 I need to talk', icon: '💬' },
      { id: 'gratitude', label: '✨ Gratitude practice', icon: '✨' },
    ],
    flows: {
      mood: {
        question: "How are you feeling right now? Be honest — there's no wrong answer.",
        options: [
          { id: 'great', label: '😄 Great', response: "That's wonderful! 🎉 What's contributing to your good mood today? Recognizing the good helps us appreciate it more." },
          { id: 'good', label: '🙂 Good', response: "Nice! 😊 Even \"good\" is worth celebrating. What's one small thing that went well today?" },
          { id: 'okay', label: '😐 Okay', response: "That's okay. 💙 \"Okay\" is valid. Sometimes we're just... okay. Want to talk about what's on your mind?" },
          { id: 'low', label: '😔 Low', response: "I hear you. 💙 Thank you for being honest. It takes courage to acknowledge when we're struggling. You're not alone in this. Would a breathing exercise help?" },
          { id: 'bad', label: '😢 Struggling', response: "I'm sorry you're going through a hard time. 💙 Your feelings are valid. Remember: this feeling is temporary, but you are not. I'm here with you. Would you like to try a calming exercise?" },
        ],
      },
      breathe: {
        question: "Let's take a moment together. 🌬️ Which sounds right for you?",
        options: [
          { id: 'calm', label: '🌙 I need calm', response: "Let's try this: Close your eyes. Breathe in for 4 counts... hold for 4... out for 6. I'll wait. 🌙\n\n...\n\nHow do you feel? Even one breath can shift your energy." },
          { id: 'focus', label: '☀️ I need focus', response: "Try this energizing breath: Quick inhale through nose, quick exhale through mouth. Do this 10 times. ☀️\n\n...\n\nBetter? Sometimes we just need to reset." },
          { id: 'sleep', label: '😴 I can\'t sleep', response: "The 4-7-8 technique works wonders: Inhale 4 counts, hold 7, exhale 8. Repeat 3 times. 😴\n\nThis activates your parasympathetic nervous system. Sweet dreams." },
        ],
      },
      talk: {
        question: "I'm listening. 💙 What's on your mind?",
        options: [
          { id: 'stressed', label: '😰 Feeling stressed', response: "Stress is your body's way of saying something needs attention. 💙 What's the biggest thing weighing on you right now? Sometimes just naming it helps reduce its power." },
          { id: 'anxious', label: '😟 Feeling anxious', response: "Anxiety can feel overwhelming, but remember: you've survived 100% of your anxious moments so far. 💙 Try this: name 5 things you can see right now. This grounds you in the present." },
          { id: 'sad', label: '😢 Feeling sad', response: "Sadness is a natural part of being human. 💙 It means you care deeply. Be gentle with yourself today. What's one small comfort you could give yourself right now?" },
          { id: 'lonely', label: '😔 Feeling lonely', response: "Loneliness is hard. 💙 But reaching out — even to this app — shows strength. You matter. Your presence in this world matters. Is there one person you could text today, even just to say hi?" },
          { id: 'overwhelmed', label: '🤯 Feeling overwhelmed', response: "When everything feels like too much, focus on just the next step. 💙 Not the whole staircase — just one step. What's ONE small thing you can do in the next 5 minutes?" },
        ],
      },
      gratitude: {
        question: "Gratitude shifts our focus from what's missing to what's present. ✨ Let's practice:",
        options: [
          { id: 'simple', label: '🌱 Something simple', response: "Name one simple pleasure you experienced today — maybe your morning coffee, a comfortable bed, or a moment of quiet. ☕ These small things ARE the good life." },
          { id: 'person', label: '👤 A person', response: "Think of someone who has positively impacted your life. 💙 What would you thank them for? Consider telling them — gratitude shared multiplies." },
          { id: 'challenge', label: '💪 A challenge', response: "What's a difficulty that taught you something valuable? 💪 Sometimes our hardest moments become our greatest teachers. What did you learn?" },
          { id: 'body', label: '🫀 My body', response: "Your body carries you through every day. 🫀 Thank your lungs for breathing, your heart for beating, your legs for moving. What part of your body can you appreciate today?" },
        ],
      },
    },
    followUp: [
      "Is there anything else on your mind?",
      "Would you like to explore something else?",
      "I'm still here if you need me. 💙",
    ],
    closing: [
      "Remember: you're doing better than you think. 💙",
      "Take care of yourself. You deserve peace. ✨",
      "I'm always here when you need me. 🌟",
    ],
  },
  es: {
    greeting: [
      "¡Hola! 👋 Estoy aquí para apoyarte. ¿Cómo puedo ayudarte hoy?",
      "¡Hola! 🌟 ¿Listo/a para conectar contigo mismo/a?",
      "¡Hey! 💙 ¿Qué te trae por aquí hoy?",
    ],
    options: [
      { id: 'mood', label: '😊 Revisar mi ánimo', icon: '😊' },
      { id: 'breathe', label: '🌬️ Ayúdame a respirar', icon: '🌬️' },
      { id: 'talk', label: '💬 Necesito hablar', icon: '💬' },
      { id: 'gratitude', label: '✨ Práctica de gratitud', icon: '✨' },
    ],
    flows: {
      mood: {
        question: "¿Cómo te sientes ahora mismo? Sé honesto/a — no hay respuesta incorrecta.",
        options: [
          { id: 'great', label: '😄 Genial', response: "¡Qué maravilla! 🎉 ¿Qué está contribuyendo a tu buen ánimo hoy? Reconocer lo bueno nos ayuda a apreciarlo más." },
          { id: 'good', label: '🙂 Bien', response: "¡Qué bien! 😊 Incluso \"bien\" vale la pena celebrar. ¿Qué es una pequeña cosa que salió bien hoy?" },
          { id: 'okay', label: '😐 Regular', response: "Está bien. 💙 \"Regular\" es válido. A veces simplemente estamos... regular. ¿Quieres hablar de lo que tienes en mente?" },
          { id: 'low', label: '😔 Bajo', response: "Te escucho. 💙 Gracias por ser honesto/a. Se necesita valor para reconocer cuando estamos luchando. No estás solo/a en esto. ¿Te ayudaría un ejercicio de respiración?" },
          { id: 'bad', label: '😢 Difícil', response: "Lamento que estés pasando por un momento difícil. 💙 Tus sentimientos son válidos. Recuerda: este sentimiento es temporal, pero tú no lo eres. Estoy aquí contigo. ¿Te gustaría probar un ejercicio calmante?" },
        ],
      },
      breathe: {
        question: "Tomemos un momento juntos. 🌬️ ¿Cuál te parece bien?",
        options: [
          { id: 'calm', label: '🌙 Necesito calma', response: "Probemos esto: Cierra los ojos. Inhala por 4 tiempos... sostén por 4... exhala por 6. Te espero. 🌙\n\n...\n\n¿Cómo te sientes? Incluso una respiración puede cambiar tu energía." },
          { id: 'focus', label: '☀️ Necesito enfoque', response: "Prueba esta respiración energizante: Inhala rápido por la nariz, exhala rápido por la boca. Hazlo 10 veces. ☀️\n\n...\n\n¿Mejor? A veces solo necesitamos reiniciar." },
          { id: 'sleep', label: '😴 No puedo dormir', response: "La técnica 4-7-8 hace maravillas: Inhala 4 tiempos, sostén 7, exhala 8. Repite 3 veces. 😴\n\nEsto activa tu sistema nervioso parasimpático. Dulces sueños." },
        ],
      },
      talk: {
        question: "Te escucho. 💙 ¿Qué tienes en mente?",
        options: [
          { id: 'stressed', label: '😰 Me siento estresado/a', response: "El estrés es la forma de tu cuerpo de decir que algo necesita atención. 💙 ¿Cuál es lo más grande que te pesa ahora mismo? A veces solo nombrarlo ayuda a reducir su poder." },
          { id: 'anxious', label: '😟 Me siento ansioso/a', response: "La ansiedad puede sentirse abrumadora, pero recuerda: has sobrevivido el 100% de tus momentos ansiosos hasta ahora. 💙 Intenta esto: nombra 5 cosas que puedes ver ahora mismo. Esto te ancla al presente." },
          { id: 'sad', label: '😢 Me siento triste', response: "La tristeza es una parte natural de ser humano. 💙 Significa que te importa profundamente. Sé gentil contigo hoy. ¿Cuál es un pequeño consuelo que podrías darte ahora mismo?" },
          { id: 'lonely', label: '😔 Me siento solo/a', response: "La soledad es difícil. 💙 Pero buscar ayuda — incluso en esta app — muestra fortaleza. Importas. Tu presencia en este mundo importa. ¿Hay una persona a quien podrías escribir hoy, aunque sea solo para saludar?" },
          { id: 'overwhelmed', label: '🤯 Me siento abrumado/a', response: "Cuando todo se siente como demasiado, enfócate solo en el siguiente paso. 💙 No toda la escalera — solo un paso. ¿Cuál es UNA pequeña cosa que puedes hacer en los próximos 5 minutos?" },
        ],
      },
      gratitude: {
        question: "La gratitud cambia nuestro enfoque de lo que falta a lo que está presente. ✨ Practiquemos:",
        options: [
          { id: 'simple', label: '🌱 Algo simple', response: "Nombra un placer simple que experimentaste hoy — quizás tu café de la mañana, una cama cómoda, o un momento de quietud. ☕ Estas pequeñas cosas SON la buena vida." },
          { id: 'person', label: '👤 Una persona', response: "Piensa en alguien que ha impactado positivamente tu vida. 💙 ¿Por qué le darías las gracias? Considera decírselo — la gratitud compartida se multiplica." },
          { id: 'challenge', label: '💪 Un desafío', response: "¿Cuál es una dificultad que te enseñó algo valioso? 💪 A veces nuestros momentos más difíciles se convierten en nuestros mejores maestros. ¿Qué aprendiste?" },
          { id: 'body', label: '🫀 Mi cuerpo', response: "Tu cuerpo te lleva a través de cada día. 🫀 Agradece a tus pulmones por respirar, a tu corazón por latir, a tus piernas por moverte. ¿Qué parte de tu cuerpo puedes apreciar hoy?" },
        ],
      },
    },
    followUp: [
      "¿Hay algo más en tu mente?",
      "¿Te gustaría explorar algo más?",
      "Sigo aquí si me necesitas. 💙",
    ],
    closing: [
      "Recuerda: lo estás haciendo mejor de lo que crees. 💙",
      "Cuídate. Mereces paz. ✨",
      "Siempre estoy aquí cuando me necesites. 🌟",
    ],
  },
}

function ChatBot() {
  const { language } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [currentFlow, setCurrentFlow] = useState(null)
  const [showOptions, setShowOptions] = useState(true)
  const messagesEndRef = useRef(null)
  
  const content = conversations[language] || conversations.en

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleOpen = () => {
    setIsOpen(true)
    if (messages.length === 0) {
      // Send random greeting
      const greeting = content.greeting[Math.floor(Math.random() * content.greeting.length)]
      setMessages([{ type: 'bot', text: greeting }])
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleReset = () => {
    setMessages([])
    setCurrentFlow(null)
    setShowOptions(true)
    const greeting = content.greeting[Math.floor(Math.random() * content.greeting.length)]
    setMessages([{ type: 'bot', text: greeting }])
  }

  const handleMainOption = (optionId) => {
    const option = content.options.find(o => o.id === optionId)
    const flow = content.flows[optionId]
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: option.label }])
    
    // Add bot question
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', text: flow.question }])
      setCurrentFlow(optionId)
      setShowOptions(true)
    }, 500)
  }

  const handleFlowOption = (option) => {
    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: option.label }])
    
    // Add bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', text: option.response }])
      
      // Add follow-up after a delay
      setTimeout(() => {
        const followUp = content.followUp[Math.floor(Math.random() * content.followUp.length)]
        setMessages(prev => [...prev, { type: 'bot', text: followUp }])
        setCurrentFlow(null)
        setShowOptions(true)
      }, 1500)
    }, 500)
    
    setShowOptions(false)
  }

  const handleEndChat = () => {
    const closing = content.closing[Math.floor(Math.random() * content.closing.length)]
    setMessages(prev => [...prev, { type: 'bot', text: closing }])
    setShowOptions(false)
    
    setTimeout(() => {
      setIsOpen(false)
      // Reset for next time
      setTimeout(() => {
        setMessages([])
        setCurrentFlow(null)
        setShowOptions(true)
      }, 500)
    }, 2000)
  }

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className={styles.floatingBtn}
            onClick={handleOpen}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className={styles.floatingIcon}>💬</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.chatWindow}
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <span className={styles.headerIcon}>🧘</span>
                <div>
                  <span className={styles.headerTitle}>Paz</span>
                  <span className={styles.headerStatus}>
                    {language === 'en' ? 'Here for you' : 'Aquí para ti'}
                  </span>
                </div>
              </div>
              <div className={styles.headerActions}>
                <button className={styles.headerBtn} onClick={handleReset}>↻</button>
                <button className={styles.headerBtn} onClick={handleClose}>✕</button>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`${styles.message} ${msg.type === 'user' ? styles.messageUser : styles.messageBot}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {msg.text}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Options */}
            {showOptions && (
              <div className={styles.options}>
                {!currentFlow ? (
                  // Main options
                  <>
                    {content.options.map((option) => (
                      <button
                        key={option.id}
                        className={styles.optionBtn}
                        onClick={() => handleMainOption(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                    <button
                      className={styles.endBtn}
                      onClick={handleEndChat}
                    >
                      {language === 'en' ? '👋 End chat' : '👋 Terminar chat'}
                    </button>
                  </>
                ) : (
                  // Flow-specific options
                  <>
                    {content.flows[currentFlow].options.map((option) => (
                      <button
                        key={option.id}
                        className={styles.optionBtn}
                        onClick={() => handleFlowOption(option)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatBot
