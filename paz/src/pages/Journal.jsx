import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { getTranslation, translations } from '../lib/translations'
import { saveJournalEntry } from '../lib/supabase'
import styles from './Journal.module.css'

function Journal() {
  const navigate = useNavigate()
  const { language, user, addJournalEntry } = useStore()
  const t = (key) => getTranslation(language, key)
  
  const [content, setContent] = useState('')
  const [gratitudeItems, setGratitudeItems] = useState(['', '', ''])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [todayPrompt, setTodayPrompt] = useState('')

  // Get a rotating journal prompt based on the day
  useEffect(() => {
    const journalPrompts = translations[language]?.journalPrompts || []
    if (journalPrompts.length > 0) {
      const today = new Date().getDate()
      const promptIndex = today % journalPrompts.length
      setTodayPrompt(journalPrompts[promptIndex])
    }
  }, [language])

  const handleGratitudeChange = (index, value) => {
    const newItems = [...gratitudeItems]
    newItems[index] = value
    setGratitudeItems(newItems)
  }

  const handleSave = async () => {
    if (!user) return
    
    const filledGratitude = gratitudeItems.filter(item => item.trim())
    
    if (!content.trim() && filledGratitude.length === 0) return
    
    setSaving(true)
    
    try {
      const { data, error } = await saveJournalEntry(
        user.id, 
        content.trim(), 
        filledGratitude
      )
      
      if (!error && data) {
        addJournalEntry(data[0])
        setSaved(true)
        
        setTimeout(() => {
          navigate('/')
        }, 1500)
      }
    } catch (err) {
      console.error('Error saving journal:', err)
    } finally {
      setSaving(false)
    }
  }

  const hasContent = content.trim() || gratitudeItems.some(item => item.trim())

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {!saved ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <header className={styles.header}>
              <h1 className={styles.title}>{t('journalTitle')}</h1>
            </header>

            {/* Main Journal Entry */}
            <motion.div 
              className={styles.section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className={styles.label}>{t('journalPrompt')}</label>
              <textarea
                className={styles.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={todayPrompt || (language === 'en' 
                  ? "Write freely... this is your space." 
                  : "Escribe libremente... este es tu espacio.")}
              />
            </motion.div>

            {/* Gratitude Section */}
            <motion.div 
              className={styles.section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className={styles.label}>
                {t('gratitudeTitle')} ✨
              </label>
              <p className={styles.sublabel}>{t('gratitudePrompt')}</p>
              
              <div className={styles.gratitudeList}>
                {gratitudeItems.map((item, index) => (
                  <div key={index} className={styles.gratitudeItem}>
                    <span className={styles.gratitudeNumber}>{index + 1}</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleGratitudeChange(index, e.target.value)}
                      placeholder={language === 'en' 
                        ? "I'm grateful for..." 
                        : "Estoy agradecido/a por..."}
                      className={styles.gratitudeInput}
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.button
              className="btn-primary"
              style={{ 
                width: '100%', 
                marginTop: 'var(--space-lg)',
                opacity: hasContent ? 1 : 0.5
              }}
              onClick={handleSave}
              disabled={!hasContent || saving}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? t('loading') : t('saveEntry')}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            className={styles.success}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={styles.successEmoji}>📝</div>
            <h2 className={styles.successText}>{t('entrySaved')}</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Journal
