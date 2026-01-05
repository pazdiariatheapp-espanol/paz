import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { getTranslation } from '../lib/translations'
import { soundManager, SOUND_NAMES } from '../lib/sounds'
import styles from './Breathe.module.css'

// Breathing exercise configurations
const EXERCISES = {
  relaxing: {
    name: { en: 'Relaxing Breath', es: 'Respiración Relajante' },
    description: { en: '4-4-6 pattern for calm', es: 'Patrón 4-4-6 para calma' },
    icon: '🌙',
    phases: {
      inhale: 4000,
      hold: 4000,
      exhale: 6000,
    },
    cycles: 4,
    color: '#7eb8da'
  },
  energizing: {
    name: { en: 'Energizing Breath', es: 'Respiración Energizante' },
    description: { en: '4-2-4 pattern for focus', es: 'Patrón 4-2-4 para enfoque' },
    icon: '☀️',
    phases: {
      inhale: 4000,
      hold: 2000,
      exhale: 4000,
    },
    cycles: 6,
    color: '#f4a261'
  },
  box: {
    name: { en: 'Box Breathing', es: 'Respiración Cuadrada' },
    description: { en: '4-4-4-4 pattern for balance', es: 'Patrón 4-4-4-4 para equilibrio' },
    icon: '⬜',
    phases: {
      inhale: 4000,
      hold: 4000,
      exhale: 4000,
      holdEmpty: 4000,
    },
    cycles: 4,
    color: '#a8dadc'
  },
  sleep: {
    name: { en: '4-7-8 Sleep', es: '4-7-8 Para Dormir' },
    description: { en: 'Deep relaxation for sleep', es: 'Relajación profunda para dormir' },
    icon: '😴',
    phases: {
      inhale: 4000,
      hold: 7000,
      exhale: 8000,
    },
    cycles: 3,
    color: '#6c5ce7'
  },
}

