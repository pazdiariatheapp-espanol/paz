import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { getTranslation } from '../lib/translations'
import { soundManager, SOUND_NAMES } from '../lib/sounds'
import styles from './Home.module.css'

function Home() {
  const navigate = useNavigate()
  const { language, user, todayMood, streak, soundEnabled } = useStore()
  const t = (key) => getTranslation(language, key)
  const translations = getTranslation(language, 'prompts')
  
  // Get a random daily prompt (same for the whole day)
  const [dailyPrompt, setDailyPrompt] = useState('')
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false)
  
  useEffect(() => {
    const today = new Date().toDateString()
    const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    const promptIndex = seed % translations.length
    setDailyPrompt(translations[promptIndex])
  }, [translations])

  // Play welcome sound once when home loads
  useEffect(() => {
    if (!hasPlayedWelcome && soundEnabled !== false) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        soundManager.play(SOUND_NAMES.WELCOME)
        setHasPlayedWelcome(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [hasPlayedWelcome, soundEnabled])
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (language === 'en') {
      if (hour < 12) return 'Good morning'
      if (hour < 18) return 'Good afternoon'
      return 'Good evening'
    } else {
      if (hour < 12) return 'Buenos días'
      if (hour < 18) return 'Buenas tardes'
      return 'Buenas noches'
    }
  }
  
  const userName = user?.email?.split('@')[0] || ''

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <p className={styles.greeting}>{getGreeting()}</p>
          <h1 className={styles.name}>{userName}</h1>
        </div>
        <button 
          className={styles.settingsBtn}
          onClick={() => navigate('/settings')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
      </motion.header>

      {/* Daily Prompt Card */}
      <motion.div 
        className={`${styles.promptCard} glass-card`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className={styles.promptIcon}>✨</div>
        <p className={styles.promptText}>{dailyPrompt}</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div 
        className={styles.statsRow}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className={`${styles.statCard} glass-card`}>
          <span className={styles.statValue}>{streak}</span>
          <span className={styles.statLabel}>
            {language === 'en' ? 'Day Streak' : 'Días seguidos'}
          </span>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <span className={styles.statEmoji}>
            {todayMood ? getMoodEmoji(todayMood) : '—'}
          </span>
          <span className={styles.statLabel}>
            {language === 'en' ? 'Today' : 'Hoy'}
          </span>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className={styles.actions}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className={styles.sectionTitle}>
          {language === 'en' ? 'Quick Start' : 'Inicio Rápido'}
        </h2>
        
        <div className={styles.actionGrid}>
          <ActionCard
            icon="😊"
            title={t('mood')}
            subtitle={language === 'en' ? 'Check in' : 'Registrar'}
            color="var(--accent-calm)"
            onClick={() => navigate('/mood')}
          />
          <ActionCard
            icon="🌬️"
            title={t('breathe')}
            subtitle={language === 'en' ? '3 min' : '3 min'}
            color="var(--accent-peace)"
            onClick={() => navigate('/breathe')}
          />
          <ActionCard
            icon="🎵"
            title={t('healing')}
            subtitle={language === 'en' ? 'Sounds' : 'Sonidos'}
            color="var(--accent-love)"
            onClick={() => navigate('/healing')}
          />
          <ActionCard
            icon="📊"
            title={t('insights')}
            subtitle={language === 'en' ? 'Progress' : 'Progreso'}
            color="var(--accent-energy)"
            onClick={() => navigate('/insights')}
          />
        </div>
      </motion.div>
    </div>
  )
}

function ActionCard({ icon, title, subtitle, color, onClick }) {
  return (
    <motion.button 
      className={`${styles.actionCard} glass-card glass-card-hover`}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      <div className={styles.actionIcon} style={{ background: `${color}20` }}>
        {icon}
      </div>
      <span className={styles.actionTitle}>{title}</span>
      <span className={styles.actionSubtitle}>{subtitle}</span>
    </motion.button>
  )
}

function getMoodEmoji(mood) {
  const emojis = {
    5: '😄',
    4: '🙂',
    3: '😐',
    2: '😔',
    1: '😢'
  }
  return emojis[mood] || '—'
}

export default Home
