import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { getTranslation } from '../lib/translations'
import Onboarding from '../components/Onboarding'
import styles from './Welcome.module.css'

function Welcome() {
  const navigate = useNavigate()
  const { language, toggleLanguage, hasSeenOnboarding, setHasSeenOnboarding } = useStore()
  const t = (key) => getTranslation(language, key)

  // Show onboarding for first-time users
  if (!hasSeenOnboarding) {
    return (
      <Onboarding 
        language={language} 
        onComplete={() => setHasSeenOnboarding(true)} 
      />
    )
  }

  return (
    <div className={styles.container}>
      {/* Language toggle */}
      <button className={styles.langToggle} onClick={toggleLanguage}>
        {language === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}
      </button>
      
      {/* Logo/Brand */}
      <motion.div 
        className={styles.hero}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <div className={styles.logoInner} />
          </div>
        </div>
        
        <h1 className={styles.title}>PAZ</h1>
        <p className={styles.tagline}>{t('tagline')}</p>
      </motion.div>
      
      {/* Features */}
      <motion.div 
        className={styles.features}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🌙</span>
          <span className={styles.featureText}>
            {language === 'en' ? 'Track your mood daily' : 'Registra tu ánimo diario'}
          </span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🌬️</span>
          <span className={styles.featureText}>
            {language === 'en' ? 'Breathing exercises' : 'Ejercicios de respiración'}
          </span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>📝</span>
          <span className={styles.featureText}>
            {language === 'en' ? 'Gratitude journal' : 'Diario de gratitud'}
          </span>
        </div>
      </motion.div>
      
      {/* CTA */}
      <motion.div 
        className={styles.cta}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <button 
          className="btn-primary"
          onClick={() => navigate('/pricing')}
          style={{ width: '100%', padding: '16px 32px', fontSize: '1.05rem' }}
        >
          {t('signUp')}
        </button>
        
        <button 
          className="btn-glass"
          onClick={() => navigate('/auth?mode=signin')}
          style={{ width: '100%', marginTop: '12px', padding: '16px 32px' }}
        >
          {t('signIn')}
        </button>
      </motion.div>
    </div>
  )
}

export default Welcome