function Breathe() {
  const { language, soundEnabled } = useStore()
  const t = (key) => getTranslation(language, key)
  
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState('inhale')
  const [cycle, setCycle] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const exercise = selectedExercise ? EXERCISES[selectedExercise] : null

  const runBreathingCycle = useCallback(() => {
    if (!exercise) return

    const phaseOrder = exercise.phases.holdEmpty 
      ? ['inhale', 'hold', 'exhale', 'holdEmpty']
      : ['inhale', 'hold', 'exhale']
    
    let currentPhaseIndex = 0
    let currentCycle = 0

    const runPhase = () => {
      if (currentCycle >= exercise.cycles) {
        setIsComplete(true)
        setIsActive(false)
        // Fade out sound when complete
        soundManager.fadeOutLoop(1000)
        return
      }

      const currentPhase = phaseOrder[currentPhaseIndex]
      setPhase(currentPhase)

      const timeout = setTimeout(() => {
        currentPhaseIndex++
        
        if (currentPhaseIndex >= phaseOrder.length) {
          currentPhaseIndex = 0
          currentCycle++
          setCycle(currentCycle)
        }
        
        runPhase()
      }, exercise.phases[currentPhase])

      return timeout
    }

    return runPhase()
  }, [exercise])

  useEffect(() => {
    let timeout
    
    if (isActive && !isComplete && exercise) {
      timeout = runBreathingCycle()
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [isActive, isComplete, runBreathingCycle, exercise])

  const handleStart = () => {
    setIsActive(true)
    setIsComplete(false)
    setCycle(0)
    setPhase('inhale')
    
    // Play nature sound for this exercise
    if (soundEnabled !== false && selectedExercise) {
      soundManager.playLoop(selectedExercise)
    }
  }

  const handleReset = () => {
    setIsActive(false)
    setIsComplete(false)
    setCycle(0)
    setPhase('inhale')
    setSelectedExercise(null)
    
    // Stop sound
    soundManager.fadeOutLoop(500)
  }

  const getPhaseAnimation = () => {
    switch (phase) {
      case 'inhale':
        return { scale: 1.4, opacity: 1 }
      case 'hold':
      case 'holdEmpty':
        return { scale: phase === 'hold' ? 1.4 : 1, opacity: 1 }
      case 'exhale':
        return { scale: 1, opacity: 0.6 }
      default:
        return { scale: 1, opacity: 0.6 }
    }
  }

  const getPhaseLabel = () => {
    const labels = {
      inhale: language === 'en' ? 'Inhale' : 'Inhala',
      hold: language === 'en' ? 'Hold' : 'Sostén',
      exhale: language === 'en' ? 'Exhale' : 'Exhala',
      holdEmpty: language === 'en' ? 'Hold' : 'Sostén',
    }
    return labels[phase]
  }

  // Exercise selection screen
  if (!selectedExercise) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('breatheTitle')}</h1>
          <p className={styles.subtitle}>
            {language === 'en' ? 'Choose an exercise' : 'Elige un ejercicio'}
          </p>
        </header>

        <div className={styles.exerciseGrid}>
          {Object.entries(EXERCISES).map(([key, ex], index) => (
            <motion.button
              key={key}
              className={styles.exerciseCard}
              style={{ '--exercise-color': ex.color }}
              onClick={() => setSelectedExercise(key)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={styles.exerciseIcon}>{ex.icon}</span>
              <span className={styles.exerciseName}>{ex.name[language]}</span>
              <span className={styles.exerciseDesc}>{ex.description[language]}</span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={handleReset}>
        ← {language === 'en' ? 'Back' : 'Volver'}
      </button>
      
      <header className={styles.header}>
        <h1 className={styles.title}>{exercise.name[language]}</h1>
        <p className={styles.subtitle}>{exercise.description[language]}</p>
      </header>

      <div className={styles.breatheArea}>
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key="breathing"
              className={styles.circleContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Outer glow */}
              <motion.div
                className={styles.outerGlow}
                style={{ background: `radial-gradient(circle, ${exercise.color} 0%, transparent 70%)` }}
                animate={isActive ? getPhaseAnimation() : { scale: 1, opacity: 0.3 }}
                transition={{ 
                  duration: exercise.phases[phase] / 1000 || 1,
                  ease: 'easeInOut'
                }}
              />
              
              {/* Main circle */}
              <motion.div
                className={styles.breatheCircle}
                style={{ background: `linear-gradient(135deg, ${exercise.color} 0%, ${exercise.color}99 100%)` }}
                animate={isActive ? getPhaseAnimation() : { scale: 1, opacity: 0.6 }}
                transition={{ 
                  duration: exercise.phases[phase] / 1000 || 1,
                  ease: 'easeInOut'
                }}
                onClick={!isActive ? handleStart : undefined}
              >
                <div className={styles.circleInner}>
                  {isActive ? (
                    <span className={styles.phaseText}>{getPhaseLabel()}</span>
                  ) : (
                    <span className={styles.tapText}>{t('tapToStart')}</span>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              className={styles.complete}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className={styles.completeEmoji}>🧘</div>
              <h2 className={styles.completeTitle}>{t('breatheComplete')}</h2>
              <p className={styles.completeText}>{t('sessionComplete')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress */}
      {isActive && !isComplete && (
        <motion.div 
          className={styles.progress}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className={styles.progressDots}>
            {Array.from({ length: exercise.cycles }).map((_, i) => (
              <div
                key={i}
                className={`${styles.progressDot} ${i < cycle ? styles.progressDotComplete : ''} ${i === cycle ? styles.progressDotActive : ''}`}
                style={{ 
                  background: i <= cycle ? exercise.color : undefined,
                  borderColor: i <= cycle ? exercise.color : undefined
                }}
              />
            ))}
          </div>
          <span className={styles.progressText}>
            {cycle + 1} / {exercise.cycles}
          </span>
        </motion.div>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        {isComplete && (
          <div className={styles.completeActions}>
            <button className="btn-primary" onClick={handleStart}>
              {language === 'en' ? 'Repeat' : 'Repetir'}
            </button>
            <button className="btn-glass" onClick={handleReset}>
              {language === 'en' ? 'Other Exercises' : 'Otros Ejercicios'}
            </button>
          </div>
        )}
        {isActive && !isComplete && (
          <button className="btn-glass" onClick={handleReset}>
            {t('cancel')}
          </button>
        )}
      </div>
    </div>
  )
}

export default Breathe
