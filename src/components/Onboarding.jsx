import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Onboarding.module.css'

const slides = {
  en: [
    {
      icon: '/brain-logo.png',
      isImage: true,
      title: 'Welcome to Paz',
      subtitle: 'Your daily peace starts here',
      description: 'A simple app to help you manage stress, track your mood, and find moments of calm.',
    },
    {
      icon: '/mood-icon.png',
      isImage: true,
      title: 'Track Your Mood',
      subtitle: '5 seconds a day',
      description: 'Quick daily check-ins help you understand your emotional patterns over time.',
    },
    {
      icon: '/breathing-icon.png',
      isImage: true,
      title: 'Breathe & Relax',
      subtitle: 'Guided breathing exercises',
      description: 'Choose from calming, energizing, or sleep-focused breathing techniques.',
    },
    {
      icon: '/journal-icon.png',
      isImage: true,
      title: 'Gratitude Journal',
      subtitle: 'Shift your perspective',
      description: 'Write freely and capture 3 things you\'re grateful for each day.',
    },
    {
      icon: '✨',
      isImage: false,
      title: 'You\'re Ready!',
      subtitle: 'Let\'s begin your journey',
      description: 'Start with a quick mood check-in or explore at your own pace.',
    },
  ],
  es: [
    {
      icon: '/brain-logo.png',
      isImage: true,
      title: 'Bienvenido a Paz',
      subtitle: 'Tu paz diaria comienza aquí',
      description: 'Una app simple para ayudarte a manejar el estrés, registrar tu ánimo y encontrar momentos de calma.',
    },
    {
      icon: '/mood-icon.png',
      isImage: true,
      title: 'Registra Tu Ánimo',
      subtitle: '5 segundos al día',
      description: 'Check-ins diarios rápidos te ayudan a entender tus patrones emocionales con el tiempo.',
    },
    {
      icon: '/breathing-icon.png',
      isImage: true,
      title: 'Respira y Relájate',
      subtitle: 'Ejercicios de respiración guiados',
      description: 'Elige entre técnicas de respiración calmantes, energizantes o para dormir.',
    },
    {
      icon: '/journal-icon.png',
      isImage: true,
      title: 'Diario de Gratitud',
      subtitle: 'Cambia tu perspectiva',
      description: 'Escribe libremente y captura 3 cosas por las que estás agradecido/a cada día.',
    },
    {
      icon: '✨',
      isImage: false,
      title: '¡Estás Listo/a!',
      subtitle: 'Comencemos tu viaje',
      description: 'Empieza con un registro rápido de ánimo o explora a tu propio ritmo.',
    },
  ],
}

function Onboarding({ language, onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const currentSlides = slides[language] || slides.en
  const isLastSlide = currentSlide === currentSlides.length - 1

  const handleNext = () => {
    if (isLastSlide) {
      onComplete()
    } else {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  const slide = currentSlides[currentSlide]

  return (
    <div className={styles.container}>
      {/* Skip button */}
      {!isLastSlide && (
        <button className={styles.skipBtn} onClick={handleSkip}>
          {language === 'en' ? 'Skip' : 'Saltar'}
        </button>
      )}

      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className={styles.slideContent}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.iconContainer}>
            {slide.isImage ? (
              <img src={slide.icon} alt={slide.title} className={styles.iconImage} />
            ) : (
              <span className={styles.icon}>{slide.icon}</span>
            )}
          </div>
          <h1 className={styles.title}>{slide.title}</h1>
          <p className={styles.subtitle}>{slide.subtitle}</p>
          <p className={styles.description}>{slide.description}</p>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className={styles.progress}>
        {currentSlides.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentSlide ? styles.dotActive : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        <button className="btn-primary" onClick={handleNext} style={{ width: '100%' }}>
          {isLastSlide 
            ? (language === 'en' ? 'Get Started' : 'Comenzar')
            : (language === 'en' ? 'Next' : 'Siguiente')
          }
        </button>
      </div>
    </div>
  )
}

export default Onboarding