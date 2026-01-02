import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { getTranslation } from '../lib/translations'
import { saveMoodEntry } from '../lib/supabase'
import styles from './MoodCheckIn.module.css'

const moods = [
  { value: 5, emoji: '😄', color: 'var(--mood-great)' },
  { value: 4, emoji: '🙂', color: 'var(--mood-good)' },
  { value: 3, emoji: '😐', color: 'var(--mood-okay)' },
  { value: 2, emoji: '😔', color: 'var(--mood-low)' },
  { value: 1, emoji: '😢', color: 'var(--mood-bad)' },
]

function MoodCheckIn() {
  const navigate = useNavigate()
  const { language, user, setTodayMood, addMoodEntry } = useStore()
  const t = (key) => getTranslation(language, key)
  
  const [selectedMood, setSelectedMood] = useState(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const getMoodLabel = (value) => {
    const labels = {
      5: t('moodGreat'),
      4: t('moodGood'),
      3: t('moodOkay'),
      2: t('moodLow'),
      1: t('moodBad'),
    }
    return labels[value]
  }

  const handleSave = async () => {
    if (!selectedMood || !user) return
    
    setSaving(true)
    
    try {
      const { data, error } = await saveMoodEntry(user.id, selectedMood, note)
      
      if (!error && data) {
        setTodayMood(selectedMood)
        addMoodEntry(data[0])
        setSaved(true)
        
        // Navigate back after showing success
        setTimeout(() => {
          navigate('/')
        }, 1500)
      }
    } catch (err) {
      console.error('Error saving mood:', err)
    } finally {
      setSaving(false)
    }
  }

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
              <h1 className={styles.title}>{t('howAreYou')}</h1>
            </header>

            {/* Mood Selection */}
            <div className={styles.moodGrid}>
              {moods.map((mood, index) => (
                <motion.button
                  key={mood.value}
                  className={`${styles.moodBtn} ${selectedMood === mood.value ? styles.moodBtnActive : ''}`}
                  style={{ 
                    '--mood-color': mood.color,
                    borderColor: selectedMood === mood.value ? mood.color : 'var(--border-glass)'
                  }}
                  onClick={() => setSelectedMood(mood.value)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={styles.moodEmoji}>{mood.emoji}</span>
                  <span className={styles.moodLabel}>{getMoodLabel(mood.value)}</span>
                </motion.button>
              ))}
            </div>

            {/* Note Input */}
            <motion.div 
              className={styles.noteSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: selectedMood ? 1 : 0.5 }}
            >
              <textarea
                className={styles.noteInput}
                placeholder={t('addNote')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={!selectedMood}
              />
            </motion.div>

            {/* Save Button */}
            <motion.button
              className="btn-primary"
              style={{ 
                width: '100%', 
                marginTop: 'var(--space-lg)',
                opacity: selectedMood ? 1 : 0.5
              }}
              onClick={handleSave}
              disabled={!selectedMood || saving}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? t('loading') : t('saveMood')}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            className={styles.success}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={styles.successEmoji}>
              {moods.find(m => m.value === selectedMood)?.emoji}
            </div>
            <h2 className={styles.successText}>{t('moodSaved')}</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MoodCheckIn
