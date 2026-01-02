import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { getTranslation } from '../lib/translations'
import { signOut } from '../lib/supabase'
import styles from './Settings.module.css'

function Settings() {
  const navigate = useNavigate()
  const { 
    language, 
    toggleLanguage, 
    subscription, 
    notificationsEnabled, 
    setNotificationsEnabled,
    soundEnabled,
    setSoundEnabled,
    theme,
    setTheme,
    setUser 
  } = useStore()
  const t = (key) => getTranslation(language, key)

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    navigate('/welcome')
  }

  const getPlanLabel = () => {
    switch (subscription) {
      case 'premium': return t('premiumPlan')
      case 'premium_plus': return t('premiumPlusPlan')
      default: return t('freePlan')
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('settingsTitle')}</h1>
      </header>

      {/* Language */}
      <motion.section 
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className={styles.sectionTitle}>{t('language')}</h2>
        <div className={`${styles.settingCard} glass-card`}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingIcon}>🌐</span>
              <span className={styles.settingLabel}>
                {language === 'en' ? 'English' : 'Español'}
              </span>
            </div>
            <button 
              className={styles.toggleBtn}
              onClick={toggleLanguage}
            >
              {language === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}
            </button>
          </div>
        </div>
      </motion.section>

      {/* Notifications */}
      <motion.section 
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className={styles.sectionTitle}>{t('notifications')}</h2>
        <div className={`${styles.settingCard} glass-card`}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingIcon}>🔔</span>
              <span className={styles.settingLabel}>{t('dailyReminder')}</span>
            </div>
            <button 
              className={`${styles.switch} ${notificationsEnabled ? styles.switchOn : ''}`}
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <span className={styles.switchThumb} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Sound */}
      <motion.section 
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className={styles.sectionTitle}>{language === 'en' ? 'Sound' : 'Sonido'}</h2>
        <div className={`${styles.settingCard} glass-card`}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingIcon}>🔊</span>
              <span className={styles.settingLabel}>{language === 'en' ? 'Sound effects' : 'Efectos de sonido'}</span>
            </div>
            <button 
              className={`${styles.switch} ${soundEnabled ? styles.switchOn : ''}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              <span className={styles.switchThumb} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Theme */}
      <motion.section 
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className={styles.sectionTitle}>{language === 'en' ? 'Theme' : 'Tema'}</h2>
        <div className={styles.themeGrid}>
          {[
            { id: 'dark', label: language === 'en' ? 'Dark' : 'Oscuro', emoji: '🌙' },
            { id: 'light', label: language === 'en' ? 'Light' : 'Claro', emoji: '☀️' },
            { id: 'ocean', label: language === 'en' ? 'Ocean' : 'Océano', emoji: '🌊' },
            { id: 'sunset', label: language === 'en' ? 'Sunset' : 'Atardecer', emoji: '🌅' },
            { id: 'forest', label: language === 'en' ? 'Forest' : 'Bosque', emoji: '🌲' },
          ].map((t) => (
            <button
              key={t.id}
              className={`${styles.themeBtn} ${theme === t.id ? styles.themeBtnActive : ''}`}
              onClick={() => setTheme(t.id)}
            >
              <span className={styles.themeEmoji}>{t.emoji}</span>
              <span className={styles.themeLabel}>{t.label}</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Subscription */}
      <motion.section 
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className={styles.sectionTitle}>{t('subscription')}</h2>
        <div className={`${styles.settingCard} glass-card`}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingIcon}>⭐</span>
              <div>
                <span className={styles.settingLabel}>{t('currentPlan')}</span>
                <span className={styles.planBadge}>{getPlanLabel()}</span>
              </div>
            </div>
            {subscription === 'free' && (
              <button 
                className={styles.upgradeBtn}
                onClick={() => navigate('/subscription')}
              >
                {t('upgradePlan')}
              </button>
            )}
          </div>
        </div>
      </motion.section>

      {/* Sign Out */}
      <motion.section 
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button 
          className={styles.signOutBtn}
          onClick={handleSignOut}
        >
          {t('signOut')}
        </button>
      </motion.section>

      {/* App Info */}
      <motion.footer 
        className={styles.footer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className={styles.version}>Paz v1.0.0</p>
        <p className={styles.copyright}>
          {language === 'en' 
            ? 'Made with 💙 for your wellbeing' 
            : 'Hecho con 💙 para tu bienestar'}
        </p>
      </motion.footer>
    </div>
  )
}

export default Settings
